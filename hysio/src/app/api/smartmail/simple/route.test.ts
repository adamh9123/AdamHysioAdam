import type { NextRequest } from 'next/server';
import type { SimpleEmailRequest } from '@/lib/types/smartmail-simple';

jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => data,
    }),
  },
}));

type PostHandler = typeof import('./route').POST;

describe('SmartMail simple POST handler', () => {
  let postHandler!: PostHandler;
  const originalApiKey = process.env.OPENAI_API_KEY;
  const originalFetch = globalThis.fetch;
  const globalWithFetch = globalThis as typeof globalThis & { fetch?: typeof fetch };

  beforeAll(async () => {
    ({ POST: postHandler } = await import('./route'));
  });

  afterEach(() => {
    jest.clearAllMocks();

    if (originalApiKey === undefined) {
      delete process.env.OPENAI_API_KEY;
    } else {
      process.env.OPENAI_API_KEY = originalApiKey;
    }

    if (originalFetch) {
      globalWithFetch.fetch = originalFetch;
    } else {
      delete globalWithFetch.fetch;
    }
  });

  it('returns fallback email when parsing the request fails', async () => {
    delete process.env.OPENAI_API_KEY;

    const request = {
      json: jest.fn().mockRejectedValue(new Error('Invalid JSON payload')),
    } as unknown as NextRequest;

    const response = await postHandler(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.email).toContain('Beste collega');
    expect(data.email).toContain('Update over uw behandeling.');
  });

  it('returns fallback email when the OpenAI call fails', async () => {
    process.env.OPENAI_API_KEY = 'test-api-key';

    const requestBody: SimpleEmailRequest = {
      recipientType: 'patient',
      subject: 'Test onderwerp',
      context: 'Test context',
      length: 'kort',
    };

    const request = {
      json: jest.fn().mockResolvedValue(requestBody),
    } as unknown as NextRequest;

    const fetchMock = jest.fn().mockRejectedValue(new Error('OpenAI failure'));
    globalWithFetch.fetch = fetchMock as unknown as typeof fetch;

    const response = await postHandler(request);
    const data = await response.json();

    expect(fetchMock).toHaveBeenCalled();
    expect(data.success).toBe(true);
    expect(data.email).toContain('Beste patiënt');
    expect(data.email).toContain('Test context');
    expect(data.email).toContain('Fallback mode');
  });
});
