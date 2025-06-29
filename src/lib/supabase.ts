import { createClient } from '@supabase/supabase-js'

// Debug environment variables
console.log('Environment check:', {
  NODE_ENV: import.meta.env.MODE,
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Missing',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing'
})

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    VITE_SUPABASE_URL: supabaseUrl ? 'Set' : 'Missing',
    VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? 'Set' : 'Missing'
  })
  
  // Create a fallback client to prevent app crashes
  const fallbackClient = createClient(
    'https://placeholder.supabase.co',
    'placeholder-key'
  )
  
  // Override methods to show helpful errors
  const originalAuth = fallbackClient.auth
  fallbackClient.auth = {
    ...originalAuth,
    getSession: async () => {
      console.error('Supabase not configured - missing environment variables')
      return { data: { session: null }, error: null }
    },
    onAuthStateChange: () => {
      console.error('Supabase not configured - missing environment variables')
      return { data: { subscription: { unsubscribe: () => {} } } }
    }
  } as any
  
  export { fallbackClient as supabase }
} else {
  export const supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      Users: {
        Row: {
          id: string
          created_at: string
          user_name: string | null
          email: string | null
          profile_picture: string | null
          created_by: string
          grade: number | null
          school: string | null
          credits: number | null
          name: string | null
          class_level: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_name?: string | null
          email?: string | null
          profile_picture?: string | null
          created_by?: string
          grade?: number | null
          school?: string | null
          credits?: number | null
          name?: string | null
          class_level?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          user_name?: string | null
          email?: string | null
          profile_picture?: string | null
          created_by?: string
          grade?: number | null
          school?: string | null
          credits?: number | null
          name?: string | null
          class_level?: number | null
        }
      }
      Questions_Created: {
        Row: {
          id: number
          created_at: string
          grade: string | null
          subject: string | null
          chapter: string | null
          difficulty_level: string | null
          length: string | null
          special_instructions: string[] | null
          test: Json
          created_by: string
        }
        Insert: {
          id?: number
          created_at?: string
          grade?: string | null
          subject?: string | null
          chapter?: string | null
          difficulty_level?: string | null
          length?: string | null
          special_instructions?: string[] | null
          test: Json
          created_by?: string
        }
        Update: {
          id?: number
          created_at?: string
          grade?: string | null
          subject?: string | null
          chapter?: string | null
          difficulty_level?: string | null
          length?: string | null
          special_instructions?: string[] | null
          test?: Json
          created_by?: string
        }
      }
      AnswerSheetImages: {
        Row: {
          id: number
          created_at: string
          image_url: string[] | null
          uploaded_by: string
          for_test: number | null
          feedback: number | null
        }
        Insert: {
          id?: number
          created_at?: string
          image_url?: string[] | null
          uploaded_by?: string
          for_test?: number | null
          feedback?: number | null
        }
        Update: {
          id?: number
          created_at?: string
          image_url?: string[] | null
          uploaded_by?: string
          for_test?: number | null
          feedback?: number | null
        }
      }
      FeedbackTest: {
        Row: {
          id: number
          created_at: string
          given_by: string
          for_test: number | null
          feedback: Json
        }
        Insert: {
          id?: number
          created_at?: string
          given_by?: string
          for_test?: number | null
          feedback: Json
        }
        Update: {
          id?: number
          created_at?: string
          given_by?: string
          for_test?: number | null
          feedback?: Json
        }
      }
      Chapter_contents: {
        Row: {
          id: number
          created_at: string
          grade: string | null
          subject: string | null
          board: string | null
          summary: string | null
          chapter: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          grade?: string | null
          subject?: string | null
          board?: string | null
          summary?: string | null
          chapter?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          grade?: string | null
          subject?: string | null
          board?: string | null
          summary?: string | null
          chapter?: string | null
        }
      }
      tests: {
        Row: {
          id: string
          user_id: string
          subject: string
          topic: string
          difficulty: string
          questions: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject: string
          topic: string
          difficulty: string
          questions: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject?: string
          topic?: string
          difficulty?: string
          questions?: Json
          created_at?: string
        }
      }
      evaluations: {
        Row: {
          id: string
          test_id: string
          answer_sheets: string[]
          feedback: Json
          created_at: string
        }
        Insert: {
          id?: string
          test_id: string
          answer_sheets?: string[]
          feedback?: Json
          created_at?: string
        }
        Update: {
          id?: string
          test_id?: string
          answer_sheets?: string[]
          feedback?: Json
          created_at?: string
        }
      }
    }
  }
}