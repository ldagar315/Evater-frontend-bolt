import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Mic, MicOff, Volume2, Play, Pause, MessageSquare, Brain, Award, AlertCircle } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Header } from '../components/layout/Header'
import { useAuthContext } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { ChapterContent } from '../types'

interface VivaQuestion {
  question: string
}

interface VivaMessage {
  type: 'question' | 'status' | 'error' | 'feedback'
  content: string
  timestamp: Date
}

interface ConceptScore {
  correctness: number
  depth: number
  clarity: number
}

interface VivaResults {
  scores: Record<string, ConceptScore>
  feedback: string[]
}
export function VivaPage() {
  const navigate = useNavigate()
  const { user } = useAuthContext()
  
  // Form state
  const [selectedGrade, setSelectedGrade] = useState('')
  const [subject, setSubject] = useState('')
  const [chapter, setChapter] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Chapter data
  const [chapterContents, setChapterContents] = useState<ChapterContent[]>([])
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([])
  const [availableChapters, setAvailableChapters] = useState<string[]>([])
  
  // Viva session state
  const [vivaStarted, setVivaStarted] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [messages, setMessages] = useState<VivaMessage[]>([])
  const [wsConnected, setWsConnected] = useState(false)
  const [vivaResults, setVivaResults] = useState<VivaResults | null>(null)
  const [sessionCompleted, setSessionCompleted] = useState(false)
  
  // WebSocket and audio refs
  const wsRef = useRef<WebSocket | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const gradeOptions = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: `Grade ${i + 1}`
  }))

  useEffect(() => {
    fetchChapterContents()
    return () => {
      // Cleanup WebSocket on unmount
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  useEffect(() => {
    if (selectedGrade) {
      const subjects = chapterContents
        .filter(content => content.grade === selectedGrade)
        .map(content => content.subject)
        .filter((subject, index, self) => subject && self.indexOf(subject) === index)
      setAvailableSubjects(subjects as string[])
      setSubject('')
      setChapter('')
    }
  }, [selectedGrade, chapterContents])

  useEffect(() => {
    if (selectedGrade && subject) {
      const chapters = chapterContents
        .filter(content => content.grade === selectedGrade && content.subject === subject)
        .map(content => content.chapter)
        .filter((chapter, index, self) => chapter && self.indexOf(chapter) === index)
      setAvailableChapters(chapters as string[])
      setChapter('')
    }
  }, [selectedGrade, subject, chapterContents])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchChapterContents = async () => {
    try {
      const { data, error } = await supabase
        .from('Chapter_contents')
        .select('*')

      if (error) throw error
      setChapterContents(data || [])
    } catch (err) {
      console.error('Error fetching chapter contents:', err)
      setError('Failed to load chapter contents')
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const addMessage = (type: VivaMessage['type'], content: string) => {
    setMessages(prev => [...prev, {
      type,
      content,
      timestamp: new Date()
    }])
  }

  const initializeWebSocket = () => {
    // Always use the external WebSocket endpoint
    const wsUrl = 'wss://ldagar315--evater-v1-wrapper.modal.run/ws/viva'

    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      console.log('WebSocket connected')
      setWsConnected(true)
      addMessage('status', 'Connected to Viva session')
    }

    ws.onmessage = (event) => {
      try {
        // Check if the message is JSON or binary
        if (typeof event.data === 'string') {
          const data = JSON.parse(event.data)
          console.log('Received from WebSocket:', data)
          
          if (data.status === 'connected') {
            addMessage('status', data.message)
            // Send chapter information after receiving connected status
            const chapterInfo = {
              grade: selectedGrade,
              subject: subject,
              chapter: chapter
            }
            console.log('Sending chapter info:', chapterInfo)
            ws.send(JSON.stringify(chapterInfo))
          } else if (data.question) {
            setCurrentQuestion(data.question)
            addMessage('question', data.question)
          } else if (data.answer) {
            addMessage('feedback', data.answer)
          } else if (data.feedback) {
            // Final session results
            console.log('Received final feedback:', data.feedback)
            setVivaResults(data.feedback)
            setSessionCompleted(true)
            addMessage('status', 'Viva session completed! View your results below.')
          }
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err)
        addMessage('error', 'Error processing server response')
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      addMessage('error', 'Connection error occurred')
      setWsConnected(false)
    }

    ws.onclose = () => {
      console.log('WebSocket disconnected')
      setWsConnected(false)
      addMessage('status', 'Viva session ended')
    }
  }

  const startViva = async () => {
    if (!selectedGrade || !subject || !chapter) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(track => track.stop()) // Stop the test stream
      
      setVivaStarted(true)
      setMessages([])
      initializeWebSocket()
    } catch (err) {
      console.error('Error accessing microphone:', err)
      setError('Microphone access is required for the viva session')
    } finally {
      setLoading(false)
    }
  }

  const startRecording = async () => {
    if (!wsConnected || !wsRef.current) {
      addMessage('error', 'Not connected to server')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      })
      
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        
        // Send audio data to WebSocket
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(audioBlob)
          addMessage('status', 'Answer submitted, processing...')
        }
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      addMessage('status', 'Recording your answer...')
    } catch (err) {
      console.error('Error starting recording:', err)
      addMessage('error', 'Failed to start recording')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const endViva = () => {
    if (wsRef.current) {
      wsRef.current.close()
    }
    setVivaStarted(false)
    setWsConnected(false)
    setCurrentQuestion('')
    setMessages([])
    setVivaResults(null)
    setSessionCompleted(false)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  if (!vivaStarted) {
    return (
      <div className="min-h-screen bg-cream">
        <Header />
        
        <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/home')}
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
                <h2 className="text-2xl font-bold text-dark">AI Viva Session</h2>
              </div>
              <p className="text-sm text-neutral-600">
                Start an interactive viva session with AI. Select your subject and chapter to begin.
              </p>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); startViva(); }} className="space-y-6">
                <Select
                  label="Grade"
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  options={[{ value: '', label: 'Select grade' }, ...gradeOptions]}
                  required
                />
                
                <Select
                  label="Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  options={[
                    { value: '', label: 'Select subject' },
                    ...availableSubjects.map(s => ({ value: s, label: s }))
                  ]}
                  required
                  disabled={!selectedGrade}
                />
                
                <Select
                  label="Chapter"
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                  options={[
                    { value: '', label: 'Select chapter' },
                    ...availableChapters.map(c => ({ value: c, label: c }))
                  ]}
                  required
                  disabled={!subject}
                />
                
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">What to Expect:</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• AI will ask questions based on your selected chapter</li>
                    <li>• Speak your answers clearly into the microphone</li>
                    <li>• Get real-time feedback and follow-up questions</li>
                    <li>• Session adapts based on your responses</li>
                  </ul>
                </div>
                
                <Button
                  type="submit"
                  className="w-full flex items-center justify-center"
                  loading={loading}
                  disabled={!selectedGrade || !subject || !chapter}
                >
                  {loading ? 'Starting Viva Session...' : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Start Viva Session
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Session Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-dark mb-2">AI Viva Session</h1>
                <p className="text-neutral-600">
                  {subject} - {chapter} (Grade {selectedGrade})
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className={`flex items-center px-3 py-2 rounded-lg ${wsConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  {wsConnected ? 'Connected' : 'Disconnected'}
                </div>
                <Button
                  variant="outline"
                  onClick={endViva}
                  className="flex items-center"
                >
                  End Session
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Question */}
        {currentQuestion && (
          <Card className="mb-6 bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
            <CardContent className="p-6">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-primary-900 mb-2">Current Question:</h3>
                  <p className="text-primary-800 leading-relaxed">{currentQuestion}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recording Controls */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-4">
              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  disabled={!wsConnected || !currentQuestion}
                  size="lg"
                  className="flex items-center px-8 py-4"
                >
                  <Mic className="h-5 w-5 mr-2" />
                  Start Recording Answer
                </Button>
              ) : (
                <Button
                  onClick={stopRecording}
                  variant="secondary"
                  size="lg"
                  className="flex items-center px-8 py-4 bg-red-500 hover:bg-red-600 text-white"
                >
                  <MicOff className="h-5 w-5 mr-2" />
                  Stop Recording
                </Button>
              )}
              
              {isRecording && (
                <div className="flex items-center text-red-600">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
                  <span className="font-medium">Recording...</span>
                </div>
              )}
            </div>
            
            {!wsConnected && (
              <p className="text-center text-neutral-500 text-sm mt-4">
                Waiting for connection to server...
              </p>
            )}
          </CardContent>
        </Card>

        {/* Messages/Chat History */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-dark">Session History</h3>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-500">Viva session will begin shortly...</p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div key={index} className={`flex items-start space-x-3 ${
                    message.type === 'question' ? 'bg-primary-50 p-4 rounded-lg' :
                    message.type === 'error' ? 'bg-red-50 p-4 rounded-lg' :
                    message.type === 'feedback' ? 'bg-green-50 p-4 rounded-lg' :
                    'bg-neutral-50 p-4 rounded-lg'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === 'question' ? 'bg-primary-500' :
                      message.type === 'error' ? 'bg-red-500' :
                      message.type === 'feedback' ? 'bg-green-500' :
                      'bg-neutral-500'
                    }`}>
                      {message.type === 'question' ? (
                        <MessageSquare className="h-4 w-4 text-white" />
                      ) : message.type === 'error' ? (
                        <AlertCircle className="h-4 w-4 text-white" />
                      ) : message.type === 'feedback' ? (
                        <MessageSquare className="h-4 w-4 text-white" />
                      ) : (
                        <Brain className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-medium ${
                          message.type === 'question' ? 'text-primary-900' :
                          message.type === 'error' ? 'text-red-900' :
                          message.type === 'feedback' ? 'text-green-900' :
                          'text-neutral-900'
                        }`}>
                          {message.type === 'question' ? 'AI Question' :
                           message.type === 'error' ? 'Error' :
                           message.type === 'feedback' ? 'AI Feedback' :
                           'System'}
                        </span>
                        <span className="text-xs text-neutral-500">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                      <p className={`text-sm ${
                        message.type === 'question' ? 'text-primary-800' :
                        message.type === 'error' ? 'text-red-800' :
                        message.type === 'feedback' ? 'text-green-800' :
                        'text-neutral-700'
                      }`}>
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
  )
}