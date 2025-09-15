// Unit tests for DiagnosisCodeFinder component

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DiagnosisCodeFinder } from './diagnosis-code-finder';

// Mock fetch for API calls
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('DiagnosisCodeFinder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders initial state correctly', () => {
    render(<DiagnosisCodeFinder />);

    expect(screen.getByText('DCSPH Code Finder')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Beschrijf de klacht/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Vind Code/ })).toBeInTheDocument();
    expect(screen.getByText(/Tips voor betere resultaten/)).toBeInTheDocument();
  });

  test('handles user input correctly', async () => {
    const user = userEvent.setup();
    render(<DiagnosisCodeFinder />);

    const textarea = screen.getByPlaceholderText(/Beschrijf de klacht/);
    await user.type(textarea, 'kniepijn bij traplopen');

    expect(textarea).toHaveValue('kniepijn bij traplopen');
  });

  test('submits query and shows loading state', async () => {
    const user = userEvent.setup();

    // Mock successful API response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        suggestions: [
          {
            code: '7920',
            name: 'Epicondylitis/tendinitis/tendovaginitis – knie/onderbeen/voet',
            rationale: 'Test rationale',
            confidence: 0.85
          }
        ],
        needsClarification: false,
        conversationId: 'test-id'
      })
    } as Response);

    render(<DiagnosisCodeFinder />);

    const textarea = screen.getByPlaceholderText(/Beschrijf de klacht/);
    const submitButton = screen.getByRole('button', { name: /Vind Code/ });

    await user.type(textarea, 'kniepijn');

    await act(async () => {
      await user.click(submitButton);
    });

    // Check loading state
    expect(screen.getByText('Verwerken...')).toBeInTheDocument();

    // Wait for results
    await waitFor(() => {
      expect(screen.getByText('7920')).toBeInTheDocument();
    });
  });

  test('handles clarification flow', async () => {
    const user = userEvent.setup();

    // Mock clarification response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        suggestions: [],
        needsClarification: true,
        clarifyingQuestion: 'In welke lichaamsregio bevinden de klachten zich?',
        conversationId: 'test-id'
      })
    } as Response);

    render(<DiagnosisCodeFinder />);

    const textarea = screen.getByPlaceholderText(/Beschrijf de klacht/);
    const submitButton = screen.getByRole('button', { name: /Vind Code/ });

    await user.type(textarea, 'pijn');

    await act(async () => {
      await user.click(submitButton);
    });

    // Wait for clarification question
    await waitFor(() => {
      expect(screen.getByText('In welke lichaamsregio bevinden de klachten zich?')).toBeInTheDocument();
    });

    // Check that button text changed
    expect(screen.getByRole('button', { name: /Antwoorden/ })).toBeInTheDocument();

    // Check placeholder changed
    expect(screen.getByPlaceholderText('Geef meer details...')).toBeInTheDocument();
  });

  test('handles API errors gracefully', async () => {
    const user = userEvent.setup();

    // Mock error response
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: { message: 'Test error message' }
      })
    } as Response);

    render(<DiagnosisCodeFinder />);

    const textarea = screen.getByPlaceholderText(/Beschrijf de klacht/);
    const submitButton = screen.getByRole('button', { name: /Vind Code/ });

    await user.type(textarea, 'test query');

    await act(async () => {
      await user.click(submitButton);
    });

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Er is een fout opgetreden')).toBeInTheDocument();
      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });
  });

  test('handles network errors', async () => {
    const user = userEvent.setup();

    // Mock network error
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<DiagnosisCodeFinder />);

    const textarea = screen.getByPlaceholderText(/Beschrijf de klacht/);
    const submitButton = screen.getByRole('button', { name: /Vind Code/ });

    await user.type(textarea, 'test query');

    await act(async () => {
      await user.click(submitButton);
    });

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Er is een fout opgetreden')).toBeInTheDocument();
    });
  });

  test('displays suggestions correctly', async () => {
    const user = userEvent.setup();

    const mockSuggestions = [
      {
        code: '7920',
        name: 'Epicondylitis/tendinitis/tendovaginitis – knie/onderbeen/voet',
        rationale: 'Kniepijn past bij tendinitis',
        confidence: 0.9
      },
      {
        code: '7921',
        name: 'Bursitis/capsulitis – knie/onderbeen/voet',
        rationale: 'Alternatief voor kniepijn',
        confidence: 0.7
      }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        suggestions: mockSuggestions,
        needsClarification: false,
        conversationId: 'test-id'
      })
    } as Response);

    render(<DiagnosisCodeFinder />);

    const textarea = screen.getByPlaceholderText(/Beschrijf de klacht/);
    const submitButton = screen.getByRole('button', { name: /Vind Code/ });

    await user.type(textarea, 'kniepijn');

    await act(async () => {
      await user.click(submitButton);
    });

    // Wait for suggestions
    await waitFor(() => {
      expect(screen.getByText('DCSPH Code Suggesties')).toBeInTheDocument();
      expect(screen.getByText('7920')).toBeInTheDocument();
      expect(screen.getByText('7921')).toBeInTheDocument();
    });
  });

  test('handles code copying', async () => {
    const user = userEvent.setup();

    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve()),
      },
    });

    const mockSuggestions = [
      {
        code: '7920',
        name: 'Test code',
        rationale: 'Test rationale',
        confidence: 0.9
      }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        suggestions: mockSuggestions,
        needsClarification: false,
        conversationId: 'test-id'
      })
    } as Response);

    render(<DiagnosisCodeFinder />);

    const textarea = screen.getByPlaceholderText(/Beschrijf de klacht/);
    const submitButton = screen.getByRole('button', { name: /Vind Code/ });

    await user.type(textarea, 'test');

    await act(async () => {
      await user.click(submitButton);
    });

    // Wait for suggestions and find copy button
    await waitFor(() => {
      expect(screen.getByText('7920')).toBeInTheDocument();
    });

    // Click on copy button (first one found)
    const copyButtons = screen.getAllByRole('button');
    const copyButton = copyButtons.find(button =>
      button.querySelector('svg') && !button.textContent?.includes('Vind')
    );

    if (copyButton) {
      await user.click(copyButton);

      // Check if clipboard.writeText was called
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('7920');
    }
  });

  test('handles keyboard shortcuts', async () => {
    const user = userEvent.setup();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        suggestions: [],
        needsClarification: true,
        clarifyingQuestion: 'Test question',
        conversationId: 'test-id'
      })
    } as Response);

    render(<DiagnosisCodeFinder />);

    const textarea = screen.getByPlaceholderText(/Beschrijf de klacht/);
    await user.type(textarea, 'test query');

    // Simulate Cmd+Enter (on Mac) or Ctrl+Enter (on PC)
    await act(async () => {
      await user.keyboard('{Control>}{Enter}');
    });

    // Should trigger form submission
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  test('clears conversation correctly', async () => {
    const user = userEvent.setup();

    // First, create a conversation
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        suggestions: [{
          code: '7920',
          name: 'Test',
          rationale: 'Test',
          confidence: 0.8
        }],
        needsClarification: false,
        conversationId: 'test-id'
      })
    } as Response);

    render(<DiagnosisCodeFinder />);

    const textarea = screen.getByPlaceholderText(/Beschrijf de klacht/);
    const submitButton = screen.getByRole('button', { name: /Vind Code/ });

    await user.type(textarea, 'test');

    await act(async () => {
      await user.click(submitButton);
    });

    // Wait for results
    await waitFor(() => {
      expect(screen.getByText('DCSPH Code Suggesties')).toBeInTheDocument();
    });

    // Click clear/new search button
    const clearButton = screen.getByRole('button', { name: /Nieuwe zoekopdracht/ });
    await user.click(clearButton);

    // Check that conversation is cleared
    expect(screen.queryByText('DCSPH Code Suggesties')).not.toBeInTheDocument();
    expect(screen.getByText(/Tips voor betere resultaten/)).toBeInTheDocument();
  });

  test('handles onCodeSelected callback', async () => {
    const mockCallback = jest.fn();
    const user = userEvent.setup();

    const mockSuggestions = [
      {
        code: '7920',
        name: 'Test code',
        rationale: 'Test rationale',
        confidence: 0.9
      }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        suggestions: mockSuggestions,
        needsClarification: false,
        conversationId: 'test-id'
      })
    } as Response);

    render(<DiagnosisCodeFinder onCodeSelected={mockCallback} />);

    const textarea = screen.getByPlaceholderText(/Beschrijf de klacht/);
    const submitButton = screen.getByRole('button', { name: /Vind Code/ });

    await user.type(textarea, 'test');

    await act(async () => {
      await user.click(submitButton);
    });

    // Wait for suggestions and click on a card
    await waitFor(() => {
      expect(screen.getByText('7920')).toBeInTheDocument();
    });

    // Click on the suggestion card
    const suggestionCard = screen.getByText('7920').closest('[role]') || screen.getByText('7920').closest('div');
    if (suggestionCard) {
      await user.click(suggestionCard);
      expect(mockCallback).toHaveBeenCalledWith(mockSuggestions[0]);
    }
  });

  test('handles embedded mode correctly', () => {
    render(<DiagnosisCodeFinder embedded={true} />);

    expect(screen.getByText('Geïntegreerd')).toBeInTheDocument();
  });

  test('handles initial query prop', () => {
    render(<DiagnosisCodeFinder initialQuery="initial test query" />);

    const textarea = screen.getByPlaceholderText(/Beschrijf de klacht/);
    expect(textarea).toHaveValue('initial test query');
  });

  test('prevents submission with empty query', async () => {
    const user = userEvent.setup();
    render(<DiagnosisCodeFinder />);

    const submitButton = screen.getByRole('button', { name: /Vind Code/ });

    // Button should be disabled when no text is entered
    expect(submitButton).toBeDisabled();

    // Try to click anyway
    await user.click(submitButton);

    // Should not make API call
    expect(mockFetch).not.toHaveBeenCalled();
  });

  test('accessibility: proper labels and roles', () => {
    render(<DiagnosisCodeFinder />);

    // Check for proper labeling
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Vind Code/ })).toBeInTheDocument();

    // Check for headings
    expect(screen.getByRole('heading', { name: 'DCSPH Code Finder' })).toBeInTheDocument();
  });
});