import React from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusCircle, FileText, MessageSquare, Heart, Sparkles, Clock, History, BarChart3, Coins, User, GraduationCap, School, Brain } from 'lucide-react'
import { Card, CardContent } from '../components/ui/Card'
import { Header } from '../components/layout/Header'
// import { BlogSection } from '../components/blog/BlogSection'
import { useAppState } from '../contexts/AppStateContext'
import { useAuthContext } from '../contexts/AuthContext'
import { useProfile } from '../hooks/useProfile'
import { BYPASS_AUTH } from '../lib/auth/devBypass'

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
      color: 'bg-primary-50 hover:bg-primary-100',
      iconColor: 'text-primary-600'
    },
    {
      title: 'Previous Tests',
      description: 'View all your previously created tests',
      icon: History,
      path: '/previous-tests',
      color: 'bg-purple-50 hover:bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Previous Feedbacks',
      description: 'View all your previous test evaluations',
      icon: BarChart3,
      path: '/previous-feedbacks',
      color: 'bg-blue-50 hover:bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'AI Viva Session',
      description: 'Interactive oral examination with AI',
      icon: Brain,
      path: '/viva',
      color: 'bg-purple-50 hover:bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      title: 'View Last Generated Test',
      description: appState.last_generated_test 
        ? `${appState.last_generated_test.subject} - ${appState.last_generated_test.chapter}`
        : 'No test generated yet',
      icon: FileText,
      path: appState.last_generated_test ? `/view-test/${appState.last_generated_test.id}` : '/view-test',
      color: 'bg-secondary-50 hover:bg-secondary-100',
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
      color: 'bg-neutral-50 hover:bg-neutral-100',
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
      {BYPASS_AUTH && (
        <div
          className="mx-4 sm:mx-6 lg:mx-8 mt-6 mb-2 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800"
          role="alert"
        >
          {/* DEV ONLY: highlight that auth is bypassed locally */}
          <p className="font-semibold">
            Auth bypass enabled for local development
          </p>
          <p>
            Remove VITE_BYPASS_AUTH before committing or deploying to
            production.
          </p>
        </div>
      )}

      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-48 h-auto">
            <img
              src="/Evater_logo_2.png"
              alt="Evater Logo"
              className="w-48 h-auto object-fill"
            />
          </div>
          <h1 className="text-4xl font-bold text-dark mb-4">
            Welcome back,{" "}
            {profile?.user_name ? profile.user_name.split(" ")[0] : "Educator"}!
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Ready to create, evaluate, and enhance your learning experience
          </p>
        </div>
        {/* Account Status Section - Full Width */}
        <Card className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between w-full">

                {/* Grade */}
                <div className="flex items-center flex-row sm:flex-col">
                  <div className="flex items-center">
                    <GraduationCap className="h-4 w-4 text-neutral-500 mr-1" />
                    <span className="text-xs font-medium text-neutral-600 uppercase tracking-wide">
                      Grade
                    </span>
                  </div>
                  <div className="text-base font-semibold ml-4 text-dark sm:text-lg">
                    Grade {profile?.grade || "N/A"}
                  </div>
                </div>

                {/* School */}
                <div className="flex items-center flex-row sm:flex-col">
                  <div className="flex items-center">
                    <School className="h-4 w-4 text-neutral-500 mr-1" />
                    <span className="text-xs font-medium text-neutral-600 uppercase tracking-wide">
                      School
                    </span>
                  </div>
                  <div
                    className="text-base font-semibold ml-4 text-dark sm:text-lg truncate"
                    title={profile?.school || "Not set"}
                  >
                    {profile?.school || "Not set"}
                  </div>
                </div>

                {/* Credits */}
                <div className="flex items-center flex-row sm:flex-col">
                  <div className="flex items-center">
                    <Coins className="h-4 w-4 text-yellow-600 mr-1" />
                    <span className="text-xs font-medium text-yellow-800 uppercase tracking-wide">
                      Credits
                    </span>
                  </div>
                  <div className="flex items-center ml-4 justify-center">
                    <span className="text-base font-semibold text-yellow-700 sm:text-2xl sm:font-bold">
                      {profile?.credits !== null &&
                      profile?.credits !== undefined
                        ? profile.credits
                        : "---"}
                    </span>
                  </div>
                  {profile?.credits !== null &&
                    profile?.credits !== undefined &&
                    profile.credits <= 5 && (
                      <div className="mt-1">
                        <span className="inline-block bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                          {profile.credits === 0 ? "No Credits" : "Low Credits"}
                        </span>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {navigationOptions.map((option) => {
            const Icon = option.icon;
            const isDisabled = option.disabled;
            return (
              <div
                key={option.path}
                className={`cursor-pointer transition-all duration-300 ${
                  option.color
                } hover:shadow-lg rounded-2xl shadow-sm border-2 transform hover:scale-105 hover:-translate-y-1 ${
                  isDisabled
                    ? "opacity-60 cursor-not-allowed hover:scale-100 hover:translate-y-0"
                    : ""
                }`}
                onClick={() => handleNavigation(option.path, isDisabled)}
              >
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isDisabled ? "bg-neutral-200" : "bg-white shadow-sm"
                      }`}
                    >
                      <Icon
                        className={`h-6 w-6 ${
                          isDisabled ? "text-neutral-400" : option.iconColor
                        }`}
                      />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-dark mb-2">
                    {option.title}
                  </h3>
                  <p
                    className={`text-sm leading-relaxed ${
                      isDisabled ? "text-neutral-400" : "text-neutral-600"
                    }`}
                  >
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
            );
          })}
        </div>

        {/* General Feedback Section */}
        <Card className="bg-primary-100">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Heart className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-dark mb-4">
              Help Us Improve
            </h2>
            <p className="text-neutral-600 mb-6 max-w-2xl mx-auto leading-relaxed">
              Your feedback helps us make Evater better for everyone. Share your
              thoughts, suggestions, or report any issues to help us create the
              perfect learning experience.
            </p>
            <button
              onClick={() => navigate("/general-feedback")}
              className="inline-flex items-center px-8 py-4 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              <MessageSquare className="h-5 w-5 mr-3" />
              Share Your Feedback
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
