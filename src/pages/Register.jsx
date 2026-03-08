// src/pages/Register.jsx
// ─────────────────────────────────────────────────────
// Registration form. Creates a new Firebase Auth user
// and stores a basic profile document in Firestore.
// ─────────────────────────────────────────────────────

import { useState } from 'react'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { Link, useNavigate } from 'react-router-dom'
import { auth, db } from '../firebase'

export default function Register() {
  const navigate = useNavigate()

  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // 1. Create the Firebase Auth account
      const { user } = await createUserWithEmailAndPassword(auth, email, password)

      // 2. Save their display name on the auth profile
      await updateProfile(user, { displayName: name })

      // 3. Create a user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
        partnerId:    null,
        activeGoalId: null,
        createdAt:    serverTimestamp(),
      })

      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center text-sakura-500 mb-1">Savara 🌸</h1>
        <p className="text-center text-gray-500 mb-8 text-sm">Save together, grow together.</p>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-sakura-100 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">Create an account</h2>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your first name"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sakura-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sakura-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sakura-300"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sakura-500 hover:bg-sakura-400 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-60"
          >
            {loading ? 'Creating account…' : 'Sign up'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-sakura-500 font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
