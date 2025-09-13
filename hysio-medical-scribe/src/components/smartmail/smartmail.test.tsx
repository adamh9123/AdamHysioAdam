// Comprehensive test suite for SmartMail components
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import { SmartMailInterface } from './smartmail-interface';
import { RecipientSelector } from './recipient-selector';
import { ContextDefinition } from './context-definition';
import { EmailReviewEditor } from './email-review-editor';

// Mock fetch
global.fetch = jest.fn();

describe('SmartMail Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        template: {
          id: 'test-template',
          subject: 'Test Subject',
          content: 'Test content',
          formattedContent: { html: 'Test content', plainText: 'Test content' },
          metadata: {
            recipientCategory: 'patient',
            objective: 'patient_education',
            language: 'nl',
            wordCount: 2,
            estimatedReadingTime: 1,
            formalityLevel: 'empathetic',
            includedDisclaimer: false
          },
          generatedAt: new Date().toISOString(),
          userId: 'test-user',
          requestId: 'test-request'
        }
      })
    });
  });

  describe('SmartMailInterface', () => {
    test('renders main interface', () => {
      render(<SmartMailInterface />);
      expect(screen.getByText('SmartMail')).toBeInTheDocument();
      expect(screen.getByText('AI-geassisteerd')).toBeInTheDocument();
    });

    test('shows progress indicator', () => {
      render(<SmartMailInterface showProgress={true} />);
      expect(screen.getByText('Voortgang')).toBeInTheDocument();
    });

    test('can reset workflow', () => {
      render(<SmartMailInterface />);
      const resetButton = screen.getByText('Reset');
      fireEvent.click(resetButton);
      // Should reset to initial state
    });
  });

  describe('RecipientSelector', () => {
    test('renders recipient options', () => {
      const mockOnChange = jest.fn();
      render(
        <RecipientSelector 
          value={{}} 
          onChange={mockOnChange} 
        />
      );
      
      expect(screen.getByText('Patiënt')).toBeInTheDocument();
      expect(screen.getByText('Specialist')).toBeInTheDocument();
      expect(screen.getByText('Collega')).toBeInTheDocument();
    });

    test('handles recipient selection', () => {
      const mockOnChange = jest.fn();
      render(
        <RecipientSelector 
          value={{}} 
          onChange={mockOnChange} 
        />
      );
      
      fireEvent.click(screen.getByText('Patiënt'));
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'patient'
        })
      );
    });

    test('shows formality recommendations', () => {
      const mockOnChange = jest.fn();
      render(
        <RecipientSelector 
          value={{ category: 'patient' }} 
          onChange={mockOnChange} 
        />
      );
      
      expect(screen.getByText('Empathisch')).toBeInTheDocument();
      expect(screen.getByText('Aanbevolen')).toBeInTheDocument();
    });
  });

  describe('ContextDefinition', () => {
    test('renders objective options', () => {
      const mockOnChange = jest.fn();
      render(
        <ContextDefinition 
          value={{}} 
          onChange={mockOnChange} 
        />
      );
      
      expect(screen.getByText('Verwijzing')).toBeInTheDocument();
      expect(screen.getByText('Follow-up')).toBeInTheDocument();
      expect(screen.getByText('Patiënt educatie')).toBeInTheDocument();
    });

    test('handles objective selection', () => {
      const mockOnChange = jest.fn();
      render(
        <ContextDefinition 
          value={{}} 
          onChange={mockOnChange} 
        />
      );
      
      fireEvent.click(screen.getByText('Verwijzing'));
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          objective: 'referral'
        })
      );
    });
  });

  describe('EmailReviewEditor', () => {
    const mockTemplate = {
      id: 'test-template',
      subject: 'Test Subject',
      content: 'Test content for editing',
      formattedContent: { 
        html: 'Test content for editing', 
        plainText: 'Test content for editing' 
      },
      metadata: {
        recipientCategory: 'patient' as const,
        objective: 'patient_education' as const,
        language: 'nl' as const,
        wordCount: 4,
        estimatedReadingTime: 1,
        formalityLevel: 'empathetic' as const,
        includedDisclaimer: false
      },
      generatedAt: new Date().toISOString(),
      userId: 'test-user',
      requestId: 'test-request'
    };

    test('renders email content', () => {
      const mockOnChange = jest.fn();
      render(
        <EmailReviewEditor 
          template={mockTemplate}
          onChange={mockOnChange}
        />
      );
      
      expect(screen.getByDisplayValue('Test Subject')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test content for editing')).toBeInTheDocument();
    });

    test('can toggle preview mode', () => {
      const mockOnChange = jest.fn();
      render(
        <EmailReviewEditor 
          template={mockTemplate}
          onChange={mockOnChange}
        />
      );
      
      const previewButton = screen.getByText('Voorbeeld');
      fireEvent.click(previewButton);
      expect(screen.getByText('Bewerken')).toBeInTheDocument();
    });

    test('handles content editing', () => {
      const mockOnChange = jest.fn();
      render(
        <EmailReviewEditor 
          template={mockTemplate}
          onChange={mockOnChange}
        />
      );
      
      const subjectInput = screen.getByDisplayValue('Test Subject');
      fireEvent.change(subjectInput, { target: { value: 'Updated Subject' } });
      
      const saveButton = screen.getByText('Opslaan');
      fireEvent.click(saveButton);
      
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Updated Subject'
        })
      );
    });

    test('shows word count and reading time', () => {
      const mockOnChange = jest.fn();
      render(
        <EmailReviewEditor 
          template={mockTemplate}
          onChange={mockOnChange}
        />
      );
      
      expect(screen.getByText('4 woorden')).toBeInTheDocument();
      expect(screen.getByText('1 min leestijd')).toBeInTheDocument();
    });
  });

  describe('Integration workflow', () => {
    test('complete email generation workflow', async () => {
      const mockOnEmailGenerated = jest.fn();
      
      render(
        <SmartMailInterface 
          onEmailGenerated={mockOnEmailGenerated}
        />
      );
      
      // Should start with recipient selection
      expect(screen.getByText('Ontvanger selecteren')).toBeInTheDocument();
      
      // Select recipient
      fireEvent.click(screen.getByText('Patiënt'));
      
      // Context should become available
      await waitFor(() => {
        expect(screen.getByText('Context en doel definiëren')).toBeInTheDocument();
      });
      
      // Fill context
      const subjectInput = screen.getByPlaceholderText('Korte omschrijving van het onderwerp');
      fireEvent.change(subjectInput, { target: { value: 'Test onderwerp' } });
      
      const backgroundTextarea = screen.getByPlaceholderText('Relevante context en achtergrond informatie');
      fireEvent.change(backgroundTextarea, { target: { value: 'Test achtergrond' } });
      
      // Select objective
      fireEvent.click(screen.getByText('Patiënt educatie'));
      
      // Generate email
      const generateButton = screen.getByText('Genereer Email');
      fireEvent.click(generateButton);
      
      // Should show loading state
      expect(screen.getByText('Email wordt gegenereerd...')).toBeInTheDocument();
      
      // Wait for completion
      await waitFor(() => {
        expect(mockOnEmailGenerated).toHaveBeenCalled();
      });
    });
  });
});