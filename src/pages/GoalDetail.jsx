// src/pages/GoalDetail.jsx
// ─────────────────────────────────────────────────────
// Full detail view for a single goal.
// Reached by tapping a goal card on the Dashboard.
//
// Shows:
//  - Goal title & optional image
//  - Invite banner (if partner hasn't joined)
//  - Full tree progress component
//  - Last 5 contributions
//  - Buttons: Add money, See all history
// ─────────────────────────────────────────────────────

import { useEffect, useState } from 'react'
import { doc, onSnapshot, collection, query, where, getDocs, writeBatch } from 'firebase/firestore'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import TreeProgress from '../components/TreeProgress'

export default function GoalDetail() {
  const { goalId } = useParams()
  const { user }   = useAuth()
  const navigate   = useNavigate()

  const [goal,          setGoal]          = useState(null)
  const [contributions, setContributions] = useState([])
  const [loading,       setLoading]       = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting,      setDeleting]      = useState(false)

  useEffect(() => {
    if (!goalId) return

    // Real-time listener for the goal document
    const unsubGoal = onSnapshot(doc(db, 'goals', goalId), (snap) => {
      if (snap.exists()) {
        setGoal({ id: snap.id, ...snap.data() })
      }
      setLoading(false)
    })

    // One-time load of the last 5 contributions
    async function loadRecent() {
      const q    = query(
        collection(db, 'contributions'),
        where('goalId', '==', goalId)
      )
      const snap = await getDocs(q)
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      list.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
      setContributions(list.slice(0, 5))
    }

    loadRecent()
    return () => unsubGoal()
  }, [goalId])

  async function handleDelete() {
    setDeleting(true)
    try {
      // Use a batch to delete the goal + all its contributions atomically
      const batch = writeBatch(db)

      // Delete all contributions for this goal
      const q    = query(collection(db, 'contributions'), where('goalId', '==', goalId))
      const snap = await getDocs(q)
      snap.docs.forEach((d) => batch.delete(d.ref))

      // Delete the goal itself
      batch.delete(doc(db, 'goals', goalId))

      await batch.commit()
      navigate('/')
    } catch (err) {
      console.error('Failed to delete goal:', err)
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  function formatDate(timestamp) {
    if (!timestamp) return ''
    return timestamp.toDate().toLocaleDateString('en-PH', {
      month: 'short', day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading…</p>
      </div>
    )
  }

  if (!goal) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <p className="text-gray-400">Goal not found.</p>
        <button onClick={() => navigate('/')} className="text-sakura-500 text-sm">← Back to goals</button>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-8 max-w-sm mx-auto space-y-5">
      {/* Back + Delete */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          ← All goals
        </button>
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="text-xs text-red-400 hover:text-red-500 transition"
          >
            Delete goal
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Are you sure?</span>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs bg-red-500 hover:bg-red-400 text-white px-3 py-1 rounded-lg transition disabled:opacity-60"
            >
              {deleting ? 'Deleting…' : 'Yes, delete'}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Goal title */}
      <div className="bg-white rounded-2xl border border-sakura-100 shadow-sm p-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Goal</p>
        <h1 className="text-xl font-bold text-gray-700">{goal.title}</h1>
        {goal.goalImage && (
          <img
            src={goal.goalImage}
            alt={goal.title}
            className="mt-3 w-full h-36 object-cover rounded-xl"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        )}
      </div>

      {/* Invite partner banner */}
      {goal.coupleMembers?.length < 2 && (
        <div className="bg-sakura-50 border border-sakura-200 rounded-2xl p-4 space-y-2">
          <p className="text-sm font-semibold text-sakura-500">Invite your partner 💌</p>
          <p className="text-xs text-gray-500">Share this code so they can join:</p>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold tracking-widest text-gray-700 bg-white border border-sakura-200 rounded-xl px-4 py-2">
              {goal.inviteCode}
            </span>
            <button
              onClick={() => navigator.clipboard.writeText(goal.inviteCode)}
              className="text-xs text-sakura-500 hover:text-sakura-400 border border-sakura-200 rounded-lg px-3 py-2 bg-white transition"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      {/* Tree progress */}
      <div className="bg-white rounded-2xl border border-sakura-100 shadow-sm p-5">
        <TreeProgress
          currentAmount={goal.currentAmount ?? 0}
          targetAmount={goal.targetAmount}
        />
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          to={`/goal/${goalId}/contribute`}
          className="bg-sakura-500 text-white text-center py-3 rounded-xl font-semibold text-sm hover:bg-sakura-400 transition"
        >
          + Add money
        </Link>
        <Link
          to={`/goal/${goalId}/history`}
          className="bg-white border border-sakura-200 text-sakura-500 text-center py-3 rounded-xl font-semibold text-sm hover:bg-sakura-50 transition"
        >
          All history
        </Link>
      </div>

      {/* Withdraw button */}
      <Link
        to={`/goal/${goalId}/contribute?type=withdraw`}
        className="block w-full text-center py-2.5 rounded-xl font-semibold text-sm border border-red-100 text-red-400 hover:bg-red-50 transition"
      >
        - Withdraw money
      </Link>

      {/* Recent contributions */}
      {contributions.length > 0 && (
        <div className="bg-white rounded-2xl border border-sakura-100 shadow-sm p-5 space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Recent contributions</p>
          <ul className="space-y-2">
            {contributions.map((c) => (
              <li key={c.id} className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-sm font-medium text-gray-700">{c.userName}</span>
                  {c.message && (
                    <p className="text-xs text-gray-400 italic truncate">"{c.message}"</p>
                  )}
                  <p className="text-xs text-gray-400">{formatDate(c.createdAt)}</p>
                </div>
                <span className={`font-bold text-sm flex-shrink-0 ${c.amount < 0 ? 'text-red-400' : 'text-sakura-500'}`}>
                  {c.amount < 0 ? `-₱${Math.abs(c.amount).toLocaleString()}` : `+₱${c.amount.toLocaleString()}`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
