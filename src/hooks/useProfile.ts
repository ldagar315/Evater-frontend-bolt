import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { UserProfile } from '../types'

export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    fetchProfile()
  }, [userId])

  const fetchProfile = async () => {
    if (!userId) return

    try {
      const { data, error } = await supabase
        .from('Users')
        .select('*')
        .eq('created_by', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const createProfile = async (profileData: Omit<UserProfile, 'id' | 'created_at' | 'created_by'>) => {
    if (!userId) return { error: 'No user ID' }

    try {
      const { data, error } = await supabase
        .from('Users')
        .insert([{ ...profileData, created_by: userId }])
        .select()
        .single()

      if (error) throw error
      setProfile(data)
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!userId || !profile) return { error: 'No user ID or profile' }

    try {
      const { data, error } = await supabase
        .from('Users')
        .update(updates)
        .eq('id', profile.id)
        .select()
        .single()

      if (error) throw error
      setProfile(data)
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  return {
    profile,
    loading,
    createProfile,
    updateProfile,
  }
}