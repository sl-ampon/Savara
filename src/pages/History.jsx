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
  orderBy,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'

export default function History() {
  const { user }    = useAuth()
  const navigate    = useNavigate()

  const [contributions, setContributions] = useState([])
  const [loading, setLoading]             = useState(true)

  useEffect(() => {
    if (!user) return

    async function load() {
      // Get the user's active goal ID
      const userSnap = await getDoc(doc(db, 'users', user.uid))
      const goalId   = userSnap.data()?.activeGoalId

      if (!goalId) {
        setLoading(false)
        return
      }

      // Query all contributions for this goal, newest first
      const q    = query(
        collection(db, 'contributions'),
        where('goalId', '==', goalId),
        orderBy('createdAt', 'desc')
      )
      const snap = await getDocs(q)
      setContributions(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }

    load()
  }, [user])

  function formatDate(timestamp) {
    if (!timestamp) return ''
    const date = timestamp.toDate()
    return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="min-h-screen px-4 py-8 max-w-sm mx-auto">
      <button
        onClick={() => navigate('/')}
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
                <span className="text-sakura-500 font-bold">+₱{c.amount.toLocaleString()}</span>
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
