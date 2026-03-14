import { useState, useEffect, useRef, useCallback } from 'react';

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

export function useSpeechRecognition(onResult: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const shouldBeListeningRef = useRef(false);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  const isSupported = typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  const startRecognition = useCallback(() => {
    if (!isSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'de-DE';
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript;
      onResultRef.current(transcript);
    };

    recognition.onerror = (event: Event) => {
      const errorEvent = event as Event & { error?: string };
      // Don't restart on explicit abort or not-allowed
      if (errorEvent.error === 'aborted' || errorEvent.error === 'not-allowed') {
        shouldBeListeningRef.current = false;
        setIsListening(false);
        recognitionRef.current = null;
        return;
      }
      // For other errors (network, no-speech, etc.), onend will fire and auto-restart
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      // Auto-restart if user hasn't explicitly stopped
      if (shouldBeListeningRef.current) {
        try {
          startRecognition();
        } catch {
          shouldBeListeningRef.current = false;
          setIsListening(false);
        }
        return;
      }
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isSupported]);

  const toggle = useCallback(() => {
    if (!isSupported) return;

    if (shouldBeListeningRef.current && recognitionRef.current) {
      shouldBeListeningRef.current = false;
      recognitionRef.current.stop();
      return;
    }

    shouldBeListeningRef.current = true;
    startRecognition();
  }, [isSupported, startRecognition]);

  useEffect(() => {
    return () => {
      shouldBeListeningRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return { isListening, isSupported, toggle };
}
