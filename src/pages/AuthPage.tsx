import React from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthForm } from '../components/auth/AuthForm'

export function AuthPage() {
  const navigate = useNavigate()

  const handleAuthSuccess = () => {
    navigate('/profile')
  }

  return <AuthForm onSuccess={handleAuthSuccess} />
}