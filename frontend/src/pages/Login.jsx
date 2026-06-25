import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Login() {
  const [mode, setMode] = useState('login')
  return (
    <div className="container-edvax flex justify-center py-20">
      <div className="card w-full max-w-md p-8">
        <h1 className="font-serif text-2xl font-bold text-ink">
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          {mode === 'login' ? 'Log in to access your courses.' : 'Register to enrol and unlock recordings.'}
        </p>
        <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
          {mode === 'register' && (
            <input placeholder="Full name" className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-gold focus:outline-none" />
          )}
          <input type="email" placeholder="Email" className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-gold focus:outline-none" />
          <input type="password" placeholder="Password" className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-gold focus:outline-none" />
          <button className="btn-primary w-full">{mode === 'login' ? 'Log in' : 'Create account'}</button>
        </form>
        <p className="mt-5 text-center text-sm text-ink-muted">
          {mode === 'login' ? "Don't have an account? " : 'Already registered? '}
          <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="font-semibold text-gold-dark hover:underline">
            {mode === 'login' ? 'Register' : 'Log in'}
          </button>
        </p>
        <p className="mt-6 text-center text-xs text-ink-muted">
          Auth is wired to the backend in a later milestone. <Link to="/" className="underline">Back home</Link>
        </p>
      </div>
    </div>
  )
}
