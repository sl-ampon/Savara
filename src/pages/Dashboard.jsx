// src/pages/Dashboard.jsx
// ─────────────────────────────────────────────────────
// Shows ALL goals the logged-in user belongs to.
// Queries the "goals" collection for any goal where
// coupleMembers array contains the current user's UID.
//
// Each card links to /goal/:goalId for the full detail view.
// A "+" FAB at the bottom right creates a new goal.
// ─────────────────────────────────────────────────────

import { useEffect, useState } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { Link, useNavigate } from 'react-router-dom'
import { auth, db } from '../firebase'
import { useAuth } from '../context/AuthContext'

// Returns the emoji for the current tree stage
function stageEmoji(progress) {
  if (progress >= 1.00) return '🌸'
  if (progress >= 0.75) return '🌸'
  if (progress >= 0.50) return '🌳'
  if (progress >= 0.25) return '🌿'
  return '🌱'
}

function GoalCard({ goal }) {
  const progress = goal.targetAmount > 0
    ? Math.min(goal.currentAmount / goal.targetAmount, 1)
    : 0
  const pct = Math.round(progress * 100)

  return (
    <Link
      to={`/goal/${goal.id}`}
      className="bg-white rounded-2xl border border-sakura-100 shadow-sm p-4 flex items-center gap-4 hover:border-sakura-300 transition"
    >
      {/* Stage emoji */}
      <div className="text-4xl w-12 text-center flex-shrink-0">{stageEmoji(progress)}</div>

      {/* Goal info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-700 truncate">{goal.title}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          ₱{(goal.currentAmount ?? 0).toLocaleString()} / ₱{goal.targetAmount.toLocaleString()}
        </p>
        {/* Mini progress bar */}
        <div className="h-1.5 bg-sakura-100 rounded-full mt-2 overflow-hidden">
          <div
            className="h-full bg-sakura-400 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Percentage */}
      <span className="text-sm font-bold text-sakura-500 flex-shrink-0">{pct}%</span>
    </Link>
  )
}

export default function Dashboard() {
  const { user }  = useAuth()
  const navigate  = useNavigate()

  const [goals,   setGoals]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    async function loadGoals() {
      // Query all goals where this user is a member
      const q    = query(
        collection(db, 'goals'),
        where('coupleMembers', 'array-contains', user.uid)
      )
      const snap = await getDocs(q)
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      // Sort newest first
      list.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
      setGoals(list)
      setLoading(false)
    }

    loadGoals()
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
    <div className="min-h-screen px-4 py-8 max-w-sm mx-auto pb-24">
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

      {/* Goals list */}
      {goals.length === 0 ? (
        <div className="text-center mt-16 space-y-4">
          <div className="text-6xl">🌱</div>
          <p className="text-gray-500 text-sm">No goals yet. Start your first one!</p>
          <Link
            to="/create-goal"
            className="inline-block bg-sakura-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-sakura-400 transition"
          >
            Create a goal
          </Link>
          <p className="text-xs text-gray-400">or</p>
          <Link
            to="/join"
            className="inline-block border border-sakura-300 text-sakura-500 px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-sakura-50 transition"
          >
            Join with invite code
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Your goals ({goals.length})
          </p>
          {goals.map((g) => <GoalCard key={g.id} goal={g} />)}
        </div>
      )}

      {/* Floating "+" button — always visible once user is logged in */}
      {goals.length > 0 && (
        <Link
          to="/create-goal"
          className="fixed bottom-6 right-6 w-14 h-14 bg-sakura-500 hover:bg-sakura-400 text-white rounded-full shadow-lg flex items-center justify-center text-2xl transition"
          title="Create a new goal"
        >
          +
        </Link>
      )}
    </div>
  )
}
