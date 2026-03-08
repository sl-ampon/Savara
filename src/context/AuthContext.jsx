// src/context/AuthContext.jsx
// ─────────────────────────────────────────────────────
// Provides the currently logged-in user to the whole app.
// Any component can call useAuth() to get the user object
// without having to pass props down through every layer.
// ─────────────────────────────────────────────────────

import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(undefined) // undefined = still loading
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Firebase calls this whenever login state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    return unsubscribe // cleanup on unmount
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
