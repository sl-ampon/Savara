// src/pages/History.jsx
// ─────────────────────────────────────────────────────
// Shows a reverse-chronological list of all contributions
// made toward the active goal.
// ─────────────────────────────────────────────────────

import { useEffect, useState } from 'react'
import {
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore'
import { useNavigate, useParams } from 'react-router-dom'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'

export default function History() {
  const { goalId } = useParams()
  const { user }   = useAuth()
  const navigate   = useNavigate()

  const [contributions, setContributions] = useState([])
  const [loading, setLoading]             = useState(true)

  useEffect(() => {
    if (!user || !goalId) return

    async function load() {
      try {
        // Query contributions for this goal — sort client-side to avoid
        // needing a Firestore composite index on (goalId + createdAt)
        const q    = query(
          collection(db, 'contributions'),
          where('goalId', '==', goalId)
        )
        const snap = await getDocs(q)
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        // Sort newest first in JavaScript
        list.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
        setContributions(list)
      } catch (err) {
        console.error('Failed to load contributions:', err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [user, goalId])

  function formatDate(timestamp) {
    if (!timestamp) return ''
    const date = timestamp.toDate()
    return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="min-h-screen px-4 py-8 max-w-sm mx-auto">
      <button
        onClick={() => navigate(`/goal/${goalId}`)}
        className="text-sm text-gray-400 hover:text-gray-600 mb-6 block"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold text-gray-700 mb-1">Contributions 📋</h1>
      <p className="text-sm text-gray-400 mb-6">Every peso you've saved together.</p>

      {loading ? (
        <p className="text-gray-400 text-sm text-center mt-10">Loading…</p>
      ) : contributions.length === 0 ? (
        <div className="text-center mt-16 space-y-2">
          <div className="text-5xl">💸</div>
          <p className="text-gray-400 text-sm">No contributions yet. Start saving!</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {contributions.map((c) => (
            <li key={c.id} className="bg-white rounded-2xl border border-sakura-100 shadow-sm px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-700 text-sm">{c.userName}</span>
                <span className={`font-bold ${c.amount < 0 ? 'text-red-400' : 'text-sakura-500'}`}>
                  {c.amount < 0 ? `-₱${Math.abs(c.amount).toLocaleString()}` : `+₱${c.amount.toLocaleString()}`}
                </span>
              </div>
              {c.message && (
                <p className="text-xs text-gray-500 mt-1 italic">"{c.message}"</p>
              )}
              <p className="text-xs text-gray-400 mt-1">{formatDate(c.createdAt)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
