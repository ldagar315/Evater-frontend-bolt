import React from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, User } from 'lucide-react'
import { Button } from '../ui/Button'
import { useAuthContext } from '../../contexts/AuthContext'

export function Header() {
  const navigate = useNavigate()
  const { user, signOut } = useAuthContext()

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

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
              <div className="flex items-center text-sm text-neutral-700 bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-200">
                <User className="h-4 w-4 mr-2 text-primary-600" />
                <span className="font-medium">{user.email}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center text-neutral-700 hover:text-primary-600"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}