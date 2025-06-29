import React from 'react'
import { GraduationCap } from 'lucide-react'

export function LoadingFallback() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-500 rounded-2xl shadow-lg mb-6 animate-pulse">
          <GraduationCap className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-dark mb-2">Loading Evater</h2>
        <p className="text-neutral-600 mb-4">Please wait while we prepare your learning experience...</p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    </div>
  )
}