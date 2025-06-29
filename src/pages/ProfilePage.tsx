import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Header } from '../components/layout/Header'
import { useAuthContext } from '../contexts/AuthContext'
import { useProfile } from '../hooks/useProfile'

export function ProfilePage() {
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const { profile, loading, createProfile, updateProfile } = useProfile(user?.id)
  
  const [name, setName] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('')
  const [school, setSchool] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const gradeOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: `Grade ${i + 1}`
  }))

  useEffect(() => {
    if (profile) {
      setName(profile.name || '')
      setSelectedGrade(profile.grade?.toString() || profile.class_level?.toString() || '')
      setSchool(profile.school || '')
    }
  }, [profile])

  useEffect(() => {
    if (!loading && profile) {
      navigate('/home')
    }
  }, [loading, profile, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const profileData = {
        name,
        grade: parseInt(selectedGrade),
        class_level: parseInt(selectedGrade),
        school,
        email: user?.email || '',
      }

      const { error } = profile
        ? await updateProfile(profileData)
        : await createProfile(profileData)

      if (error) {
        setError('Failed to save profile')
      } else {
        navigate('/home')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream">
        <Header />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-bold text-dark">
              {profile ? 'Update Profile' : 'Complete Your Profile'}
            </h2>
            <p className="text-sm text-neutral-600">
              {profile 
                ? 'Update your information below' 
                : 'Please provide your details to get started with Evater'
              }
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Enter your full name"
              />
              
              <Select
                label="Grade"
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                options={[{ value: '', label: 'Select your grade' }, ...gradeOptions]}
                required
              />
              
              <Input
                label="School"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                required
                placeholder="Enter your school name"
              />
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              
              <Button
                type="submit"
                className="w-full"
                loading={submitting}
              >
                {profile ? 'Update Profile' : 'Create Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}