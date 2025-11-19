import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mic,
  MicOff,
  Volume2,
  Play,
  Pause,
  MessageSquare,
  Brain,
  Award,
  AlertCircle,
  X,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { Header } from "../components/layout/Header";
import { VivaDebugPanel } from "../components/viva/VivaDebugPanel";
import { useAuthContext } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { ChapterContent } from "../types";

interface VivaQuestion {
  question: string;
}

interface VivaMessage {
  type: "question" | "status" | "error" | "feedback";
  content: string;
  timestamp: Date;
}

interface ConceptScore {
  correctness: number;
  depth: number;
  clarity: number;
}

interface VivaResults {
  scores: Record<string, ConceptScore>;
  feedback: string[];
}
export function VivaPage() {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  // Form state
  const [selectedGrade, setSelectedGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Chapter data
  const [chapterContents, setChapterContents] = useState<ChapterContent[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [availableChapters, setAvailableChapters] = useState<string[]>([]);

  // Viva session state
  const [vivaStarted, setVivaStarted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [messages, setMessages] = useState<VivaMessage[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [vivaResults, setVivaResults] = useState<VivaResults | null>(null);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [answerCount, setAnswerCount] = useState(0);
  const [currentFeedback, setCurrentFeedback] = useState<string | null>(null);

  // WebSocket and audio refs
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const gradeOptions = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: `Grade ${i + 1}`,
  }));

  useEffect(() => {
    fetchChapterContents();
    return () => {
      // Cleanup WebSocket on unmount
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (selectedGrade) {
      const subjects = chapterContents
        .filter((content) => content.grade === selectedGrade)
        .map((content) => content.subject)
        .filter(
          (subject, index, self) => subject && self.indexOf(subject) === index
        );
      setAvailableSubjects(subjects as string[]);
      setSubject("");
      setChapter("");
    }
  }, [selectedGrade, chapterContents]);

  useEffect(() => {
    if (selectedGrade && subject) {
      const chapters = chapterContents
        .filter(
          (content) =>
            content.grade === selectedGrade && content.subject === subject
        )
        .map((content) => content.chapter)
        .filter(
          (chapter, index, self) => chapter && self.indexOf(chapter) === index
        );
      setAvailableChapters(chapters as string[]);
      setChapter("");
    }
  }, [selectedGrade, subject, chapterContents]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChapterContents = async () => {
    try {
      const { data, error } = await supabase
        .from("Chapter_contents")
        .select("*");

      if (error) throw error;
      setChapterContents(data || []);
    } catch (err) {
      console.error("Error fetching chapter contents:", err);
      setError("Failed to load chapter contents");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const addMessage = (type: VivaMessage["type"], content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        type,
        content,
        timestamp: new Date(),
      },
    ]);
  };

  const initializeWebSocket = () => {
    // Always use the external WebSocket endpoint
    const wsUrl = "wss://ldagar315--evater-v1-wrapper.modal.run/ws/viva";

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
      setWsConnected(true);
      addMessage("status", "Connected to Viva session");
    };

    ws.onmessage = (event) => {
      try {
        // Check if the message is JSON or binary
        if (typeof event.data === "string") {
          const data = JSON.parse(event.data);
          console.log("Received from WebSocket:", data);

          if (data.status === "connected") {
            addMessage("status", data.message);
            // Send chapter information after receiving connected status
            const chapterInfo = {
              grade: selectedGrade,
              subject: subject,
              chapter: chapter,
            };
            console.log("Sending chapter info:", chapterInfo);
            ws.send(JSON.stringify(chapterInfo));
          } else if (data.question) {
            setCurrentQuestion(data.question);
            setQuestionCount((prev) => prev + 1);
            setCurrentFeedback(null); // Clear previous feedback
            addMessage("question", data.question);
          } else if (data.answer) {
            setCurrentFeedback(data.answer);
            addMessage("feedback", data.answer);
          } else if (data.feedback) {
            // Final session results
            console.log("Received final feedback:", data.feedback);
            setVivaResults(data.feedback);
            setSessionCompleted(true);
            addMessage(
              "status",
              "Viva session completed! View your results below."
            );
          }
        }
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
        addMessage("error", "Error processing server response");
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      addMessage("error", "Connection error occurred");
      setWsConnected(false);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setWsConnected(false);
      addMessage("status", "Viva session ended");
    };
  };

  const startViva = async () => {
    if (!selectedGrade || !subject || !chapter) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop()); // Stop the test stream

      setVivaStarted(true);
      setMessages([]);
      setSessionStartTime(new Date());
      setQuestionCount(0);
      setAnswerCount(0);
      setCurrentFeedback(null);
      initializeWebSocket();
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Microphone access is required for the viva session");
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    if (!wsConnected || !wsRef.current) {
      addMessage("error", "Not connected to server");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        // Send audio data to WebSocket
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(audioBlob);
          setAnswerCount((prev) => prev + 1);
          addMessage("status", "Answer submitted, processing...");
        }

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      addMessage("status", "Recording your answer...");
    } catch (err) {
      console.error("Error starting recording:", err);
      addMessage("error", "Failed to start recording");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const endViva = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    setVivaStarted(false);
    setWsConnected(false);
    setCurrentQuestion("");
    setMessages([]);
    setVivaResults(null);
    setSessionCompleted(false);
    setSessionStartTime(null);
    setQuestionCount(0);
    setAnswerCount(0);
    setCurrentFeedback(null);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  if (!vivaStarted) {
    return (
      <div className="min-h-screen bg-cream">
        <Header />

        <div className="max-w-2xl mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-4 sm:mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/home")}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center mb-2">
                <Brain className="h-6 w-6 text-primary-600 mr-2" />
                <h2 className="text-xl sm:text-2xl font-bold text-dark">
                  AI Viva Session
                </h2>
              </div>
              <p className="text-sm text-neutral-600">
                Start an interactive viva session with AI. Select your subject
                and chapter to begin.
              </p>
            </CardHeader>

            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  startViva();
                }}
                className="space-y-4 sm:space-y-6"
              >
                <Select
                  label="Grade"
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  options={[
                    { value: "", label: "Select grade" },
                    ...gradeOptions,
                  ]}
                  required
                />

                <Select
                  label="Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  options={[
                    { value: "", label: "Select subject" },
                    ...availableSubjects.map((s) => ({ value: s, label: s })),
                  ]}
                  required
                  disabled={!selectedGrade}
                />

                <Select
                  label="Chapter"
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                  options={[
                    { value: "", label: "Select chapter" },
                    ...availableChapters.map((c) => ({ value: c, label: c })),
                  ]}
                  required
                  disabled={!subject}
                />

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">
                    What to Expect:
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>
                      • AI will ask questions based on your selected chapter
                    </li>
                    <li>• Speak your answers clearly into the microphone</li>
                    <li>• Get real-time feedback and follow-up questions</li>
                    <li>• Session adapts based on your responses</li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  className="w-full flex items-center justify-center h-12 sm:h-14 text-base sm:text-lg"
                  loading={loading}
                  disabled={!selectedGrade || !subject || !chapter}
                >
                  {loading ? (
                    "Starting Viva Session..."
                  ) : (
                    <>
                      <Brain className="h-5 w-5 mr-2" />
                      Start Viva Session
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pb-20">
      <Header />

      <div className="w-full mx-auto py-2 sm:py-4 px-0 sm:px-4 lg:px-8 max-w-4xl">
        {/* Session Header - Compact on Mobile */}
        <div className="bg-white border-b sm:border sm:rounded-lg sm:mb-4 shadow-sm">
          <div className="p-3 sm:p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-dark mb-1 truncate">
                  AI Viva
                </h1>
                <p className="text-xs sm:text-sm text-neutral-600 truncate">
                  {subject} - {chapter}
                </p>
                <p className="text-xs text-neutral-500 sm:hidden">
                  Grade {selectedGrade}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                <div
                  className={`flex items-center px-2 py-1 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm ${
                    wsConnected
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full mr-1.5 ${
                      wsConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
                    }`}
                  ></div>
                  <span className="hidden sm:inline">
                    {wsConnected ? "Connected" : "Disconnected"}
                  </span>
                  <span className="sm:hidden">{wsConnected ? "●" : "○"}</span>
                </div>
                <Button
                  variant="outline"
                  onClick={endViva}
                  size="sm"
                  className="text-xs sm:text-sm h-8 sm:h-10"
                >
                  <X className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                  <span className="hidden sm:inline">End</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Current Question - Prominent and Centered */}
        {currentQuestion && (
          <div className="mx-2 sm:mx-0 mb-4 animate-fade-in">
            <Card className="bg-gradient-to-br from-primary-50 via-primary-100 to-primary-50 border-primary-200 shadow-md">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                    <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold text-primary-900 mb-1 sm:mb-2">
                      Question:
                    </h3>
                    <p className="text-lg sm:text-xl md:text-2xl font-medium text-primary-900 leading-relaxed break-words">
                      {currentQuestion}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Current Feedback - Shows immediately after answer */}
        {currentFeedback && (
          <div className="mx-2 sm:mx-0 mb-4 animate-slide-up">
            <Card className="bg-gradient-to-br from-green-50 via-green-100 to-green-50 border-green-200 shadow-md">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs sm:text-sm font-semibold text-green-900 mb-1">
                      AI Feedback:
                    </h3>
                    <p className="text-sm sm:text-base text-green-800 leading-relaxed break-words">
                      {currentFeedback}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recording Controls - Big and Accessible */}
        <div className="fixed bottom-0 left-0 right-0 sm:relative bg-white sm:bg-transparent border-t sm:border-0 shadow-lg sm:shadow-none p-3 sm:p-0 sm:mx-2 sm:mb-4">
          <Card className="sm:shadow-md border-0 sm:border">
            <CardContent className="p-3 sm:p-6">
              <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                {!isRecording ? (
                  <Button
                    onClick={startRecording}
                    disabled={!wsConnected || !currentQuestion}
                    size="lg"
                    className="w-full sm:w-auto flex items-center justify-center px-6 sm:px-12 h-14 sm:h-16 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    <Mic className="h-6 w-6 sm:h-7 sm:w-7 mr-2 sm:mr-3" />
                    Start Recording Answer
                  </Button>
                ) : (
                  <Button
                    onClick={stopRecording}
                    variant="secondary"
                    size="lg"
                    className="w-full sm:w-auto flex items-center justify-center px-6 sm:px-12 h-14 sm:h-16 text-base sm:text-lg font-semibold bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transition-all"
                  >
                    <MicOff className="h-6 w-6 sm:h-7 sm:w-7 mr-2 sm:mr-3" />
                    Stop Recording
                  </Button>
                )}

                {isRecording && (
                  <div className="flex items-center text-red-600">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
                    <span className="font-semibold text-sm sm:text-base">
                      Recording in progress...
                    </span>
                  </div>
                )}

                {!wsConnected && (
                  <div className="flex items-center text-neutral-500 text-xs sm:text-sm">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <span>Waiting for connection to server...</span>
                  </div>
                )}

                {wsConnected && !currentQuestion && (
                  <div className="flex items-center text-neutral-500 text-xs sm:text-sm">
                    <Brain className="h-4 w-4 mr-2 animate-pulse" />
                    <span>AI is preparing your first question...</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Session History - Collapsible on Mobile */}
        <div className="mx-2 sm:mx-0 mb-4 mt-4 sm:mt-0">
          <Card className={sessionCompleted ? "mb-6" : ""}>
            <CardHeader className="bg-neutral-50 border-b">
              <h3 className="text-base sm:text-lg font-semibold text-dark">
                Session History
              </h3>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-64 sm:max-h-96 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-6 sm:py-8">
                    <MessageSquare className="h-10 w-10 sm:h-12 sm:w-12 text-neutral-400 mx-auto mb-3 sm:mb-4" />
                    <p className="text-sm sm:text-base text-neutral-500">
                      Viva session will begin shortly...
                    </p>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex items-start space-x-2 sm:space-x-3 p-3 sm:p-4 rounded-lg ${
                        message.type === "question"
                          ? "bg-primary-50"
                          : message.type === "error"
                          ? "bg-red-50"
                          : message.type === "feedback"
                          ? "bg-green-50"
                          : "bg-neutral-50"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.type === "question"
                            ? "bg-primary-500"
                            : message.type === "error"
                            ? "bg-red-500"
                            : message.type === "feedback"
                            ? "bg-green-500"
                            : "bg-neutral-500"
                        }`}
                      >
                        {message.type === "question" ? (
                          <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                        ) : message.type === "error" ? (
                          <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                        ) : message.type === "feedback" ? (
                          <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                        ) : (
                          <Brain className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1 gap-2">
                          <span
                            className={`text-xs sm:text-sm font-medium truncate ${
                              message.type === "question"
                                ? "text-primary-900"
                                : message.type === "error"
                                ? "text-red-900"
                                : message.type === "feedback"
                                ? "text-green-900"
                                : "text-neutral-900"
                            }`}
                          >
                            {message.type === "question"
                              ? "AI Question"
                              : message.type === "error"
                              ? "Error"
                              : message.type === "feedback"
                              ? "AI Feedback"
                              : "System"}
                          </span>
                          <span className="text-[10px] sm:text-xs text-neutral-500 flex-shrink-0">
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                        <p
                          className={`text-xs sm:text-sm break-words ${
                            message.type === "question"
                              ? "text-primary-800"
                              : message.type === "error"
                              ? "text-red-800"
                              : message.type === "feedback"
                              ? "text-green-800"
                              : "text-neutral-700"
                          }`}
                        >
                          {message.content}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Debug Panel */}
      <VivaDebugPanel
        wsRef={wsRef}
        wsConnected={wsConnected}
        isRecording={isRecording}
        mediaRecorderRef={mediaRecorderRef}
        selectedGrade={selectedGrade}
        subject={subject}
        chapter={chapter}
        sessionStartTime={sessionStartTime || undefined}
        questionCount={questionCount}
        answerCount={answerCount}
      />
    </div>
  );
}
