import React from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusCircle, FileText, MessageSquare, Heart, Sparkles, Clock, History, BarChart3, Coins, User, GraduationCap, School } from 'lucide-react'
import { Card, CardContent } from '../components/ui/Card'
import { Header } from '../components/layout/Header'
import { useAppState } from '../contexts/AppStateContext'
import { useAuthContext } from '../contexts/AuthContext'
import { useProfile } from '../hooks/useProfile'

export function HomePage() {
  const navigate = useNavigate()
  const { appState } = useAppState()
  const { user } = useAuthContext()
  const { profile } = useProfile(user?.id)

  const navigationOptions = [
    {
      title: 'Create Test',
      description: 'Generate a new test with AI assistance',
      icon: PlusCircle,
      path: '/create-test',
      color: 'bg-primary-50 hover:bg-primary-100 border-primary-200',
      iconColor: 'text-primary-600'
    },
    {
      title: 'Previous Tests',
      description: 'View all your previously created tests',
      icon: History,
      path: '/previous-tests',
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Previous Feedbacks',
      description: 'View all your previous test evaluations',
      icon: BarChart3,
      path: '/previous-feedbacks',
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
      iconColor: 'text-blue-600'
    },
    {
      title: 'View Last Generated Test',
      description: appState.last_generated_test 
        ? `${appState.last_generated_test.subject} - ${appState.last_generated_test.chapter}`
        : 'No test generated yet',
      icon: FileText,
      path: appState.last_generated_test ? `/view-test/${appState.last_generated_test.id}` : '/view-test',
      color: 'bg-secondary-50 hover:bg-secondary-100 border-secondary-200',
      iconColor: 'text-secondary-600',
      disabled: !appState.last_generated_test
    },
    {
      title: 'View Last Feedback',
      description: appState.last_generated_feedback 
        ? `Review evaluation from ${new Date(appState.last_generated_feedback.created_at).toLocaleDateString()}`
        : 'No feedback available yet',
      icon: MessageSquare,
      path: appState.last_generated_feedback ? `/view-feedback/${appState.last_generated_feedback.id}` : '/view-feedback',
      color: 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200',
      iconColor: 'text-neutral-600',
      disabled: !appState.last_generated_feedback
    }
  ]

  const handleNavigation = (path: string, disabled?: boolean) => {
    if (!disabled) {
      navigate(path)
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Account Status Section - Full Width */}
        <Card className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center mr-4">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-dark mb-1">Account Status</h2>
                  <p className="text-sm text-neutral-600">Your current account information and credits</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-8">
                {/* Name */}
                <div className="text-center">
                  <div className="flex items-center mb-1">
                    <User className="h-4 w-4 text-neutral-500 mr-1" />
                    <span className="text-xs font-medium text-neutral-600 uppercase tracking-wide">Name</span>
                  </div>
                  <div className="text-lg font-bold text-dark">
                    {profile?.name || profile?.user_name || 'Not set'}
                  </div>
                </div>

                {/* Grade */}
                <div className="text-center">
                  <div className="flex items-center mb-1">
                    <GraduationCap className="h-4 w-4 text-neutral-500 mr-1" />
                    <span className="text-xs font-medium text-neutral-600 uppercase tracking-wide">Grade</span>
                  </div>
                  <div className="text-lg font-bold text-dark">
                    Grade {profile?.grade || profile?.class_level || 'N/A'}
                  </div>
                </div>

                {/* School */}
                <div className="text-center max-w-32">
                  <div className="flex items-center mb-1">
                    <School className="h-4 w-4 text-neutral-500 mr-1" />
                    <span className="text-xs font-medium text-neutral-600 uppercase tracking-wide">School</span>
                  </div>
                  <div className="text-lg font-bold text-dark truncate" title={profile?.school || 'Not set'}>
                    {profile?.school || 'Not set'}
                  </div>
                </div>

                {/* Credits */}
                <div className="text-center">
                  <div className="flex items-center mb-1">
                    <Coins className="h-4 w-4 text-yellow-600 mr-1" />
                    <span className="text-xs font-medium text-yellow-800 uppercase tracking-wide">Credits</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="text-2xl font-bold text-yellow-700">
                      {profile?.credits !== null && profile?.credits !== undefined ? profile.credits : '---'}
                    </span>
                  </div>
                  {profile?.credits !== null && profile?.credits !== undefined && profile.credits <= 5 && (
                    <div className="mt-1">
                      <span className="inline-block bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                        {profile.credits === 0 ? 'No Credits' : 'Low Credits'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-500 rounded-2xl shadow-lg mb-6">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-dark mb-4">
            Welcome Back to Evater
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Ready to create, evaluate, and enhance your learning experience
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {navigationOptions.map((option) => {
            const Icon = option.icon
            const isDisabled = option.disabled
            return (
              <div
                key={option.path}
                className={`cursor-pointer transition-all duration-300 ${option.color} hover:shadow-lg rounded-2xl shadow-sm border-2 transform hover:scale-105 hover:-translate-y-1 ${
                  isDisabled ? 'opacity-60 cursor-not-allowed hover:scale-100 hover:translate-y-0' : ''
                }`}
                onClick={() => handleNavigation(option.path, isDisabled)}
              >
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDisabled ? 'bg-neutral-200' : 'bg-white shadow-sm'}`}>
                      <Icon className={`h-6 w-6 ${isDisabled ? 'text-neutral-400' : option.iconColor}`} />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-dark mb-2">
                    {option.title}
                  </h3>
                  <p className={`text-sm leading-relaxed ${isDisabled ? 'text-neutral-400' : 'text-neutral-600'}`}>
                    {option.description}
                  </p>
                  {isDisabled && (
                    <div className="mt-3">
                      <span className="inline-block bg-neutral-200 text-neutral-500 px-2 py-1 rounded-full text-xs font-medium">
                        Not Available
                      </span>
                    </div>
                  )}
                </CardContent>
              </div>
            )
          })}
        </div>

        {/* Recent Activity Overview */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex items-center mb-6">
              <Clock className="h-6 w-6 text-primary-600 mr-3" />
              <h2 className="text-2xl font-bold text-dark">Recent Activity</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Last Generated Test */}
              <div className="p-6 bg-primary-50 rounded-xl border border-primary-200">
                <h3 className="font-semibold text-primary-900 mb-4 flex items-center">
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Last Generated Test
                </h3>
                {appState.last_generated_test ? (
                  <div className="space-y-2 text-sm text-primary-800">
                    <p><span className="font-medium">Subject:</span> {appState.last_generated_test.subject}</p>
                    <p><span className="font-medium">Chapter:</span> {appState.last_generated_test.chapter}</p>
                    <p><span className="font-medium">Grade:</span> {appState.last_generated_test.grade}</p>
                    <p><span className="font-medium">Created:</span> {new Date(appState.last_generated_test.created_at).toLocaleDateString()}</p>
                  </div>
                ) : (
                  <p className="text-sm text-primary-600 italic">No test generated in this session</p>
                )}
              </div>
              
              {/* Last Feedback */}
              <div className="p-6 bg-secondary-50 rounded-xl border border-secondary-200">
                <h3 className="font-semibold text-secondary-900 mb-4 flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Last Feedback
                </h3>
                {appState.last_generated_feedback ? (
                  <div className="space-y-2 text-sm text-secondary-800">
                    <p><span className="font-medium">Evaluation ID:</span> {appState.last_generated_feedback.id}</p>
                    <p><span className="font-medium">Created:</span> {new Date(appState.last_generated_feedback.created_at).toLocaleDateString()}</p>
                    <div className="inline-flex items-center px-2 py-1 bg-primary-200 text-primary-800 rounded-full text-xs font-medium mt-2">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mr-1"></div>
                      Completed
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-secondary-600 italic">No feedback generated in this session</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* General Feedback Section */}
        <Card className="bg-pink-50 border-2 border-pink-200">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Heart className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-dark mb-4">Help Us Improve</h2>
            <p className="text-neutral-600 mb-6 max-w-2xl mx-auto leading-relaxed">
              Your feedback helps us make Evater better for everyone. Share your thoughts, suggestions, or report any issues to help us create the perfect learning experience.
            </p>
            <button
              onClick={() => navigate('/general-feedback')}
              className="inline-flex items-center px-8 py-4 bg-pink-500 text-white font-medium rounded-xl hover:bg-pink-600 transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              <MessageSquare className="h-5 w-5 mr-3" />
              Share Your Feedback
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}