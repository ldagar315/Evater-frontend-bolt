import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, Clock, Award } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { Header } from '../components/layout/Header'
import { MathText } from '../components/ui/MathRenderer'
import { useAuthContext } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { QuestionsCreated, Question } from '../types'

interface MCQOption {
  id: string
  text: string
  isCorrect: boolean
}

interface MCQQuestion extends Question {
  mcq_options: MCQOption[]
  isMultipleCorrect: boolean
}

interface UserAnswer {
  questionId: number
  selectedOptions: string[]
  isCorrect?: boolean
  correctOptions?: string[]
}

export function TakeTestPage() {
  const { testId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthContext()
  
  const [test, setTest] = useState<QuestionsCreated | null>(null)
  const [questions, setQuestions] = useState<MCQQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([])
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [showAnswer, setShowAnswer] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [testCompleted, setTestCompleted] = useState(false)
  const [score, setScore] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)

  useEffect(() => {
    if (testId && user) {
      fetchTest()
    }
  }, [testId, user])

  useEffect(() => {
    // Timer for elapsed time
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const fetchTest = async () => {
    try {
      setLoading(true)
      setError('')

      const { data, error } = await supabase
        .from('Questions_Created')
        .select('*')
        .eq('id', parseInt(testId!))
        .eq('created_by', user!.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Test not found or you do not have permission to access it')
        } else {
          throw error
        }
        return
      }

      // Check if test has MCQ questions
      const testQuestions = Array.isArray(data.test) ? data.test : []
      const mcqQuestions = testQuestions.filter((q: Question) => 
        q.question_type === 'mcq_single' || q.question_type === 'mcq_multi'
      )

      if (mcqQuestions.length === 0) {
        setError('This test does not contain MCQ questions')
        return
      }

      // Convert questions to MCQ format with dummy options for now
      const formattedQuestions: MCQQuestion[] = mcqQuestions.map((q: Question) => {
        const isMultipleCorrect = q.question_type === 'mcq_multi'
        
        // Generate options from the existing options or create dummy ones
        let mcqOptions: MCQOption[] = []
        
        if (q.options && q.options.length > 0) {
          mcqOptions = q.options.map((option, index) => ({
            id: `option_${index}`,
            text: typeof option === 'string' ? option : option.text,
            isCorrect: index === 0 // For demo, make first option correct
          }))
        } else {
          // Generate dummy options based on question content
          mcqOptions = generateDummyOptions(q.question_text, isMultipleCorrect)
        }

        return {
          ...q,
          mcq_options: mcqOptions,
          isMultipleCorrect
        }
      })

      setTest(data)
      setQuestions(formattedQuestions)
      setUserAnswers(formattedQuestions.map(q => ({
        questionId: q.question_number,
        selectedOptions: []
      })))
    } catch (err) {
      console.error('Error fetching test:', err)
      setError('Failed to load test. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const generateDummyOptions = (questionText: string, isMultipleCorrect: boolean): MCQOption[] => {
    // Generate contextual options based on question content
    const baseOptions = [
      'Option A - Correct answer',
      'Option B - Incorrect answer',
      'Option C - Incorrect answer',
      'Option D - Incorrect answer'
    ]

    if (isMultipleCorrect) {
      return baseOptions.map((text, index) => ({
        id: `option_${index}`,
        text,
        isCorrect: index === 0 || index === 2 // Multiple correct for demo
      }))
    } else {
      return baseOptions.map((text, index) => ({
        id: `option_${index}`,
        text,
        isCorrect: index === 0 // Single correct
      }))
    }
  }

  const handleOptionSelect = (optionId: string) => {
    if (showAnswer) return // Don't allow selection after showing answer

    const currentQuestion = questions[currentQuestionIndex]
    
    if (currentQuestion.isMultipleCorrect) {
      // Multiple selection
      setSelectedOptions(prev => 
        prev.includes(optionId) 
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      )
    } else {
      // Single selection
      setSelectedOptions([optionId])
    }
  }

  const handleNext = () => {
    if (!showAnswer) {
      // Show answer first
      const currentQuestion = questions[currentQuestionIndex]
      const correctOptions = currentQuestion.mcq_options
        .filter(option => option.isCorrect)
        .map(option => option.id)
      
      const isCorrect = selectedOptions.length === correctOptions.length &&
        selectedOptions.every(id => correctOptions.includes(id))

      // Update user answers
      const updatedAnswers = [...userAnswers]
      updatedAnswers[currentQuestionIndex] = {
        questionId: currentQuestion.question_number,
        selectedOptions: [...selectedOptions],
        isCorrect,
        correctOptions
      }
      setUserAnswers(updatedAnswers)
      setShowAnswer(true)
    } else {
      // Move to next question or complete test
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1)
        setSelectedOptions([])
        setShowAnswer(false)
      } else {
        completeTest()
      }
    }
  }

  const completeTest = () => {
    const correctAnswers = userAnswers.filter(answer => answer.isCorrect).length
    const finalScore = Math.round((correctAnswers / questions.length) * 100)
    setScore(finalScore)
    setTestCompleted(true)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getOptionStyle = (option: MCQOption) => {
    const isSelected = selectedOptions.includes(option.id)
    
    if (!showAnswer) {
      return isSelected 
        ? 'bg-primary-100 border-primary-500 text-primary-900' 
        : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50'
    }

    // Show answer state
    if (option.isCorrect) {
      return 'bg-green-100 border-green-500 text-green-900'
    } else if (isSelected && !option.isCorrect) {
      return 'bg-red-100 border-red-500 text-red-900'
    } else {
      return 'bg-neutral-100 border-neutral-300 text-neutral-600'
    }
  }

  const getOptionIcon = (option: MCQOption) => {
    const isSelected = selectedOptions.includes(option.id)
    
    if (!showAnswer) {
      return null
    }

    if (option.isCorrect) {
      return <CheckCircle className="h-5 w-5 text-green-600" />
    } else if (isSelected && !option.isCorrect) {
      return <XCircle className="h-5 w-5 text-red-600" />
    }
    
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream">
        <Header />
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-neutral-600">Loading test...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !test) {
    return (
      <div className="min-h-screen bg-cream">
        <Header />
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/previous-tests')}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tests
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-dark mb-2">Unable to Load Test</h2>
              <p className="text-neutral-600 mb-4">{error}</p>
              <Button onClick={() => navigate('/previous-tests')}>
                Back to Tests
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (testCompleted) {
    return (
      <div className="min-h-screen bg-cream">
        <Header />
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <Card className="text-center">
            <CardContent className="p-12">
              <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-dark mb-4">Test Completed!</h1>
              <p className="text-xl text-neutral-600 mb-8">
                Congratulations on completing the MCQ test
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 bg-primary-50 rounded-xl">
                  <div className="text-3xl font-bold text-primary-600 mb-2">{score}%</div>
                  <div className="text-sm text-primary-800">Final Score</div>
                </div>
                <div className="p-6 bg-secondary-50 rounded-xl">
                  <div className="text-3xl font-bold text-secondary-600 mb-2">
                    {userAnswers.filter(a => a.isCorrect).length}/{questions.length}
                  </div>
                  <div className="text-sm text-secondary-800">Correct Answers</div>
                </div>
                <div className="p-6 bg-neutral-50 rounded-xl">
                  <div className="text-3xl font-bold text-neutral-600 mb-2">{formatTime(timeElapsed)}</div>
                  <div className="text-sm text-neutral-800">Time Taken</div>
                </div>
              </div>

              <div className="flex space-x-4 justify-center">
                <Button onClick={() => navigate('/previous-tests')} variant="outline">
                  Back to Tests
                </Button>
                <Button onClick={() => navigate('/create-test')}>
                  Create New Test
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />
      
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header with progress and stats */}
        <div className="mb-8 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/previous-tests')}
            className="flex items-center text-white hover:text-primary-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Exit Test
          </Button>
          
          <div className="flex items-center space-x-6 text-white">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              <span className="font-medium">{formatTime(timeElapsed)}</span>
            </div>
            <div className="text-sm">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <Card className="mb-8 bg-slate-800 border-slate-700">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                {currentQuestion.isMultipleCorrect ? 'Select all correct answers' : 'Select the correct answer'}
              </h2>
              
              {/* Question illustration area */}
              <div className="flex justify-center mb-6">
                <div className="w-32 h-32 bg-primary-100 rounded-full flex items-center justify-center">
                  <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-white">Q{currentQuestion.question_number}</span>
                  </div>
                </div>
              </div>

              {/* Question header with number and text in one row */}
              <div className="max-w-4xl mx-auto mb-8">
                <div className="flex items-start gap-6 bg-slate-700 p-6 rounded-xl">
                  {/* Question number - smaller size */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center">
                      <span className="text-lg font-bold text-white">{currentQuestion.question_number}</span>
                    </div>
                  </div>
                  
                  {/* Question text */}
                  <div className="flex-1 text-left">
                    <div className="text-lg text-white leading-relaxed">
                      {currentQuestion.contains_math_expression ? (
                        <MathText text={currentQuestion.question_text} className="text-white" />
                      ) : (
                        <p className="text-white">{currentQuestion.question_text}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Question type and marks - larger and more prominent */}
              <div className="flex justify-center space-x-6 mb-8">
                <span className="bg-blue-500 text-white px-6 py-3 rounded-xl text-lg font-bold shadow-lg">
                  {currentQuestion.isMultipleCorrect ? 'Multiple Correct' : 'Single Correct'}
                </span>
                <span className="bg-green-500 text-white px-6 py-3 rounded-xl text-lg font-bold shadow-lg">
                  {currentQuestion.maximum_marks} marks
                </span>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-4 max-w-3xl mx-auto">
              {currentQuestion.mcq_options.map((option, index) => (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(option.id)}
                  disabled={showAnswer}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between ${getOptionStyle(option)} ${
                    showAnswer ? 'cursor-default' : 'cursor-pointer hover:scale-[1.02]'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-slate-600 text-white flex items-center justify-center mr-4 font-bold">
                      {index + 1}
                    </div>
                    <span className="text-left font-medium">
                      {currentQuestion.contains_math_expression ? (
                        <MathText text={option.text} />
                      ) : (
                        option.text
                      )}
                    </span>
                  </div>
                  {getOptionIcon(option)}
                </button>
              ))}
            </div>

            {/* Answer explanation */}
            {showAnswer && (
              <div className="mt-8 p-6 bg-slate-700 rounded-xl max-w-3xl mx-auto">
                <h4 className="font-semibold text-white mb-2">Explanation:</h4>
                <p className="text-slate-300 text-sm">
                  {userAnswers[currentQuestionIndex]?.isCorrect 
                    ? "Correct! Well done on selecting the right answer(s)."
                    : "Incorrect. The correct answer(s) are highlighted in green above."
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-center">
          <Button
            onClick={handleNext}
            disabled={selectedOptions.length === 0 && !showAnswer}
            size="lg"
            className="px-8 py-3 text-lg font-medium"
          >
            {!showAnswer ? (
              'Submit Answer'
            ) : currentQuestionIndex < questions.length - 1 ? (
              <>
                Next Question
                <ArrowRight className="h-5 w-5 ml-2" />
              </>
            ) : (
              'Complete Test'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}