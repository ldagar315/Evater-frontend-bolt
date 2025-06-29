import React from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthForm } from '../components/auth/AuthForm'
import { Footer } from '../components/layout/Footer'

export function AuthPage() {
  const navigate = useNavigate()

  const handleAuthSuccess = () => {
    navigate('/profile')
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <div className="flex-1">
        <AuthForm onSuccess={handleAuthSuccess} />
      </div>
      <Footer />
    </div>
  )
}