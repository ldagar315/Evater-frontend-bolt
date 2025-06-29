import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FileCheck, ArrowLeft, Calculator } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Header } from '../components/layout/Header'
import { MathText } from '../components/ui/MathRenderer'
import { supabase } from '../lib/supabase'
import { QuestionsCreated, Question } from '../types'

export function ViewTestPage() {
  const { testId } = useParams()
  const navigate = useNavigate()
  const [test, setTest] = useState<QuestionsCreated | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (testId) {
      fetchTest()
    } else {
      fetchLatestTest()
    }
  }, [testId])

  const fetchTest = async () => {
    try {
      const { data, error } = await supabase
        .from('Questions_Created')
        .select('*')
        .eq('id', parseInt(testId!))
        .single()

      if (error) throw error
      setTest(data)
    } catch (err) {
      setError('Failed to load test')
    } finally {
      setLoading(false)
    }
  }

  const fetchLatestTest = async () => {
    try {
      const { data, error } = await supabase
        .from('Questions_Created')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error) throw error
      setTest(data)
    } catch (err) {
      setError('No tests found')
    } finally {
      setLoading(false)
    }
  }

  const renderQuestion = (question: Question) => {
    return (
      <Card key={question.question_number} className="mb-4">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-gray-900 flex items-center">
              Question {question.question_number}
              {question.contains_math_expression && (
                <Calculator className="h-4 w-4 ml-2 text-blue-600" title="Contains mathematical expressions" />
              )}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {question.difficulty}
              </span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                {question.maximum_marks} marks
              </span>
            </div>
          </div>
          
          <div className="text-gray-700 mb-3">
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
                  <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-sm mr-3 mt-0.5 flex-shrink-0">
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
          
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Type: {question.question_type.replace('_', ' ')}</span>
              <span className="flex items-center">
                {question.contains_math_expression && (
                  <>
                    <Calculator className="h-3 w-3 mr-1" />
                    Contains Math
                  </>
                )}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error || !test) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-600 mb-4">{error || 'Test not found'}</p>
              <Button onClick={() => navigate('/home')}>
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const questions = Array.isArray(test.test) ? test.test : []

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/home')}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {test.subject} - {test.chapter}
                </h1>
                <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                  <span>Grade {test.grade}</span>
                  <span>•</span>
                  <span>{test.subject}</span>
                  <span>•</span>
                  <span>{test.chapter}</span>
                  <span>•</span>
                  <span>{test.difficulty_level}</span>
                  <span>•</span>
                  <span>{test.length} Test</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  Created: {new Date(test.created_at).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">
                  Total Questions: {questions.length}
                </p>
                {questions.some((q: Question) => q.contains_math_expression) && (
                  <p className="text-sm text-blue-600 flex items-center justify-end mt-1">
                    <Calculator className="h-3 w-3 mr-1" />
                    Contains Math
                  </p>
                )}
              </div>
            </div>
            
            {test.special_instructions && test.special_instructions.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Special Instructions:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {test.special_instructions.map((instruction, index) => (
                    <span
                      key={index}
                      className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm"
                    >
                      {instruction}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardHeader>
        </Card>

        <div className="space-y-4 mb-6">
          {questions.map((question) => 
            renderQuestion(question as Question)
          )}
        </div>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <FileCheck className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ready to Evaluate?
            </h3>
            <p className="text-gray-600 mb-4">
              Upload answer sheets to get AI-powered feedback and scoring
            </p>
            <Button
              onClick={() => navigate(`/submit-feedback/${test.id}`)}
              size="lg"
            >
              Evaluate Test
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}