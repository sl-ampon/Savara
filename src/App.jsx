// src/App.jsx
// ─────────────────────────────────────────────────────
// Root of the app. Sets up:
//  - AuthProvider   → makes the logged-in user available everywhere
//  - BrowserRouter  → enables page navigation via URLs
//  - Route guards   → redirect logged-out users to /login,
//                     redirect logged-in users away from /login
// ─────────────────────────────────────────────────────

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

import Login           from './pages/Login'
import Register        from './pages/Register'
import Dashboard       from './pages/Dashboard'
import CreateGoal      from './pages/CreateGoal'
import AddContribution from './pages/AddContribution'
import History         from './pages/History'
import JoinGoal        from './pages/JoinGoal'
import GoalDetail      from './pages/GoalDetail'

// PrivateRoute: only renders children when the user is logged in.
// While Firebase is still figuring out the auth state, shows a blank screen
// (prevents a flash-redirect to /login on page refresh).
function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? children : <Navigate to="/login" replace />
}

// PublicRoute: redirects already-logged-in users away from auth pages.
function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <Navigate to="/" replace /> : children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth pages — only accessible when logged OUT */}
          <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          {/* App pages — only accessible when logged IN */}
          <Route path="/"                           element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/create-goal"                element={<PrivateRoute><CreateGoal /></PrivateRoute>} />
          <Route path="/join"                       element={<PrivateRoute><JoinGoal /></PrivateRoute>} />
          <Route path="/goal/:goalId"               element={<PrivateRoute><GoalDetail /></PrivateRoute>} />
          <Route path="/goal/:goalId/contribute"    element={<PrivateRoute><AddContribution /></PrivateRoute>} />
          <Route path="/goal/:goalId/history"       element={<PrivateRoute><History /></PrivateRoute>} />

          {/* Fallback: unknown URLs go to Dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
