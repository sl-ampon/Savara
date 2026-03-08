// src/pages/Dashboard.jsx
// ─────────────────────────────────────────────────────
// The main screen after login.
//
// What it does:
//  1. Loads the user's Firestore document to get their activeGoalId
//  2. Loads that goal document in real-time (onSnapshot)
//  3. Renders the TreeProgress component based on goal amounts
//  4. Links to Add Contribution and Contribution History pages
//  5. Provides a logout button
// ─────────────────────────────────────────────────────

import { useEffect, useState } from 'react'
import { doc, getDoc, onSnapshot } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { Link, useNavigate } from 'react-router-dom'
import { auth, db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import TreeProgress from '../components/TreeProgress'

export default function Dashboard() {
  const { user }    = useAuth()
  const navigate    = useNavigate()
  const [goal, setGoal]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    let unsubscribeGoal = () => {}

    async function loadGoal() {
      // Step 1: read the user's profile to find their active goal
      const userSnap = await getDoc(doc(db, 'users', user.uid))
      const userData  = userSnap.data()

      if (!userData?.activeGoalId) {
        setLoading(false)
        return
      }

      // Step 2: subscribe to the goal document for real-time updates
      unsubscribeGoal = onSnapshot(
        doc(db, 'goals', userData.activeGoalId),
        (snap) => {
          if (snap.exists()) {
            setGoal({ id: snap.id, ...snap.data() })
          }
          setLoading(false)
        }
      )
    }

    loadGoal()
    return () => unsubscribeGoal()
  }, [user])

  async function handleLogout() {
    await signOut(auth)
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-8 max-w-sm mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-sakura-500">Savara 🌸</h1>
          <p className="text-sm text-gray-400">Hi, {user?.displayName} 👋</p>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-400 hover:text-red-400 transition"
        >
          Log out
        </button>
      </div>

      {/* No goal yet */}
      {!goal ? (
        <div className="text-center mt-16 space-y-4">
          <div className="text-6xl">🌱</div>
          <p className="text-gray-500 text-sm">You don't have a goal yet.</p>
          <Link
            to="/create-goal"
            className="inline-block bg-sakura-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-sakura-400 transition"
          >
            Create a goal
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Goal title */}
          <div className="bg-white rounded-2xl border border-sakura-100 shadow-sm p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Your goal</p>
            <h2 className="text-xl font-bold text-gray-700">{goal.title}</h2>
          </div>

          {/* Tree progress */}
          <div className="bg-white rounded-2xl border border-sakura-100 shadow-sm p-5">
            <TreeProgress
              currentAmount={goal.currentAmount ?? 0}
              targetAmount={goal.targetAmount}
            />
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/add-contribution"
              className="bg-sakura-500 text-white text-center py-3 rounded-xl font-semibold text-sm hover:bg-sakura-400 transition"
            >
              + Add money
            </Link>
            <Link
              to="/history"
              className="bg-white border border-sakura-200 text-sakura-500 text-center py-3 rounded-xl font-semibold text-sm hover:bg-sakura-50 transition"
            >
              History
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
