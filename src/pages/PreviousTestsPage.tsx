import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText, Calendar, BookOpen, Eye, Search, Filter } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Header } from '../components/layout/Header'

interface TestRecord {
  id: number
  created_at: string
  subject: string
  topic: string
  grade: string
  difficulty: string
  question_count: number
}

// Dummy data for now
const dummyTests: TestRecord[] = [
  {
    id: 1,
    created_at: '2024-01-15T10:30:00Z',
    subject: 'Mathematics',
    topic: 'Quadratic Equations',
    grade: '10',
    difficulty: 'Medium',
    question_count: 8
  },
  {
    id: 2,
    created_at: '2024-01-12T14:45:00Z',
    subject: 'Physics',
    topic: 'Newton\'s Laws of Motion',
    grade: '11',
    difficulty: 'Hard',
    question_count: 6
  },
  {
    id: 3,
    created_at: '2024-01-10T09:15:00Z',
    subject: 'Chemistry',
    topic: 'Periodic Table',
    grade: '9',
    difficulty: 'Easy',
    question_count: 10
  },
  {
    id: 4,
    created_at: '2024-01-08T16:20:00Z',
    subject: 'Mathematics',
    topic: 'Trigonometry',
    grade: '12',
    difficulty: 'Hard',
    question_count: 7
  },
  {
    id: 5,
    created_at: '2024-01-05T11:00:00Z',
    subject: 'Biology',
    topic: 'Cell Structure',
    grade: '10',
    difficulty: 'Medium',
    question_count: 9
  },
  {
    id: 6,
    created_at: '2024-01-03T13:30:00Z',
    subject: 'English',
    topic: 'Grammar and Composition',
    grade: '8',
    difficulty: 'Easy',
    question_count: 12
  },
  {
    id: 7,
    created_at: '2024-01-01T08:45:00Z',
    subject: 'History',
    topic: 'World War II',
    grade: '11',
    difficulty: 'Medium',
    question_count: 5
  }
]

export function PreviousTestsPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const [gradeFilter, setGradeFilter] = useState('')

  // Get unique subjects and grades for filters
  const uniqueSubjects = [...new Set(dummyTests.map(test => test.subject))].sort()
  const uniqueGrades = [...new Set(dummyTests.map(test => test.grade))].sort((a, b) => parseInt(a) - parseInt(b))

  // Filter tests based on search and filters
  const filteredTests = dummyTests.filter(test => {
    const matchesSearch = searchTerm === '' || 
      test.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.topic.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSubject = subjectFilter === '' || test.subject === subjectFilter
    const matchesGrade = gradeFilter === '' || test.grade === gradeFilter

    return matchesSearch && matchesSubject && matchesGrade
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'hard':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-neutral-100 text-neutral-800'
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
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
            <div className="flex items-center mb-2">
              <FileText className="h-6 w-6 text-primary-600 mr-2" />
              <h1 className="text-2xl font-bold text-dark">Previous Tests</h1>
            </div>
            <p className="text-sm text-neutral-600">
              View and manage all your previously created tests
            </p>
          </CardHeader>
        </Card>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <Filter className="h-5 w-5 text-neutral-600 mr-2" />
              <h3 className="text-lg font-semibold text-dark">Filter Tests</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="Search by subject or topic..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                options={[
                  { value: '', label: 'All Subjects' },
                  ...uniqueSubjects.map(subject => ({ value: subject, label: subject }))
                ]}
              />
              <Select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                options={[
                  { value: '', label: 'All Grades' },
                  ...uniqueGrades.map(grade => ({ value: grade, label: `Grade ${grade}` }))
                ]}
              />
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('')
                  setSubjectFilter('')
                  setGradeFilter('')
                }}
                className="flex items-center justify-center"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-neutral-600">
            Showing {filteredTests.length} of {dummyTests.length} tests
          </p>
          <div className="flex items-center space-x-2 text-sm text-neutral-600">
            <Calendar className="h-4 w-4" />
            <span>Sorted by creation date (newest first)</span>
          </div>
        </div>

        {/* Tests Table */}
        <Card>
          <CardContent className="p-0">
            {filteredTests.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-dark mb-2">No Tests Found</h3>
                <p className="text-neutral-600 mb-4">
                  {searchTerm || subjectFilter || gradeFilter 
                    ? 'No tests match your current filters. Try adjusting your search criteria.'
                    : 'You haven\'t created any tests yet. Create your first test to get started!'
                  }
                </p>
                <Button
                  onClick={() => navigate('/create-test')}
                  className="flex items-center"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Create Your First Test
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Created Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Topic
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Grade
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Difficulty
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Questions
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {filteredTests.map((test) => (
                      <tr key={test.id} className="hover:bg-neutral-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-neutral-400 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-dark">
                                {formatDate(test.created_at).split(',')[0]}
                              </div>
                              <div className="text-xs text-neutral-500">
                                {formatDate(test.created_at).split(',')[1]}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <BookOpen className="h-4 w-4 text-primary-600 mr-2" />
                            <span className="text-sm font-medium text-dark">{test.subject}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-dark max-w-xs truncate" title={test.topic}>
                            {test.topic}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Grade {test.grade}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(test.difficulty)}`}>
                            {test.difficulty}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-dark font-medium">
                            {test.question_count} questions
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Button
                            size="sm"
                            onClick={() => navigate(`/view-test/${test.id}`)}
                            className="flex items-center"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Test
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Stats */}
        {filteredTests.length > 0 && (
          <Card className="mt-6">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-dark mb-4">Quick Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-primary-50 rounded-lg">
                  <div className="text-2xl font-bold text-primary-600">
                    {filteredTests.length}
                  </div>
                  <div className="text-sm text-primary-800">Total Tests</div>
                </div>
                <div className="text-center p-4 bg-secondary-50 rounded-lg">
                  <div className="text-2xl font-bold text-secondary-600">
                    {uniqueSubjects.length}
                  </div>
                  <div className="text-sm text-secondary-800">Subjects</div>
                </div>
                <div className="text-center p-4 bg-neutral-50 rounded-lg">
                  <div className="text-2xl font-bold text-neutral-600">
                    {filteredTests.reduce((sum, test) => sum + test.question_count, 0)}
                  </div>
                  <div className="text-sm text-neutral-800">Total Questions</div>
                </div>
                <div className="text-center p-4 bg-pink-50 rounded-lg">
                  <div className="text-2xl font-bold text-pink-600">
                    {Math.round(filteredTests.reduce((sum, test) => sum + test.question_count, 0) / filteredTests.length)}
                  </div>
                  <div className="text-sm text-pink-800">Avg Questions</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}