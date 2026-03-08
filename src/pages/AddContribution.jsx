// src/pages/AddContribution.jsx
// ─────────────────────────────────────────────────────
// Form to log a new money contribution to the active goal.
//
// What it does:
//  1. Reads the user's activeGoalId
//  2. Adds a document to the "contributions" collection
//  3. Increments currentAmount on the goal using Firestore increment()
//     (safe for two partners writing at the same time)
// ─────────────────────────────────────────────────────

import { useState } from 'react'
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  increment,
  serverTimestamp,
} from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'

export default function AddContribution() {
  const { user }  = useAuth()
  const navigate  = useNavigate()

  const [amount,  setAmount]  = useState('')
  const [message, setMessage] = useState('')
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const value = parseFloat(amount)
    if (isNaN(value) || value <= 0) {
      setError('Please enter a valid amount.')
      setLoading(false)
      return
    }

    try {
      // 1. Get the user's active goal ID
      const userSnap  = await getDoc(doc(db, 'users', user.uid))
      const goalId    = userSnap.data()?.activeGoalId

      if (!goalId) {
        setError("You don't have an active goal yet.")
        setLoading(false)
        return
      }

      // 2. Add the contribution document
      await addDoc(collection(db, 'contributions'), {
        goalId,
        userId:    user.uid,
        userName:  user.displayName,
        amount:    value,
        message:   message.trim() || null,
        createdAt: serverTimestamp(),
      })

      // 3. Atomically increment currentAmount on the goal
      //    increment() is safe when two users write at the same time
      await updateDoc(doc(db, 'goals', goalId), {
        currentAmount: increment(value),
      })

      navigate('/')
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

      <h1 className="text-2xl font-bold text-gray-700 mb-1">Add money 💸</h1>
      <p className="text-sm text-gray-400 mb-6">Every bit counts!</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Amount (₱)</label>
          <input
            type="number"
            required
            min="1"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 200"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sakura-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Message <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            maxLength={100}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder='e.g. "For our future ❤️"'
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sakura-300"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-sakura-500 hover:bg-sakura-400 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-60 mt-2"
        >
          {loading ? 'Saving…' : 'Add contribution'}
        </button>
      </form>
    </div>
  )
}
