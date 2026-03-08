// src/components/TreeProgress.jsx
// ─────────────────────────────────────────────────────
// Displays the correct tree image and progress bar
// based on how much of the goal has been saved.
//
// The tree "grows" through 5 stages as a simple
// image swap — no animation or canvas needed.
// ─────────────────────────────────────────────────────

// Tree stage images — SVGs stored in /public/trees/
const STAGES = [
  { min: 0,    label: 'Seed 🌱',           image: '/trees/seed.svg'     },
  { min: 0.25, label: 'Sprout 🌿',         image: '/trees/sprout.svg'   },
  { min: 0.50, label: 'Small Tree 🌳',     image: '/trees/small.svg'    },
  { min: 0.75, label: 'Blooming Tree 🌸',  image: '/trees/blooming.svg' },
  { min: 1.00, label: 'Full Sakura 🌸🌸', image: '/trees/full.svg'     },
]

function getStage(progress) {
  // Walk backwards to find the highest stage that applies
  for (let i = STAGES.length - 1; i >= 0; i--) {
    if (progress >= STAGES[i].min) return STAGES[i]
  }
  return STAGES[0]
}

export default function TreeProgress({ currentAmount, targetAmount }) {
  const progress = targetAmount > 0 ? currentAmount / targetAmount : 0
  const clamped  = Math.min(progress, 1)
  const stage    = getStage(clamped)
  const pct      = Math.round(clamped * 100)

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Tree image */}
      <div className="w-48 h-48 flex items-center justify-center">
        <img
          src={stage.image}
          alt={stage.label}
          className="w-full h-full object-contain drop-shadow-md"
          onError={(e) => {
            // Fallback emoji if image file is missing
            e.currentTarget.style.display = 'none'
            e.currentTarget.nextSibling.style.display = 'flex'
          }}
        />
        {/* Emoji fallback shown if image fails to load */}
        <div className="hidden text-8xl items-center justify-center w-full h-full">
          {pct >= 100 ? '🌸' : pct >= 75 ? '🌸' : pct >= 50 ? '🌳' : pct >= 25 ? '🌿' : '🌱'}
        </div>
      </div>

      {/* Stage label */}
      <p className="text-sm font-semibold text-sakura-500">{stage.label}</p>

      {/* Progress bar */}
      <div className="w-full max-w-xs">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>₱{currentAmount.toLocaleString()} saved</span>
          <span>{pct}%</span>
        </div>
        <div className="h-3 bg-sakura-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-sakura-400 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 text-right mt-1">
          Goal: ₱{targetAmount.toLocaleString()}
        </p>
      </div>
    </div>
  )
}
