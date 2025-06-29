import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuthContext } from './contexts/AuthContext'
import { AppStateProvider } from './contexts/AppStateContext'
import { useProfile } from './hooks/useProfile'
import { AuthPage } from './pages/AuthPage'
import { ProfilePage } from './pages/ProfilePage'
import { HomePage } from './pages/HomePage'
import { CreateTestPage } from './pages/CreateTestPage'
import { ViewTestPage } from './pages/ViewTestPage'
import { SubmitFeedbackPage } from './pages/SubmitFeedbackPage'
import { ViewFeedbackPage } from './pages/ViewFeedbackPage'
import { GeneralFeedbackPage } from './pages/GeneralFeedbackPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthContext()
  const { profile, loading: profileLoading } = useProfile(user?.id)

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  if (!profile) {
    return <Navigate to="/profile" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  const { user, loading } = useAuthContext()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <Routes>
      {!user ? (
        <>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </>
      ) : (
        <>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/home" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />
          <Route path="/create-test" element={
            <ProtectedRoute>
              <CreateTestPage />
            </ProtectedRoute>
          } />
          <Route path="/view-test/:testId?" element={
            <ProtectedRoute>
              <ViewTestPage />
            </ProtectedRoute>
          } />
          <Route path="/submit-feedback/:testId?" element={
            <ProtectedRoute>
              <SubmitFeedbackPage />
            </ProtectedRoute>
          } />
          <Route path="/view-feedback/:evaluationId?" element={
            <ProtectedRoute>
              <ViewFeedbackPage />
            </ProtectedRoute>
          } />
          <Route path="/general-feedback" element={
            <ProtectedRoute>
              <GeneralFeedbackPage />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </>
      )}
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppStateProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AppStateProvider>
    </AuthProvider>
  )
}

export default App