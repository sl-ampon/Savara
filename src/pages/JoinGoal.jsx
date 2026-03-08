// src/pages/JoinGoal.jsx
// ─────────────────────────────────────────────────────
// Lets a partner join an existing goal using a 6-character
// invite code that was generated when the goal was created.
//
// What it does:
//  1. User types the invite code
//  2. App queries Firestore for a goal with that inviteCode
//  3. Validates: goal exists, not already full (2 members),
//     and the user isn't already a member
//  4. Adds the user's UID to coupleMembers on the goal
//  5. Sets activeGoalId on the user's profile
//  6. Redirects to Dashboard
// ─────────────────────────────────────────────────────

import { useState } from 'react'
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'

export default function JoinGoal() {
  const { user }  = useAuth()
  const navigate  = useNavigate()

  const [code,    setCode]    = useState('')
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const trimmedCode = code.trim().toUpperCase()

    try {
      // 1. Find the goal with this invite code
      const q    = query(
        collection(db, 'goals'),
        where('inviteCode', '==', trimmedCode)
      )
      const snap = await getDocs(q)

      if (snap.empty) {
        setError('No goal found with that code. Double-check and try again.')
        setLoading(false)
        return
      }

      const goalDoc  = snap.docs[0]
      const goalData = goalDoc.data()

      // 2. Make sure the goal isn't already full
      if (goalData.coupleMembers.length >= 2) {
        setError('This goal already has two members.')
        setLoading(false)
        return
      }

      // 3. Make sure the user isn't already in this goal
      if (goalData.coupleMembers.includes(user.uid)) {
        setError('You are already a member of this goal.')
        setLoading(false)
        return
      }

      // 4. Add the user to coupleMembers (arrayUnion prevents duplicates)
      await updateDoc(doc(db, 'goals', goalDoc.id), {
        coupleMembers: arrayUnion(user.uid),
      })

      navigate(`/goal/${goalDoc.id}`)
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

      <h1 className="text-2xl font-bold text-gray-700 mb-1">Join a goal 🌸</h1>
      <p className="text-sm text-gray-400 mb-6">
        Ask your partner for the invite code and enter it below.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Invite code</label>
          <input
            type="text"
            required
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. K8X2TQ"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-center text-xl font-bold tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-sakura-300"
          />
        </div>

        <button
          type="submit"
          disabled={loading || code.trim().length < 6}
          className="w-full bg-sakura-500 hover:bg-sakura-400 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-60"
        >
          {loading ? 'Joining…' : 'Join goal'}
        </button>
      </form>
    </div>
  )
}
