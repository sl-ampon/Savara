// src/pages/Login.jsx
// ─────────────────────────────────────────────────────
// Simple email/password login form using Firebase Auth.
// On success, Firebase updates the auth state and the
// router redirects the user to the Dashboard.
// ─────────────────────────────────────────────────────

import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { Link, useNavigate } from 'react-router-dom'
import { auth } from '../firebase'

export default function Login() {
  const navigate = useNavigate()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/')
    } catch (err) {
      setError('Incorrect email or password.')
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
          <h2 className="text-xl font-semibold text-gray-700">Welcome back</h2>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sakura-300"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sakura-500 hover:bg-sakura-400 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-60"
          >
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          No account yet?{' '}
          <Link to="/register" className="text-sakura-500 font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
