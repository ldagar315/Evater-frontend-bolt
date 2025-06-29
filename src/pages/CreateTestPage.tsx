import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Header } from '../components/layout/Header'
import { useAuthContext } from '../contexts/AuthContext'
import { useAppState } from '../contexts/AppStateContext'
import { supabase } from '../lib/supabase'
import { TestGenerationParams, Question, ChapterContent } from '../types'

interface ApiQuestion {
  question_text: string
  question_type: 'short_answer' | 'long_answer' | 'mcq_single' | 'mcq_multi' | 'true_false'
  question_number: number
  maximum_marks: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
  contains_math_expression: boolean
  options?: string[] | null
}

interface ApiResponse {
  questions: ApiQuestion[]
}

export function CreateTestPage() {
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const { setLastGeneratedTest } = useAppState()
  
  const [selectedGrade, setSelectedGrade] = useState('')
  const [subject, setSubject] = useState('')
  const [chapter, setChapter] = useState('')
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium')
  const [length, setLength] = useState<'Short' | 'Long'>('Short')
  const [specialInstructions, setSpecialInstructions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [chapterContents, setChapterContents] = useState<ChapterContent[]>([])
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([])
  const [availableChapters, setAvailableChapters] = useState<string[]>([])

  const gradeOptions = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: `Grade ${i + 1}`
  }))

  const instructionOptions = [
    'only mcq',
    'only subjective', 
    'numerical focused',
    'theory focused'
  ]

  useEffect(() => {
    fetchChapterContents()
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

  const fetchChapterContents = async () => {
    try {
      const { data, error } = await supabase
        .from('Chapter_contents')
        .select('*')

      if (error) throw error
      setChapterContents(data || [])
    } catch (err) {
      console.error('Error fetching chapter contents:', err)
    }
  }

  const handleInstructionToggle = (instruction: string) => {
    setSpecialInstructions(prev =>
      prev.includes(instruction)
        ? prev.filter(i => i !== instruction)
        : [...prev, instruction]
    )
  }

  const callGenerateQuestionsAPI = async (params: {
    grade: string
    subject: string
    topic: string
    difficulty_level: string
    length: string
    special_instructions: string[]
  }): Promise<ApiQuestion[]> => {
    // Use Netlify function in production, proxy in development
    const apiUrl = process.env.NODE_ENV === 'production' 
      ? '/.netlify/functions/generate-questions'
      : '/api/external/api/gen_question'

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params)
    })

    if (!response.ok) {
      if (response.status === 400) {
        throw new Error('Missing required fields. Please fill in all form fields.')
      } else if (response.status === 500) {
        throw new Error('Server error. Please try again later.')
      } else {
        throw new Error(`API error: ${response.status}`)
      }
    }

    const data: ApiResponse = await response.json()
    return data.questions
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate required fields
      if (!selectedGrade || !subject || !chapter) {
        throw new Error('Please fill in all required fields')
      }

      // Prepare API payload - matching InputDataQuestion exactly
      const apiPayload = {
        grade: selectedGrade, // Changed from class to grade, and kept as string
        subject: subject,
        topic: chapter, // Using chapter as topic
        difficulty_level: difficulty,
        length: length,
        special_instructions: specialInstructions
      }

      console.log('API Payload:', apiPayload) // Debug log

      // Call the external API
      const questions = await callGenerateQuestionsAPI(apiPayload)

      // Convert API response to our format
      const convertedQuestions: Question[] = questions.map(q => ({
        question_text: q.question_text,
        question_type: q.question_type,
        question_number: q.question_number,
        maximum_marks: q.maximum_marks,
        difficulty: q.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard',
        contains_math_expression: q.contains_math_expression,
        options: q.options || undefined
      }))

      // Save to database
      const { data, error } = await supabase
        .from('Questions_Created')
        .insert([{
          created_by: user!.id,
          grade: selectedGrade,
          subject: subject,
          chapter: chapter,
          difficulty_level: difficulty.toLowerCase(),
          length: length.toLowerCase(),
          special_instructions: specialInstructions,
          test: convertedQuestions
        }])
        .select()
        .single()

      if (error) throw error

      // Store in app state
      setLastGeneratedTest(data)

      navigate(`/view-test/${data.id}`)
    } catch (err) {
      console.error('Error generating test:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate test. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-bold text-dark">Create New Test</h2>
            <p className="text-sm text-neutral-600">
              Fill in the details below to generate a custom test using AI
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                label="Topic/Chapter"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                options={[
                  { value: '', label: 'Select topic/chapter' },
                  ...availableChapters.map(c => ({ value: c, label: c }))
                ]}
                required
                disabled={!subject}
              />
              
              <div>
                <label className="block text-sm font-medium text-dark mb-3">
                  Difficulty Level
                </label>
                <div className="flex space-x-4">
                  {['Easy', 'Medium', 'Hard'].map((level) => (
                    <label key={level} className="flex items-center">
                      <input
                        type="radio"
                        name="difficulty"
                        value={level}
                        checked={difficulty === level}
                        onChange={(e) => setDifficulty(e.target.value as 'Easy' | 'Medium' | 'Hard')}
                        className="mr-2"
                      />
                      {level}
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark mb-3">
                  Test Length
                </label>
                <div className="flex space-x-4">
                  {['Short', 'Long'].map((testLength) => (
                    <label key={testLength} className="flex items-center">
                      <input
                        type="radio"
                        name="length"
                        value={testLength}
                        checked={length === testLength}
                        onChange={(e) => setLength(e.target.value as 'Short' | 'Long')}
                        className="mr-2"
                      />
                      {testLength} ({testLength === 'Short' ? '~5 questions' : '~10 questions'})
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark mb-3">
                  Special Instructions
                </label>
                <div className="space-y-2">
                  {instructionOptions.map((instruction) => (
                    <label key={instruction} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={specialInstructions.includes(instruction)}
                        onChange={() => handleInstructionToggle(instruction)}
                        className="mr-2"
                      />
                      {instruction}
                    </label>
                  ))}
                </div>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              
              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/home')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  loading={loading}
                  disabled={!selectedGrade || !subject || !chapter}
                >
                  {loading ? 'Generating Test...' : 'Generate Test'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}