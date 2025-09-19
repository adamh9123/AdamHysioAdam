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

describe('generateContentWithOpenAI', () => {
  beforeEach(() => {
    mockCreate.mockReset();
  });

  afterEach(() => {
    delete process.env.OPENAI_API_KEY;
  });

  it('returns a successful response when max_tokens is set', async () => {
    const mockResponse = {
      choices: [
        {
          message: { content: 'Mock completion' },
        },
      ],
      model: 'mock-model',
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
      max_tokens: 150,
    });

    expect(result).toEqual({
      success: true,
      content: 'Mock completion',
      model: 'mock-model',
      usage: {
        prompt_tokens: 10,
        completion_tokens: 20,
        total_tokens: 30,
      },
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        max_tokens: 150,
      }),
    );
  });
});
