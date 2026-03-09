// src/components/CreditScore.jsx
// ─────────────────────────────────────────────────────
// Playful credit score bar — fixed to the top-right corner.
// Score range: 0–1000, default 500.
// Goes up when money is added, down when withdrawn.
// Animated face reacts to score changes.
// ─────────────────────────────────────────────────────

import { useEffect, useState, useRef } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'

const MAX_SCORE     = 1000
const DEFAULT_SCORE = 500

function getColors(score) {
  if (score >= 700) return { bar: '#34d399', bg: '#f0fdf4', border: '#86efac', text: '#15803d' }
  if (score >= 400) return { bar: '#fbbf24', bg: '#fffbeb', border: '#fde68a', text: '#b45309' }
  return             { bar: '#f87171', bg: '#fff1f2', border: '#fecdd3', text: '#be123c' }
}

function getLabel(score) {
  if (score >= 850) return 'Excellent ✨'
  if (score >= 700) return 'Great 🌟'
  if (score >= 500) return 'Good 👍'
  if (score >= 300) return 'Fair 😐'
  return 'Low 📉'
}

export default function CreditScore() {
  const { user } = useAuth()
  const [score, setScore]   = useState(DEFAULT_SCORE)
  const [dir,   setDir]     = useState(null) // 'up' | 'down' | null
  const prevRef  = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!user) return

    const ref   = doc(db, 'users', user.uid)
    const unsub = onSnapshot(ref, (snap) => {
      let s = DEFAULT_SCORE
      if (snap.exists() && snap.data().creditScore != null) {
        s = Math.max(0, Math.min(MAX_SCORE, snap.data().creditScore))
      } else {
        // First time — seed the document
        setDoc(ref, { creditScore: DEFAULT_SCORE }, { merge: true })
      }

      if (prevRef.current !== null && s !== prevRef.current) {
        setDir(s > prevRef.current ? 'up' : 'down')
        clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => setDir(null), 2500)
      }
      prevRef.current = s
      setScore(s)
    })

    return () => { unsub(); clearTimeout(timerRef.current) }
  }, [user])

  if (!user) return null

  const pct    = Math.round((score / MAX_SCORE) * 100)
  const colors = getColors(score)
  const label  = getLabel(score)
  const face   = dir === 'up' ? '😄' : dir === 'down' ? '😢' : '🙂'

  return (
    <>
      <style>{`
        @keyframes cs-bounce {
          0%   { transform: scale(1)    translateY(0);   }
          30%  { transform: scale(1.45) translateY(-7px);}
          60%  { transform: scale(0.9)  translateY(2px); }
          100% { transform: scale(1)    translateY(0);   }
        }
        @keyframes cs-shake {
          0%   { transform: scale(1)    translateX(0);  }
          20%  { transform: scale(0.85) translateX(-5px);}
          40%  { transform: scale(0.85) translateX(5px); }
          60%  { transform: scale(0.9)  translateX(-3px);}
          80%  { transform: scale(0.9)  translateX(3px); }
          100% { transform: scale(1)    translateX(0);  }
        }
        @keyframes cs-pulse-bar {
          0%,100% { opacity: 1; }
          50%     { opacity: 0.75; }
        }
        .cs-face-up   { animation: cs-bounce 0.55s ease forwards; }
        .cs-face-down { animation: cs-shake  0.55s ease forwards; }
        .cs-bar-pulse { animation: cs-pulse-bar 0.7s ease 2; }
      `}</style>

      <div
        className="fixed top-4 right-4 z-50 select-none"
        style={{
          background:   colors.bg,
          border:       `1.5px solid ${colors.border}`,
          borderRadius: '1rem',
          padding:      '8px 12px 10px',
          minWidth:     130,
          boxShadow:    '0 4px 20px rgba(0,0,0,0.10)',
        }}
      >
        {/* Face + label + number */}
        <div className="flex items-center gap-2 mb-1.5">
          <span
            className={`text-2xl leading-none inline-block ${dir === 'up' ? 'cs-face-up' : dir === 'down' ? 'cs-face-down' : ''}`}
          >
            {face}
          </span>

          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-extrabold uppercase tracking-widest leading-none" style={{ color: colors.text }}>
              Credit
            </p>
            <p className="text-[11px] font-semibold text-gray-600 leading-tight truncate">{label}</p>
          </div>

          <span className="text-sm font-black tabular-nums" style={{ color: colors.text }}>
            {score}
          </span>
        </div>

        {/* Bar */}
        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: '#e5e7eb' }}>
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${dir ? 'cs-bar-pulse' : ''}`}
            style={{ width: `${pct}%`, background: colors.bar }}
          />
        </div>

        {/* Direction tick */}
        {dir && (
          <p
            className="text-[10px] text-center font-bold mt-1"
            style={{ color: dir === 'up' ? '#15803d' : '#be123c' }}
          >
            {dir === 'up' ? '▲ Going up!' : '▼ Going down'}
          </p>
        )}
      </div>
    </>
  )
}
