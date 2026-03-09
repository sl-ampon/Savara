// src/pages/AddContribution.jsx
// ─────────────────────────────────────────────────────
// Form to log a money contribution to (or withdrawal from) a goal.
// goalId comes from the URL: /goal/:goalId/contribute
// ?type=withdraw switches to withdrawal mode.
//
// Both actions also update the user's credit score:
//   adding money  → credit score goes UP
//   withdrawing   → credit score goes DOWN
// ─────────────────────────────────────────────────────

import { useState, useEffect } from 'react'
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  setDoc,
  increment,
  serverTimestamp,
} from 'firebase/firestore'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'

// How many credit points each ₱100 is worth (capped at 20 per transaction)
function creditDelta(amount) {
  return Math.min(20, Math.max(1, Math.floor(amount / 100)))
}

export default function AddContribution() {
  const { goalId }       = useParams()
  const [searchParams]   = useSearchParams()
  const isWithdraw       = searchParams.get('type') === 'withdraw'
  const { user }         = useAuth()
  const navigate         = useNavigate()

  const [goal,    setGoal]    = useState(null)
  const [amount,  setAmount]  = useState('')
  const [message, setMessage] = useState('')
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  // Load goal so we can display available balance + validate withdrawals
  useEffect(() => {
    getDoc(doc(db, 'goals', goalId)).then((snap) => {
      if (snap.exists()) setGoal(snap.data())
    })
  }, [goalId])

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

    if (isWithdraw && value > (goal?.currentAmount ?? 0)) {
      setError(`You can't withdraw more than the current savings (₱${(goal?.currentAmount ?? 0).toLocaleString()}).`)
      setLoading(false)
      return
    }

    try {
      // 1. Record the contribution/withdrawal
      await addDoc(collection(db, 'contributions'), {
        goalId,
        userId:    user.uid,
        userName:  user.displayName,
        amount:    isWithdraw ? -value : value,
        type:      isWithdraw ? 'withdraw' : 'add',
        message:   message.trim() || null,
        createdAt: serverTimestamp(),
      })

      // 2. Update goal's currentAmount
      await updateDoc(doc(db, 'goals', goalId), {
        currentAmount: increment(isWithdraw ? -value : value),
      })

      // 3. Update credit score (bounded 0–1000)
      const userRef   = doc(db, 'users', user.uid)
      const userSnap  = await getDoc(userRef)
      const oldScore  = userSnap.exists() ? (userSnap.data().creditScore ?? 500) : 500
      const delta     = creditDelta(value)
      const newScore  = Math.max(0, Math.min(1000, oldScore + (isWithdraw ? -delta : delta)))
      await setDoc(userRef, { creditScore: newScore }, { merge: true })

      navigate(`/goal/${goalId}`)
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
        onClick={() => navigate(`/goal/${goalId}`)}
        className="text-sm text-gray-400 hover:text-gray-600 mb-6 block"
      >
        ← Back
      </button>

      {isWithdraw ? (
        <>
          <h1 className="text-2xl font-bold text-gray-700 mb-1">Withdraw money 💔</h1>
          <p className="text-sm text-gray-400 mb-1">This will lower your credit score.</p>
          {goal && (
            <p className="text-xs text-gray-400 mb-6">
              Available: <span className="font-semibold text-gray-600">₱{(goal.currentAmount ?? 0).toLocaleString()}</span>
            </p>
          )}
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-gray-700 mb-1">Add money 💸</h1>
          <p className="text-sm text-gray-400 mb-6">Every bit counts!</p>
        </>
      )}

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
            placeholder={isWithdraw ? 'e.g. "Emergency fund needed"' : 'e.g. "For our future ❤️"'}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sakura-300"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full font-semibold py-2.5 rounded-xl transition disabled:opacity-60 mt-2 text-white ${
            isWithdraw
              ? 'bg-red-400 hover:bg-red-300'
              : 'bg-sakura-500 hover:bg-sakura-400'
          }`}
        >
          {loading
            ? 'Saving…'
            : isWithdraw
              ? 'Withdraw'
              : 'Add contribution'}
        </button>
      </form>
    </div>
  )
}
