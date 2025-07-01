import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MessageSquare, Calendar, BookOpen, Eye, Search, Filter, Award, TrendingUp } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Header } from '../components/layout/Header'

// Dummy data for now - will be replaced with Supabase data
const dummyFeedbacks = [
  {
    id: 1,
    created_at: '2024-01-15T10:30:00Z',
    marks_scored: 85,
    total_marks: 100,
    subject: 'Mathematics',
    topic: 'Algebra',
    difficulty_level: 'Medium',
    test_id: 101,
    percentage: 85
  },
  {
    id: 2,
    created_at: '2024-01-12T14:45:00Z',
    marks_scored: 72,
    total_marks: 80,
    subject: 'Physics',
    topic: 'Mechanics',
    difficulty_level: 'Hard',
    test_id: 102,
    percentage: 90
  },
  {
    id: 3,
    created_at: '2024-01-10T09:15:00Z',
    marks_scored: 45,
    total_marks: 50,
    subject: 'Chemistry',
    topic: 'Organic Chemistry',
    difficulty_level: 'Easy',
    test_id: 103,
    percentage: 90
  },
  {
    id: 4,
    created_at: '2024-01-08T16:20:00Z',
    marks_scored: 38,
    total_marks: 60,
    subject: 'Biology',
    topic: 'Cell Structure',
    difficulty_level: 'Medium',
    test_id: 104,
    percentage: 63
  },
  {
    id: 5,
    created_at: '2024-01-05T11:00:00Z',
    marks_scored: 92,
    total_marks: 100,
    subject: 'Mathematics',
    topic: 'Calculus',
    difficulty_level: 'Hard',
    test_id: 105,
    percentage: 92
  },
  {
    id: 6,
    created_at: '2024-01-03T13:30:00Z',
    marks_scored: 67,
    total_marks: 75,
    subject: 'English',
    topic: 'Literature',
    difficulty_level: 'Medium',
    test_id: 106,
    percentage: 89
  }
]

export function PreviousFeedbacksPage() {
  const navigate = useNavigate()
  
  const [feedbacks, setFeedbacks] = useState(dummyFeedbacks)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('')

  // Get unique subjects and difficulties for filters
  const uniqueSubjects = [...new Set(feedbacks.map(feedback => feedback.subject))].sort()
  const uniqueDifficulties = [...new Set(feedbacks.map(feedback => feedback.difficulty_level))].sort()

  // Filter feedbacks based on search and filters
  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchesSearch = searchTerm === '' || 
      feedback.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.topic.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSubject = subjectFilter === '' || feedback.subject === subjectFilter
    const matchesDifficulty = difficultyFilter === '' || feedback.difficulty_level === difficultyFilter

    return matchesSearch && matchesSubject && matchesDifficulty
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

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600'
    if (percentage >= 80) return 'text-blue-600'
    if (percentage >= 70) return 'text-yellow-600'
    if (percentage >= 60) return 'text-orange-600'
    return 'text-red-600'
  }

  const getPerformanceBadgeColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-100 text-green-800'
    if (percentage >= 80) return 'bg-blue-100 text-blue-800'
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800'
    if (percentage >= 60) return 'bg-orange-100 text-orange-800'
    return 'bg-red-100 text-red-800'
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

  const getPerformanceLabel = (percentage: number) => {
    if (percentage >= 90) return 'Excellent'
    if (percentage >= 80) return 'Good'
    if (percentage >= 70) return 'Average'
    if (percentage >= 60) return 'Below Average'
    return 'Needs Improvement'
  }

  // Calculate stats
  const averageScore = filteredFeedbacks.length > 0 
    ? Math.round(filteredFeedbacks.reduce((sum, feedback) => sum + feedback.percentage, 0) / filteredFeedbacks.length)
    : 0

  const totalMarksScored = filteredFeedbacks.reduce((sum, feedback) => sum + feedback.marks_scored, 0)
  const totalMarksAvailable = filteredFeedbacks.reduce((sum, feedback) => sum + feedback.total_marks, 0)

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
          <Button
            onClick={() => navigate('/create-test')}
            className="flex items-center"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Create New Test
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center mb-2">
              <MessageSquare className="h-6 w-6 text-primary-600 mr-2" />
              <h1 className="text-2xl font-bold text-dark">Previous Feedbacks</h1>
            </div>
            <p className="text-sm text-neutral-600">
              View and analyze all your previous test evaluations and performance feedback
            </p>
          </CardHeader>
        </Card>

        {error && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Performance Overview */}
        {filteredFeedbacks.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <TrendingUp className="h-5 w-5 text-primary-600 mr-2" />
                <h3 className="text-lg font-semibold text-dark">Performance Overview</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-primary-50 rounded-lg">
                  <div className="text-2xl font-bold text-primary-600">
                    {filteredFeedbacks.length}
                  </div>
                  <div className="text-sm text-primary-800">Total Evaluations</div>
                </div>
                <div className="text-center p-4 bg-secondary-50 rounded-lg">
                  <div className={`text-2xl font-bold ${getPerformanceColor(averageScore)}`}>
                    {averageScore}%
                  </div>
                  <div className="text-sm text-secondary-800">Average Score</div>
                </div>
                <div className="text-center p-4 bg-neutral-50 rounded-lg">
                  <div className="text-2xl font-bold text-neutral-600">
                    {totalMarksScored}/{totalMarksAvailable}
                  </div>
                  <div className="text-sm text-neutral-800">Total Marks</div>
                </div>
                <div className="text-center p-4 bg-pink-50 rounded-lg">
                  <div className="text-2xl font-bold text-pink-600">
                    {uniqueSubjects.length}
                  </div>
                  <div className="text-sm text-pink-800">Subjects Covered</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <Filter className="h-5 w-5 text-neutral-600 mr-2" />
              <h3 className="text-lg font-semibold text-dark">Filter Feedbacks</h3>
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
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                options={[
                  { value: '', label: 'All Difficulties' },
                  ...uniqueDifficulties.map(difficulty => ({ value: difficulty, label: difficulty }))
                ]}
              />
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('')
                  setSubjectFilter('')
                  setDifficultyFilter('')
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
            Showing {filteredFeedbacks.length} of {feedbacks.length} evaluations
          </p>
          <div className="flex items-center space-x-2 text-sm text-neutral-600">
            <Calendar className="h-4 w-4" />
            <span>Sorted by evaluation date (newest first)</span>
          </div>
        </div>

        {/* Feedbacks Table */}
        <Card>
          <CardContent className="p-0">
            {filteredFeedbacks.length === 0 ? (
              <div className="p-12 text-center">
                <MessageSquare className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-dark mb-2">
                  {feedbacks.length === 0 ? 'No Evaluations Yet' : 'No Evaluations Found'}
                </h3>
                <p className="text-neutral-600 mb-4">
                  {feedbacks.length === 0 
                    ? 'You haven\'t submitted any answer sheets for evaluation yet. Create a test and submit your answers to get started!'
                    : 'No evaluations match your current filters. Try adjusting your search criteria.'
                  }
                </p>
                <Button
                  onClick={() => navigate('/create-test')}
                  className="flex items-center"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  {feedbacks.length === 0 ? 'Create Your First Test' : 'Create New Test'}
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Evaluation Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Marks Scored
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Total Marks
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Topic
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Difficulty Level
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Performance
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {filteredFeedbacks.map((feedback) => (
                      <tr key={feedback.id} className="hover:bg-neutral-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-neutral-400 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-dark">
                                {formatDate(feedback.created_at).split(',')[0]}
                              </div>
                              <div className="text-xs text-neutral-500">
                                {formatDate(feedback.created_at).split(',')[1]}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Award className="h-4 w-4 text-primary-600 mr-2" />
                            <span className={`text-lg font-bold ${getPerformanceColor(feedback.percentage)}`}>
                              {feedback.marks_scored}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-dark">
                            {feedback.total_marks}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <BookOpen className="h-4 w-4 text-secondary-600 mr-2" />
                            <span className="text-sm font-medium text-dark">
                              {feedback.subject}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-dark max-w-xs truncate" title={feedback.topic}>
                            {feedback.topic}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(feedback.difficulty_level)}`}>
                            {feedback.difficulty_level}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className={`text-lg font-bold ${getPerformanceColor(feedback.percentage)}`}>
                              {feedback.percentage}%
                            </span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPerformanceBadgeColor(feedback.percentage)} mt-1`}>
                              {getPerformanceLabel(feedback.percentage)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Button
                            size="sm"
                            onClick={() => navigate(`/view-feedback/${feedback.id}`)}
                            className="flex items-center"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Feedback
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

        {/* Performance Insights */}
        {filteredFeedbacks.length > 0 && (
          <Card className="mt-6">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-dark mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 text-primary-600 mr-2" />
                Performance Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2">Best Performance</h4>
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {Math.max(...filteredFeedbacks.map(f => f.percentage))}%
                  </div>
                  <p className="text-sm text-green-700">
                    Your highest score achieved
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Most Attempted</h4>
                  <div className="text-lg font-bold text-blue-600 mb-1">
                    {uniqueSubjects.reduce((prev, current) => 
                      filteredFeedbacks.filter(f => f.subject === current).length > 
                      filteredFeedbacks.filter(f => f.subject === prev).length ? current : prev
                    )}
                  </div>
                  <p className="text-sm text-blue-700">
                    Subject with most evaluations
                  </p>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-2">Improvement Trend</h4>
                  <div className="text-lg font-bold text-purple-600 mb-1">
                    {filteredFeedbacks.length >= 2 && 
                     filteredFeedbacks[0].percentage > filteredFeedbacks[1].percentage ? '↗️ Improving' : 
                     filteredFeedbacks.length >= 2 && 
                     filteredFeedbacks[0].percentage < filteredFeedbacks[1].percentage ? '↘️ Declining' : '→ Stable'}
                  </div>
                  <p className="text-sm text-purple-700">
                    Based on recent evaluations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}