// Mock gpt-tokenizer
jest.mock('gpt-tokenizer', () => ({
  encode: jest.fn((text: string) => new Array(Math.ceil(text.length / 4)))
}));

// Mock zod
jest.mock('zod', () => {
  const mockSchema = {
    safeParse: jest.fn((data) => ({ success: true, data })),
    optional: jest.fn(() => mockSchema),
    min: jest.fn(() => mockSchema),
    int: jest.fn(() => mockSchema)
  };

  return {
    z: {
      object: jest.fn(() => mockSchema),
      boolean: jest.fn(() => mockSchema),
      string: jest.fn(() => mockSchema),
      number: jest.fn(() => mockSchema)
    }
  };
});

jest.mock('openai', () => {
  const mockCreate = jest.fn();

  const MockOpenAI = jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mockCreate,
      },
    },
  }));

  class MockAPIError extends Error {
    status?: number;

    constructor(message?: string, status?: number) {
      super(message);
      this.status = status;
    }
  }

  MockOpenAI.APIError = MockAPIError;

  return {
    __esModule: true,
    default: MockOpenAI,
    APIError: MockAPIError,
    mockCreate,
  };
});

const { mockCreate } = jest.requireMock('openai') as { mockCreate: jest.Mock };

describe('Enhanced OpenAI API Implementation', () => {
  beforeEach(() => {
    mockCreate.mockReset();
    jest.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.OPENAI_API_KEY;
    delete process.env.PRICE_GPT41MINI_INPUT_PER_1K;
    delete process.env.PRICE_GPT41MINI_OUTPUT_PER_1K;
  });

  describe('generateContentWithOpenAI', () => {
    it('returns a successful response with enhanced monitoring', async () => {
      const mockResponse = {
        choices: [
          {
            message: { content: 'Enhanced mock completion' },
          },
        ],
        model: 'gpt-4.1-mini',
        usage: {
          prompt_tokens: 10,
          completion_tokens: 20,
          total_tokens: 30,
        },
      };

      mockCreate.mockResolvedValueOnce(mockResponse);
      process.env.OPENAI_API_KEY = 'test-key';

      const { generateContentWithOpenAI } = await import('@/lib/api/openai');

      const result = await generateContentWithOpenAI('System prompt', 'User prompt', {
        max_tokens: 150, // Updated for GPT-4.1-mini compatibility
      });

      expect(result).toEqual({
        success: true,
        content: 'Enhanced mock completion',
        model: 'gpt-4.1-mini',
        usage: {
          prompt_tokens: 10,
          completion_tokens: 20,
          total_tokens: 30,
        },
      });

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          max_tokens: 150, // Updated for GPT-4.1-mini compatibility
          model: 'gpt-4.1-mini',
          temperature: 0.8,
        }),
      );
    });

    it('handles rate limiting correctly', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Rate limited response' } }],
        model: 'gpt-4.1-mini',
        usage: { prompt_tokens: 5, completion_tokens: 10, total_tokens: 15 }
      };

      mockCreate.mockResolvedValueOnce(mockResponse);
      process.env.OPENAI_API_KEY = 'test-key';

      const { generateContentWithOpenAI } = await import('@/lib/api/openai');

      const start = Date.now();
      const result = await generateContentWithOpenAI('System', 'User');
      const duration = Date.now() - start;

      expect(result.success).toBe(true);
      expect(duration).toBeGreaterThan(0); // Should include rate limiting delay
    });

    it('validates model configuration', async () => {
      process.env.OPENAI_API_KEY = 'test-key';

      const { generateContentWithOpenAI } = await import('@/lib/api/openai');

      const result = await generateContentWithOpenAI('System', 'User', { model: 'invalid-model' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unsupported model: invalid-model');
    });
  });

  describe('Token counting and cost estimation', () => {
    it('calculates accurate token counts using gpt-tokenizer', async () => {
      process.env.OPENAI_API_KEY = 'test-key';

      const { estimateTokenCount } = await import('@/lib/api/openai');

      const result = estimateTokenCount('Hello world test text');
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(0);
    });

    it('calculates costs with correct GPT-4.1-mini pricing', async () => {
      process.env.PRICE_GPT41MINI_INPUT_PER_1K = '0.00015';
      process.env.PRICE_GPT41MINI_OUTPUT_PER_1K = '0.0006';

      const { estimateCompletionCost } = await import('@/lib/api/openai');

      const cost = estimateCompletionCost(1000, 500, 'gpt-4.1-mini');

      // Expected: (1000/1000 * 0.00025) + (500/1000 * 0.00200) = 0.00025 + 0.001 = 0.00125
      expect(cost).toBeCloseTo(0.00125, 5);
    });
  });

  describe('Health monitoring', () => {
    it('provides health check information', async () => {
      process.env.OPENAI_API_KEY = 'test-key';

      const { healthCheck, getAPIMetrics } = await import('@/lib/api/openai');

      const health = await healthCheck();
      expect(health.status).toMatch(/healthy|degraded|unhealthy/);
      expect(health.details).toBeDefined();

      const metrics = getAPIMetrics();
      expect(metrics).toHaveProperty('requestCount');
      expect(metrics).toHaveProperty('totalCost');
      expect(metrics).toHaveProperty('averageLatency');
    });
  });

  describe('Error handling with retry logic', () => {
    it('retries on retryable errors', async () => {
      const retryError = new Error('Service unavailable');
      (retryError as any).status = 503;

      const mockResponse = {
        choices: [{ message: { content: 'Success after retry' } }],
        model: 'gpt-4.1-mini',
        usage: { prompt_tokens: 5, completion_tokens: 10, total_tokens: 15 }
      };

      mockCreate
        .mockRejectedValueOnce(retryError)
        .mockResolvedValueOnce(mockResponse);

      process.env.OPENAI_API_KEY = 'test-key';

      const { generateContentWithOpenAI } = await import('@/lib/api/openai');

      const result = await generateContentWithOpenAI('System', 'User');

      expect(result.success).toBe(true);
      expect(result.content).toBe('Success after retry');
      expect(mockCreate).toHaveBeenCalledTimes(2);
    });
  });

  describe('Reasoning effort functionality', () => {
    beforeEach(() => {
      process.env.OPENAI_API_KEY = 'test-key';
    });

    it('applies minimal reasoning effort for simple tasks', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Simple task response' } }],
        model: 'gpt-4.1-mini',
        usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 }
      };

      mockCreate.mockResolvedValueOnce(mockResponse);

      const { generateContentWithOpenAI } = await import('@/lib/api/openai');

      const result = await generateContentWithOpenAI(
        'Generate a simple email',
        'Write a quick thank you note'
      );

      expect(result.success).toBe(true);
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          reasoning_effort: 'minimal'
        })
      );
    });

    it('applies medium reasoning effort for complex tasks', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Complex task response' } }],
        model: 'gpt-4.1-mini',
        usage: { prompt_tokens: 20, completion_tokens: 40, total_tokens: 60 }
      };

      mockCreate.mockResolvedValueOnce(mockResponse);

      const { generateContentWithOpenAI } = await import('@/lib/api/openai');

      const result = await generateContentWithOpenAI(
        'Analyze this complex medical data and provide treatment recommendations',
        'Patient has multiple comorbidities including diabetes, hypertension, and chronic pain. Please analyze the interaction patterns and suggest optimal treatment protocol.'
      );

      expect(result.success).toBe(true);
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          reasoning_effort: 'medium'
        })
      );
    });

    it('applies high reasoning effort for research and diagnostic tasks', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Research task response' } }],
        model: 'gpt-4.1-mini',
        usage: { prompt_tokens: 30, completion_tokens: 60, total_tokens: 90 }
      };

      mockCreate.mockResolvedValueOnce(mockResponse);

      const { generateContentWithOpenAI } = await import('@/lib/api/openai');

      const result = await generateContentWithOpenAI(
        'Conduct comprehensive research analysis',
        'Research the latest evidence-based treatment protocols for chronic conditions and provide detailed analysis with citations and recommendations'
      );

      expect(result.success).toBe(true);
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          reasoning_effort: 'high'
        })
      );
    });

    it('respects explicit reasoning_effort override', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Override response' } }],
        model: 'gpt-4.1-mini',
        usage: { prompt_tokens: 15, completion_tokens: 30, total_tokens: 45 }
      };

      mockCreate.mockResolvedValueOnce(mockResponse);

      const { generateContentWithOpenAI } = await import('@/lib/api/openai');

      const result = await generateContentWithOpenAI(
        'Complex analysis task',
        'This would normally be high reasoning',
        { reasoning_effort: 'minimal' }
      );

      expect(result.success).toBe(true);
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          reasoning_effort: 'minimal'
        })
      );
    });

    it('applies high reasoning effort for medical safety content', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Medical safety response' } }],
        model: 'gpt-4.1-mini',
        usage: { prompt_tokens: 25, completion_tokens: 50, total_tokens: 75 }
      };

      mockCreate.mockResolvedValueOnce(mockResponse);

      const { generateContentWithOpenAI } = await import('@/lib/api/openai');

      const result = await generateContentWithOpenAI(
        'Provide medical diagnosis information',
        'Patient presents with chest pain and shortness of breath. What are the potential diagnoses?'
      );

      expect(result.success).toBe(true);
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          reasoning_effort: 'high'
        })
      );
    });

    it('tracks reasoning effort in metrics', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Metrics test response' } }],
        model: 'gpt-4.1-mini',
        usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 }
      };

      mockCreate.mockResolvedValueOnce(mockResponse);

      const { generateContentWithOpenAI, getAPIMetrics } = await import('@/lib/api/openai');

      await generateContentWithOpenAI(
        'Simple task for metrics',
        'Basic request'
      );

      const metrics = getAPIMetrics();
      expect(metrics).toHaveProperty('reasoningEffortStats');
      expect(metrics.reasoningEffortStats).toHaveProperty('minimal');
      expect(metrics.reasoningEffortStats).toHaveProperty('medium');
      expect(metrics.reasoningEffortStats).toHaveProperty('high');
    });

    it('does not apply reasoning_effort for non-reasoning models', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Non-reasoning model response' } }],
        model: 'gpt-4',
        usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 }
      };

      mockCreate.mockResolvedValueOnce(mockResponse);

      const { generateContentWithOpenAI } = await import('@/lib/api/openai');

      const result = await generateContentWithOpenAI(
        'Test prompt',
        'Test user prompt',
        { model: 'gpt-4' }
      );

      expect(result.success).toBe(true);
      expect(mockCreate).toHaveBeenCalledWith(
        expect.not.objectContaining({
          reasoning_effort: expect.anything()
        })
      );
    });
  });
});
