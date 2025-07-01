import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, User, ChevronDown, Coins, GraduationCap, School } from 'lucide-react'
import { Button } from '../ui/Button'
import { useAuthContext } from '../../contexts/AuthContext'
import { useProfile } from '../../hooks/useProfile'

export function Header() {
  const navigate = useNavigate()
  const { user, signOut } = useAuthContext()
  const { profile } = useProfile(user?.id)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <header className="bg-white shadow-sm border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-8 flex items-center justify-center">
                <img 
                  src="/Evater_logo_2.png" 
                  alt="Evater Logo" 
                  className="h-8 w-auto object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-dark">
                  Evater
                </h1>
                <p className="text-xs text-neutral-600 font-medium">Next Gen Learning</p>
              </div>
            </div>
          </div>
          
          {user && (
            <div className="flex items-center space-x-4">
              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center text-sm text-neutral-700 bg-neutral-50 px-4 py-2 rounded-lg border border-neutral-200 hover:bg-neutral-100 transition-colors duration-200"
                >
                  <User className="h-4 w-4 mr-2 text-primary-600" />
                  <span className="font-medium max-w-32 truncate">
                    {profile?.name || profile?.user_name || user.email?.split('@')[0] || 'User'}
                  </span>
                  <ChevronDown className={`h-4 w-4 ml-2 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-neutral-200 z-50">
                    <div className="p-4 border-b border-neutral-200">
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                          <User className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-dark">
                            {profile?.name || profile?.user_name || 'User'}
                          </h3>
                          <p className="text-sm text-neutral-600">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      {/* Account Details */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <GraduationCap className="h-4 w-4 text-neutral-500 mr-2" />
                            <span className="text-sm text-neutral-600">Grade:</span>
                          </div>
                          <span className="text-sm font-medium text-dark">
                            Grade {profile?.grade || profile?.class_level || 'Not set'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <School className="h-4 w-4 text-neutral-500 mr-2" />
                            <span className="text-sm text-neutral-600">School:</span>
                          </div>
                          <span className="text-sm font-medium text-dark max-w-40 truncate" title={profile?.school || 'Not set'}>
                            {profile?.school || 'Not set'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="flex items-center">
                            <Coins className="h-4 w-4 text-yellow-600 mr-2" />
                            <span className="text-sm font-medium text-yellow-800">Credits:</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-lg font-bold text-yellow-700">
                              {profile?.credits !== null && profile?.credits !== undefined ? profile.credits : '---'}
                            </span>
                          </div>
                        </div>

                        {profile?.credits !== null && profile?.credits !== undefined && profile.credits <= 5 && (
                          <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-xs text-red-700">
                              {profile.credits === 0 
                                ? '⚠️ No credits remaining'
                                : `⚠️ Low credits (${profile.credits})`
                              }
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-neutral-200">
                        <button
                          onClick={() => {
                            setDropdownOpen(false)
                            navigate('/profile')
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors duration-200"
                        >
                          Edit Profile
                        </button>
                      </div>
                    </div>

                    <div className="p-4 border-t border-neutral-200">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDropdownOpen(false)
                          handleSignOut()
                        }}
                        className="w-full flex items-center justify-center text-neutral-700 hover:text-red-600"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}