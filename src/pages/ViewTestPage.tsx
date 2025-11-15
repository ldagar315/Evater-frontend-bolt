import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FileCheck, ArrowLeft, Calculator, Play } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Header } from '../components/layout/Header'
import { MathText } from '../components/ui/MathRenderer'
import { useAuthContext } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { QuestionsCreated, Question } from '../types'

export function ViewTestPage() {
  const { testId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const [test, setTest] = useState<QuestionsCreated | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (testId) {
      fetchTest()
    } else {
      fetchLatestTest()
    }
  }, [testId, user])

  const fetchTest = async () => {
    if (!testId) return
    
    try {
      setLoading(true)
      setError('')

      const { data, error } = await supabase
        .from('Questions_Created')
        .select('*')
        .eq('id', parseInt(testId))
        .eq('created_by', user!.id) // Ensure user can only view their own tests
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Test not found or you do not have permission to view it')
        } else {
          throw error
        }
      } else {
        setTest(data)
      }
    } catch (err) {
      console.error('Error fetching test:', err)
      setError('Failed to load test. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchLatestTest = async () => {
    try {
      setLoading(true)
      setError('')

      const { data, error } = await supabase
        .from('Questions_Created')
        .select('*')
        .eq('created_by', user!.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          setError('No tests found. Create your first test to get started!')
        } else {
          throw error
        }
      } else {
        setTest(data)
      }
    } catch (err) {
      console.error('Error fetching latest test:', err)
      setError('Failed to load test. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const renderQuestion = (question: Question) => {
    return (
      <Card key={question.question_number} className="mb-4">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-dark flex items-center">
              Question {question.question_number}
              {question.contains_math_expression && (
                <Calculator className="h-4 w-4 ml-2 text-blue-600" />
              )}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-neutral-500">
              <span className ="text-secondary-800 bg-secondary-50 px-2 py-1 rounded">
                {question.question_type.replace('_', ' ')}
              </span>
              <span className=" text-green-800 bg-primary-50 px-2 py-1 rounded">
                {question.maximum_marks} marks
              </span>
            </div>
          </div>
          
          <div className="text-neutral-700 mb-3">
            {question.contains_math_expression ? (
              <MathText text={question.question_text} className="leading-relaxed" />
            ) : (
              <p>{question.question_text}</p>
            )}
          </div>
          
          {question.options && (
            <div className="space-y-2">
              {question.options.map((option, index) => (
                <div key={index} className="flex items-start">
                  <span className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center text-sm mr-3 mt-0.5 flex-shrink-0">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <div className="flex-1">
                    {question.contains_math_expression ? (
                      <MathText text={typeof option === 'string' ? option : option.text} />
                    ) : (
                      <span>{typeof option === 'string' ? option : option.text}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Check if test contains MCQ questions
  const hasMCQQuestions = (test: QuestionsCreated): boolean => {
    if (!test.test || !Array.isArray(test.test)) return false
    return test.test.some((q: Question) => 
      q.question_type === 'mcq_single' || q.question_type === 'mcq_multi'
    )
  }

  // Check if test is MCQ only
  const isMCQOnly = (test: QuestionsCreated): boolean => {
    if (!test.test || !Array.isArray(test.test)) return false
    return test.test.every((q: Question) => 
      q.question_type === 'mcq_single' || q.question_type === 'mcq_multi'
    )
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
          <div className="mb-6 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/previous-tests')}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Previous Tests
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileCheck className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-dark mb-2">Test Not Found</h2>
              <p className="text-neutral-600 mb-4">{error}</p>
              <div className="flex space-x-4 justify-center">
                <Button onClick={() => navigate('/previous-tests')} variant="outline">
                  View All Tests
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

  // Safely extract questions from the test data
  const questions = Array.isArray(test.test) ? test.test : []

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/previous-tests')}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Previous Tests
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-lg font-semibold text-dark mb-2 sm:text-2xl sm:font-bold">
                  {test.chapter}
                </h1>
                <div className="flex flex-wrap gap-1 sm:gap-2 text-sm text-neutral-600">
                  <span>Class {test.grade}</span>
                  <span>|</span>
                  <span>{test.subject}</span>
                  <span>|</span>
                  <span className="capitalize">{test.difficulty_level}</span>
                  <span>|</span>
                  <span>{questions.length} Questions</span>
                </div>
                <span>Created at {new Date(test.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            
            {test.special_instructions && test.special_instructions.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-neutral-700 mb-2">
                  Special Instructions:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {test.special_instructions.map((instruction, index) => (
                    <span
                      key={index}
                      className="bg-purple-100 text-primary-800 px-2 py-1 rounded text-sm"
                    >
                      {instruction}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardHeader>
        </Card>

        {/* Take MCQ Test Card - Moved to top, just above questions */}
        {hasMCQQuestions(test) && (
          <Card className="mb-6 bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
            <CardContent className="p-6 text-center">
              <p className="text-neutral-600 text-base mb-4">
                {isMCQOnly(test) 
                  ? 'Take this test in interactive MCQ mode with instant feedback'
                  : 'Take the MCQ questions from this test in interactive mode'
                }
              </p>
              <Button
                onClick={() => navigate(`/take-test/${test.id}`)}
                className="w-full"
              >
                Start MCQ Test
              </Button>
            </CardContent>
          </Card>
        )}

        {questions.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileCheck className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-dark mb-2">
                No Questions Found
              </h3>
              <p className="text-neutral-600 mb-4">
                This test appears to have no questions. This might be due to a data issue.
              </p>
              <Button onClick={() => navigate('/create-test')}>
                Create New Test
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {questions.map((question) => 
                renderQuestion(question as Question)
              )}
            </div>

            {/* Evaluate Test Card - Only this one remains at the bottom */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <FileCheck className="h-12 w-12 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-dark mb-2">
                  Evaluate Answer Sheets
                </h3>
                <p className="text-neutral-600 mb-4">
                  Upload/ Scan answer sheets to get AI-powered feedback and scoring
                </p>
                <Button
                  onClick={() => navigate(`/submit-feedback/${test.id}`)}
                  variant="secondary"
                  className="w-full"
                >
                  Evaluate Test
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}