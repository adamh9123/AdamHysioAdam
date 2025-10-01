'use client';

import * as React from 'react';
import { cn, formatDuration } from '@/lib/utils';
import { useAudioRecorder, type UseAudioRecorderOptions } from '@/hooks/useAudioRecorder';
import { transcribeAudio } from '@/lib/api/transcription';
import { Button } from './button';
import { Spinner } from './spinner';
import { Badge } from './badge';
import { Card, CardContent } from './card';
import {
  Mic,
  MicOff,
  Play,
  Pause,
  Square,
  Upload,
  RotateCcw,
  FileAudio,
  CheckCircle,
  AlertCircle,
  X,
  Volume2
} from 'lucide-react';
import type { AudioTranscription } from '@/lib/types';

export interface UnifiedAudioInputProps extends React.HTMLAttributes<HTMLDivElement> {
  // Core callbacks
  onAudioReady?: (blob: Blob, duration: number, source: 'recording' | 'upload') => void;
  onTranscriptionComplete?: (transcription: AudioTranscription) => void;
  onError?: (error: string) => void;

  // Recording options
  maxDuration?: number;
  sampleRate?: number;

  // UI options
  showTimer?: boolean;
  showWaveform?: boolean;
  showTips?: boolean;

  // Upload options
  allowUpload?: boolean;
  maxUploadSize?: number; // MB
  acceptedTypes?: string[];

  // Transcription options
  autoTranscribe?: boolean;
  transcriptionOptions?: {
    language?: string;
    prompt?: string;
    temperature?: number;
  };

  // State
  disabled?: boolean;
  variant?: 'default' | 'compact' | 'minimal';

  // Input method preference
  preferredInputMethod?: 'recording' | 'upload' | 'either';
}

interface AudioInputState {
  activeMethod: 'recording' | 'upload' | null;
  uploadedFile: File | null;
  audioUrl: string | null;
  isPlaying: boolean;
  isTranscribing: boolean;
  transcription: AudioTranscription | null;
  currentTipIndex: number;
  error: string | null;
}

const RECORDING_TIPS = [
  "Praat hardop en duidelijk zodat Hysio kan documenteren!",
  "Vergeet de rode vlaggen niet uit te vragen...",
  "Denk aan de Problematische Handeling",
  "Vraag de Hulpvraag uit!",
  "Neem Hysio mee in je verhaal, spreek volledig uit!",
  "Ontstaansmoment en verloop van de klachten?",
  "Eerdere behandelingen en resultaten?",
  "Hysio luistert mee, dus praat duidelijk!",
  "Functionele beperkingen in ADL, werk of sport?",
  "Maak je redenering hoorbaar – Hysio volgt je denkproces.",
  "Pijn: karakter, intensiteit, uitlokkende factoren?",
  "Mobiliteit, kracht en stabiliteit testen?",
  "Verwachtingen en doelen van de patiënt?",
  "Spreek rustig en concreet zodat Hysio geen details mist",
];

export const UnifiedAudioInput: React.FC<UnifiedAudioInputProps> = React.memo(({
  onAudioReady,
  onTranscriptionComplete,
  onError,
  maxDuration = 1800000, // 30 minutes
  sampleRate = 16000,
  showTimer = true,
  showWaveform = false,
  showTips = true,
  allowUpload = true,
  maxUploadSize = 70, // MB
  acceptedTypes = ['audio/*'],
  autoTranscribe = false,
  transcriptionOptions = {},
  disabled = false,
  variant = 'default',
  preferredInputMethod = 'either',
  className,
  ...props
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const [state, setState] = React.useState<AudioInputState>({
    activeMethod: null,
    uploadedFile: null,
    audioUrl: null,
    isPlaying: false,
    isTranscribing: false,
    transcription: null,
    currentTipIndex: 0,
    error: null,
  });

  // Handle transcription
  const handleTranscription = React.useCallback(async (blob: Blob) => {
    if (!autoTranscribe) return;

    setState(prev => ({ ...prev, isTranscribing: true, error: null }));

    try {
      const result = await transcribeAudio(blob, {
        language: transcriptionOptions.language || 'nl',
        prompt: transcriptionOptions.prompt,
        temperature: transcriptionOptions.temperature || 0.0,
      });

      if (result.success && result.transcript) {
        const transcriptionData: AudioTranscription = {
          text: result.transcript,
          duration: result.duration,
          timestamp: new Date().toISOString(),
        };

        setState(prev => ({ ...prev, transcription: transcriptionData }));
        onTranscriptionComplete?.(transcriptionData);
      } else {
        const errorMsg = result.error || 'Failed to transcribe audio';
        setState(prev => ({ ...prev, error: errorMsg }));
        onError?.(errorMsg);
      }
    } catch (error) {
      const errorMsg = 'Unexpected error during transcription';
      setState(prev => ({ ...prev, error: errorMsg }));
      onError?.(errorMsg);
    } finally {
      setState(prev => ({ ...prev, isTranscribing: false }));
    }
  }, [autoTranscribe, transcriptionOptions, onTranscriptionComplete, onError]);

  // Audio recorder options
  const recorderOptions: UseAudioRecorderOptions = {
    onRecordingComplete: async (blob, duration) => {
      const url = URL.createObjectURL(blob);
      setState(prev => ({
        ...prev,
        activeMethod: 'recording',
        audioUrl: url
      }));

      onAudioReady?.(blob, duration, 'recording');

      if (autoTranscribe) {
        await handleTranscription(blob);
      }
    },
    onError: (error) => {
      setState(prev => ({ ...prev, error }));
      onError?.(error);
    },
    maxDuration,
    sampleRate,
  };

  const [recorderState, recorderControls] = useAudioRecorder(recorderOptions);

  // Handle file upload
  const handleFileUpload = React.useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        const baseType = type.replace('/*', '');
        return file.type.startsWith(baseType);
      }
      return file.type === type;
    })) {
      const errorMsg = 'Please select a valid audio file.';
      setState(prev => ({ ...prev, error: errorMsg }));
      onError?.(errorMsg);
      return;
    }

    // Validate file size
    if (file.size > maxUploadSize * 1024 * 1024) {
      const currentSizeMB = (file.size / (1024 * 1024)).toFixed(1);
      const errorMsg = `Audio bestand te groot (${currentSizeMB}MB). Maximum toegestane grootte is ${maxUploadSize}MB.`;
      setState(prev => ({ ...prev, error: errorMsg }));
      onError?.(errorMsg);
      return;
    }

    const url = URL.createObjectURL(file);
    setState(prev => ({
      ...prev,
      activeMethod: 'upload',
      uploadedFile: file,
      audioUrl: url,
      error: null
    }));

    // Get duration from audio element
    const audio = new Audio(url);
    audio.addEventListener('loadedmetadata', () => {
      const duration = audio.duration * 1000; // Convert to milliseconds

      // Validate duration (60 minutes max)
      const maxDurationMs = 60 * 60 * 1000; // 60 minutes in milliseconds
      if (duration > maxDurationMs) {
        const durationMinutes = Math.round(duration / 1000 / 60);
        const errorMsg = `Audio bestand te lang (${durationMinutes} minuten). Maximum toegestane duur is 60 minuten.`;
        setState(prev => ({ ...prev, error: errorMsg }));
        onError?.(errorMsg);
        URL.revokeObjectURL(url);
        return;
      }

      onAudioReady?.(file, duration, 'upload');
    });

    if (autoTranscribe) {
      await handleTranscription(file);
    }

    // Reset file input
    event.target.value = '';
  }, [acceptedTypes, maxUploadSize, autoTranscribe, handleTranscription, onAudioReady, onError]);

  // Handle drag and drop
  const [dragActive, setDragActive] = React.useState(false);

  const handleDrag = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled || !allowUpload) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      // Create synthetic event for handleFileUpload
      const syntheticEvent = {
        target: { files: [files[0]], value: '' }
      } as React.ChangeEvent<HTMLInputElement>;
      handleFileUpload(syntheticEvent);
    }
  }, [disabled, allowUpload, handleFileUpload]);

  // Audio playback controls
  const togglePlayback = React.useCallback(() => {
    if (!audioRef.current || !state.audioUrl) return;

    if (state.isPlaying) {
      audioRef.current.pause();
      setState(prev => ({ ...prev, isPlaying: false }));
    } else {
      audioRef.current.play();
      setState(prev => ({ ...prev, isPlaying: true }));
    }
  }, [state.audioUrl, state.isPlaying]);

  // Reset all state
  const handleReset = React.useCallback(() => {
    recorderControls.resetRecorder();

    if (state.audioUrl) {
      URL.revokeObjectURL(state.audioUrl);
    }

    setState({
      activeMethod: null,
      uploadedFile: null,
      audioUrl: null,
      isPlaying: false,
      isTranscribing: false,
      transcription: null,
      currentTipIndex: 0,
      error: null,
    });

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  }, [recorderControls, state.audioUrl]);

  // Tip rotation during recording
  React.useEffect(() => {
    if (!recorderState.isRecording || recorderState.isPaused || !showTips) return;

    const tipInterval = setInterval(() => {
      setState(prev => ({
        ...prev,
        currentTipIndex: (prev.currentTipIndex + 1) % RECORDING_TIPS.length
      }));
    }, 8000);

    return () => clearInterval(tipInterval);
  }, [recorderState.isRecording, recorderState.isPaused, showTips]);

  // Reset tip index when recording stops
  React.useEffect(() => {
    if (!recorderState.isRecording) {
      setState(prev => ({ ...prev, currentTipIndex: 0 }));
    }
  }, [recorderState.isRecording]);

  // Cleanup URLs on unmount
  React.useEffect(() => {
    return () => {
      if (state.audioUrl) {
        URL.revokeObjectURL(state.audioUrl);
      }
    };
  }, [state.audioUrl]);

  const { isRecording, isPaused, recordingTime, error: recorderError, isInitializing } = recorderState;
  const currentError = state.error || recorderError;

  const isProcessing = state.isTranscribing || isInitializing;
  const hasAudio = state.audioUrl && !isRecording;
  const showRecordingControls = preferredInputMethod !== 'upload';
  const showUploadControls = preferredInputMethod !== 'recording' && allowUpload;

  // Variant-specific styling
  const getVariantClasses = () => {
    switch (variant) {
      case 'compact':
        return 'space-y-2';
      case 'minimal':
        return 'space-y-1';
      default:
        return 'space-y-4';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${Math.round(bytes / (1024 * 1024))} MB`;
  };

  return (
    <div className={cn(getVariantClasses(), className)} {...props}>
      {/* Error Display */}
      {currentError && variant !== 'minimal' && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600" />
            <p className="text-sm text-red-600">{currentError}</p>
          </div>
        </div>
      )}

      {/* Main Controls */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Recording Controls */}
        {showRecordingControls && (
          <>
            {!isRecording ? (
              <Button
                onClick={recorderControls.startRecording}
                disabled={disabled || isProcessing}
                variant="default"
                size={variant === 'compact' ? 'sm' : 'lg'}
                className="gap-2"
              >
                {isProcessing ? (
                  <Spinner size={variant === 'compact' ? 16 : 20} />
                ) : (
                  <Mic size={variant === 'compact' ? 16 : 20} />
                )}
                {state.isTranscribing ? 'Transcriberen...' : 'Start opname'}
              </Button>
            ) : (
              <Button
                onClick={recorderControls.stopRecording}
                disabled={disabled}
                variant="destructive"
                size={variant === 'compact' ? 'sm' : 'lg'}
                className="gap-2"
              >
                <Square size={variant === 'compact' ? 16 : 20} />
                Stop opname
              </Button>
            )}

            {/* Pause/Resume */}
            {isRecording && variant !== 'minimal' && (
              <Button
                onClick={isPaused ? recorderControls.resumeRecording : recorderControls.pauseRecording}
                disabled={disabled || state.isTranscribing}
                variant="secondary"
                size={variant === 'compact' ? 'sm' : 'lg'}
                className="gap-2"
              >
                {isPaused ? <Play size={variant === 'compact' ? 16 : 20} /> : <Pause size={variant === 'compact' ? 16 : 20} />}
                {isPaused ? 'Hervatten' : 'Pauzeren'}
              </Button>
            )}
          </>
        )}

        {/* Upload Button */}
        {showUploadControls && !isRecording && !state.isTranscribing && (
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            variant="outline"
            size={variant === 'compact' ? 'sm' : 'lg'}
            className="gap-2"
          >
            <Upload size={variant === 'compact' ? 16 : 20} />
            Upload audio
          </Button>
        )}

        {/* Reset */}
        {(hasAudio || isRecording || state.transcription) && variant !== 'minimal' && (
          <Button
            onClick={handleReset}
            disabled={disabled || state.isTranscribing}
            variant="ghost"
            size={variant === 'compact' ? 'sm' : 'lg'}
            className="gap-2"
          >
            <RotateCcw size={variant === 'compact' ? 16 : 20} />
            {variant === 'compact' ? 'Reset' : 'Opnieuw beginnen'}
          </Button>
        )}
      </div>

      {/* Timer */}
      {showTimer && (isRecording || recordingTime > 0) && variant !== 'minimal' && (
        <div className="flex items-center gap-2">
          {isRecording && (
            <div className={cn(
              'w-3 h-3 rounded-full bg-red-500',
              isPaused ? 'animate-none' : 'animate-pulse'
            )} />
          )}
          <span className={cn(
            'font-mono text-hysio-deep-green',
            variant === 'compact' ? 'text-base' : 'text-lg'
          )}>
            {formatDuration(recordingTime / 1000)}
          </span>
          {maxDuration && (
            <span className="text-sm text-hysio-deep-green-900/70">
              / {formatDuration(maxDuration / 1000)}
            </span>
          )}
        </div>
      )}

      {/* Recording Tips */}
      {showTips && isRecording && !isPaused && variant === 'default' && (
        <div className="p-4 bg-hysio-mint/10 border border-hysio-mint/30 rounded-md">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-hysio-mint rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-hysio-deep-green">💡</span>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-hysio-deep-green mb-1">
                Opname Tip:
              </h4>
              <p className="text-sm text-hysio-deep-green/80 leading-relaxed animate-fade-in">
                {RECORDING_TIPS[state.currentTipIndex]}
              </p>
            </div>
          </div>
          <div className="flex justify-center mt-3">
            <div className="flex gap-1">
              {RECORDING_TIPS.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                    index === state.currentTipIndex ? 'bg-hysio-mint' : 'bg-hysio-mint/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Waveform */}
      {showWaveform && isRecording && variant === 'default' && (
        <div className="h-16 bg-hysio-mint/10 rounded-md flex items-center justify-center">
          <div className="flex items-center gap-1">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-1 bg-hysio-mint rounded-full transition-all duration-150',
                  isPaused ? 'h-2' : 'animate-pulse'
                )}
                style={{
                  height: isPaused ? '8px' : `${Math.random() * 48 + 8}px`,
                  animationDelay: `${i * 50}ms`
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Processing Status */}
      {state.isTranscribing && variant !== 'minimal' && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center gap-3">
            <Spinner size={20} />
            <span className="text-sm text-blue-700 font-medium">
              Audio wordt getranscribeerd...
            </span>
          </div>
        </div>
      )}

      {/* File Upload Status */}
      {state.uploadedFile && !isRecording && (
        <Card className="border border-green-200 bg-green-50">
          <CardContent className="flex items-center justify-between py-3 px-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <FileAudio size={16} className="text-green-600" />
              </div>
              <div>
                <p className="font-medium text-green-800 text-sm">
                  {state.uploadedFile.name}
                </p>
                <p className="text-xs text-green-600">
                  {formatFileSize(state.uploadedFile.size)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={disabled || state.isTranscribing}
              className="text-green-700 hover:text-green-800 hover:bg-green-100"
            >
              <X size={14} />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Audio Playback */}
      {hasAudio && variant !== 'minimal' && (
        <div className="p-4 bg-hysio-mint/5 rounded-md border border-hysio-mint/20">
          <div className="flex items-center gap-4">
            <Button
              onClick={togglePlayback}
              disabled={disabled || state.isTranscribing}
              variant="ghost"
              size="icon"
            >
              {state.isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </Button>

            <audio
              ref={audioRef}
              src={state.audioUrl || undefined}
              onPlay={() => setState(prev => ({ ...prev, isPlaying: true }))}
              onPause={() => setState(prev => ({ ...prev, isPlaying: false }))}
              onEnded={() => setState(prev => ({ ...prev, isPlaying: false }))}
              className="flex-1"
              controls
            />
          </div>
        </div>
      )}

      {/* Transcription Result */}
      {state.transcription && !state.isTranscribing && variant !== 'minimal' && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <h4 className="font-medium text-green-800 mb-2">Transcriptie</h4>
          <div className="text-sm text-green-700 bg-white p-3 rounded border border-green-200">
            <p>{state.transcription.text}</p>
          </div>
          {state.transcription.duration && (
            <p className="text-xs text-green-600 mt-2">
              Duur: {formatDuration(state.transcription.duration / 1000)}
            </p>
          )}
        </div>
      )}

      {/* Drag & Drop Upload Area (when no active method) */}
      {showUploadControls && !state.activeMethod && !isRecording && !state.isTranscribing && variant === 'default' && (
        <div
          className={cn(
            'border-2 border-dashed rounded-md p-6 transition-colors',
            dragActive
              ? 'border-hysio-mint bg-hysio-mint/10'
              : disabled
              ? 'border-gray-300 bg-gray-50'
              : 'border-hysio-mint/30 hover:border-hysio-mint/50 hover:bg-hysio-mint/5'
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <Upload className="mx-auto h-8 w-8 text-hysio-deep-green-900/50 mb-2" />
            <p className="text-sm text-hysio-deep-green-900/70 mb-2">
              Sleep audiobestand hier naartoe of
              <Button
                variant="link"
                className="p-0 h-auto text-sm font-medium ml-1"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
              >
                selecteer bestand
              </Button>
            </p>
            <p className="text-xs text-hysio-deep-green-900/50">
              Tot {maxUploadSize}MB • {acceptedTypes.join(', ')}
              {autoTranscribe && <span className="block mt-1">Wordt automatisch getranscribeerd</span>}
            </p>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileUpload}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
});

UnifiedAudioInput.displayName = 'UnifiedAudioInput';