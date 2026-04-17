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

export interface ConfirmPasswordResetData {
  email: string
  code: string
  newPassword: string
}

export interface VerifyPasswordResetCodeData {
  email: string
  code: string
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

/**
 * Request a password reset verification code (OTP) by email.
 */
export async function requestPasswordResetCode(email: string) {
  try {
    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail) {
      return { success: false, error: 'Email is required' }
    }

    const { data: existingUser, error: lookupError } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (lookupError) {
      return { success: false, error: 'Unable to verify email. Please try again.' }
    }

    if (!existingUser) {
      return { success: false, error: 'No account found with that email.' }
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        shouldCreateUser: false,
      },
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

/**
 * Verify OTP code sent to email and update password.
 */
export async function confirmPasswordResetWithCode({ email, code, newPassword }: ConfirmPasswordResetData) {
  try {
    const normalizedEmail = email.trim().toLowerCase()
    const normalizedCode = code.trim()

    if (!normalizedEmail || !normalizedCode || !newPassword) {
      return { success: false, error: 'Email, code, and password are required.' }
    }

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: normalizedEmail,
      token: normalizedCode,
      type: 'email',
    })

    if (verifyError) {
      return { success: false, error: verifyError.message }
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    await supabase.auth.signOut()

    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

/**
 * Verify reset code. A valid code creates a temporary authenticated session.
 */
export async function verifyPasswordResetCode({ email, code }: VerifyPasswordResetCodeData) {
  try {
    const normalizedEmail = email.trim().toLowerCase()
    const normalizedCode = code.trim()

    if (!normalizedEmail || !normalizedCode) {
      return { success: false, error: 'Email and verification code are required.' }
    }

    const { error } = await supabase.auth.verifyOtp({
      email: normalizedEmail,
      token: normalizedCode,
      type: 'email',
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

/**
 * Update password after reset code is already verified.
 */
export async function setNewPasswordAfterCodeVerification(newPassword: string) {
  try {
    if (!newPassword) {
      return { success: false, error: 'New password is required.' }
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    await supabase.auth.signOut()

    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}