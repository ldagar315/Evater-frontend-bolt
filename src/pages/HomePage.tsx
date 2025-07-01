import React from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusCircle, FileText, MessageSquare, Heart, Sparkles, Clock, History, BarChart3, Coins, User, GraduationCap, School, Crown } from 'lucide-react'
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

  const getCreditsStatus = () => {
    const credits = profile?.credits
    if (credits === null || credits === undefined) return { status: 'unknown', color: 'text-neutral-500', bgColor: 'bg-neutral-100' }
    if (credits >= 50) return { status: 'excellent', color: 'text-green-600', bgColor: 'bg-green-100' }
    if (credits >= 20) return { status: 'good', color: 'text-blue-600', bgColor: 'bg-blue-100' }
    if (credits >= 10) return { status: 'moderate', color: 'text-yellow-600', bgColor: 'bg-yellow-100' }
    if (credits >= 1) return { status: 'low', color: 'text-orange-600', bgColor: 'bg-orange-100' }
    return { status: 'empty', color: 'text-red-600', bgColor: 'bg-red-100' }
  }

  const creditsStatus = getCreditsStatus()

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section with Credits */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-500 rounded-2xl shadow-lg mb-6">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-dark mb-4">
            Welcome Back to Evater
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed mb-6">
            Ready to create, evaluate, and enhance your learning experience
          </p>
          
          {/* Credits Display */}
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl shadow-sm">
            <Coins className="h-6 w-6 text-yellow-600 mr-3" />
            <div className="text-left">
              <div className="text-sm font-medium text-yellow-800">Available Credits</div>
              <div className="text-2xl font-bold text-yellow-700">
                {profile?.credits !== null && profile?.credits !== undefined ? profile.credits : '---'}
              </div>
            </div>
          </div>
          
          {profile?.credits !== null && profile?.credits !== undefined && profile.credits <= 5 && (
            <div className="mt-4 inline-flex items-center px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
              <span className="text-sm text-red-700">
                {profile.credits === 0 
                  ? '⚠️ No credits remaining. Contact support to add more credits.'
                  : `⚠️ Low credits remaining (${profile.credits}). Consider adding more credits soon.`
                }
              </span>
            </div>
          )}
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

        {/* Account & Activity Overview */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex items-center mb-6">
              <Clock className="h-6 w-6 text-primary-600 mr-3" />
              <h2 className="text-2xl font-bold text-dark">Account & Recent Activity</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Beautiful Account Status */}
              <div className="relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-200/30 to-blue-200/30 rounded-full translate-y-12 -translate-x-12"></div>
                
                {/* Content */}
                <div className="relative p-6 border-2 border-purple-200/50 rounded-2xl backdrop-blur-sm">
                  {/* Header with Crown Icon */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Crown className="h-5 w-5 text-white" />
                      </div>
                      <div className="ml-3">
                        <h3 className="font-bold text-purple-900 text-lg">Account Status</h3>
                        <p className="text-xs text-purple-600">Premium Member</p>
                      </div>
                    </div>
                  </div>

                  {/* Profile Information */}
                  <div className="space-y-4">
                    {/* Name */}
                    <div className="flex items-center justify-between p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-purple-200/30">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <span className="ml-3 text-sm font-medium text-purple-800">Name</span>
                      </div>
                      <span className="font-semibold text-purple-900 text-sm">
                        {profile?.name || profile?.user_name || 'Not set'}
                      </span>
                    </div>

                    {/* Grade */}
                    <div className="flex items-center justify-between p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-purple-200/30">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-500 rounded-lg flex items-center justify-center">
                          <GraduationCap className="h-4 w-4 text-white" />
                        </div>
                        <span className="ml-3 text-sm font-medium text-purple-800">Grade</span>
                      </div>
                      <span className="font-semibold text-purple-900 text-sm">
                        Grade {profile?.grade || profile?.class_level || 'Not set'}
                      </span>
                    </div>

                    {/* School */}
                    <div className="flex items-center justify-between p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-purple-200/30">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg flex items-center justify-center">
                          <School className="h-4 w-4 text-white" />
                        </div>
                        <span className="ml-3 text-sm font-medium text-purple-800">School</span>
                      </div>
                      <span className="font-semibold text-purple-900 text-sm truncate max-w-32" title={profile?.school || 'Not set'}>
                        {profile?.school || 'Not set'}
                      </span>
                    </div>

                    {/* Credits - Highlighted */}
                    <div className="p-4 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 backdrop-blur-sm rounded-xl border-2 border-yellow-300/50 shadow-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 ${creditsStatus.bgColor} rounded-xl flex items-center justify-center shadow-md`}>
                            <Coins className={`h-5 w-5 ${creditsStatus.color}`} />
                          </div>
                          <div className="ml-3">
                            <span className="text-sm font-bold text-yellow-800">Credits</span>
                            <div className="flex items-center mt-1">
                              <div className={`w-2 h-2 ${creditsStatus.bgColor} rounded-full mr-1`}></div>
                              <span className="text-xs text-yellow-700 capitalize">{creditsStatus.status}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${creditsStatus.color}`}>
                            {profile?.credits !== null && profile?.credits !== undefined ? profile.credits : '---'}
                          </div>
                          <div className="text-xs text-yellow-700">Available</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-6">
                    <button
                      onClick={() => navigate('/profile')}
                      className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>

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