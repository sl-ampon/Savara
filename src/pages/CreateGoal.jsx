// src/pages/CreateGoal.jsx
// ─────────────────────────────────────────────────────
// Form to create a new shared savings goal.
//
// What it does:
//  1. Accepts a title, target amount, and optional image URL
//  2. Saves a new document to the Firestore "goals" collection
//  3. Updates the user's "activeGoalId" in their profile
//  4. Generates a short invite code so the partner can join
// ─────────────────────────────────────────────────────

import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'

// Generates a random 6-character uppercase code, e.g. "K8X2TQ"
function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export default function CreateGoal() {
  const { user }  = useAuth()
  const navigate  = useNavigate()

  const [title,     setTitle]     = useState('')
  const [target,    setTarget]    = useState('')
  const [imageUrl,  setImageUrl]  = useState('')
  const [error,     setError]     = useState('')
  const [loading,   setLoading]   = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const targetAmount = parseFloat(target)
    if (isNaN(targetAmount) || targetAmount <= 0) {
      setError('Please enter a valid target amount.')
      setLoading(false)
      return
    }

    try {
      // Create the goal document in Firestore
      const goalRef = await addDoc(collection(db, 'goals'), {
        title,
        targetAmount,
        currentAmount:         0,
        goalImage:             imageUrl.trim() || null,
        coupleMembers:         [user.uid],
        inviteCode:            generateInviteCode(),
        celebratedMilestones:  [],
        createdAt:             serverTimestamp(),
      })

      navigate(`/goal/${goalRef.id}`)
    } catch (err) {
      setError('Something went wrong. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen px-4 py-8 max-w-sm mx-auto">
      <button
        onClick={() => navigate('/')}
        className="text-sm text-gray-400 hover:text-gray-600 mb-6 block"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold text-gray-700 mb-1">New goal 🌱</h1>
      <p className="text-sm text-gray-400 mb-6">What are you saving for together?</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Goal title</label>
          <input
            type="text"
            required
            maxLength={60}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Nintendo Switch"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sakura-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Target amount (₱)</label>
          <input
            type="number"
            required
            min="1"
            step="any"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="e.g. 15000"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sakura-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Goal image URL <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sakura-300"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-sakura-500 hover:bg-sakura-400 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-60 mt-2"
        >
          {loading ? 'Creating…' : 'Create goal'}
        </button>
      </form>
    </div>
  )
}
