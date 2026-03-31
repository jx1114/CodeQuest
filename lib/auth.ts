import { supabase } from './supabase'

export interface SignUpData {
  email: string
  password: string
  username: string
}

export interface AuthUser {
  id: string
  email: string
  username: string
}

/**
 * Sign up a new user with email, password, and username
 */
export async function signUp({ email, password, username }: SignUpData) {
  try {
    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      return { success: false, error: authError.message }
    }

    if (!authData.user) {
      return { success: false, error: 'Failed to create user' }
    }

    // Insert user profile in users table
    const { error: dbError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email,
          username,
        },
      ])

    if (dbError) {
      return { success: false, error: dbError.message }
    }

    // Create leaderboard stats entry
    await supabase
      .from('leaderboard_stats')
      .insert([
        {
          user_id: authData.user.id,
          total_points: 0,
          challenges_completed: 0,
        },
      ])

    return { success: true, user: authData.user }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

/**
 * Sign in an existing user
 */
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    if (!data.user) {
      return { success: false, error: 'Failed to sign in' }
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profileError) {
      return { success: false, error: profileError.message }
    }

    return { success: true, user: data.user, profile }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, user: null }
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    return { success: true, user, profile }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}