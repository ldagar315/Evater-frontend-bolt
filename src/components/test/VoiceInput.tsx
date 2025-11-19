import React, { useState, useEffect } from "react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "../ui/Button";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  className?: string;
}

export function VoiceInput({ onTranscript, className = "" }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      // @ts-ignore
      const recognitionInstance = new window.webkitSpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;

      recognitionInstance.onresult = (event: any) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          onTranscript(finalTranscript);
        }
      };

      recognitionInstance.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    } else {
      setIsSupported(false);
    }
  }, [onTranscript]);

  const toggleListening = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  if (!isSupported) return null;

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      onClick={toggleListening}
      className={`${className} transition-all duration-200 ${
        isListening ? "bg-red-100 text-red-600 hover:bg-red-200" : ""
      }`}
      title={isListening ? "Stop recording" : "Start voice typing"}
    >
      {isListening ? (
        <>
          <span className="animate-pulse mr-2 h-2 w-2 rounded-full bg-white"></span>
          <MicOff className="h-4 w-4" />
        </>
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </Button>
  );
}
