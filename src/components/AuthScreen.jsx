import { useState } from 'react'
import { Github, LockKeyhole, Mail, Cloud, ShieldCheck } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function AuthScreen() {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    setError('')
    try {
      if (mode === 'signup') {
        const { data, error: authError } = await supabase.auth.signUp({ email: email.trim(), password })
        if (authError) throw authError
        if (data.session) setMessage('Account created. Signing you in…')
        else setMessage('Account created. Check your email to confirm your account, then sign in.')
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
        if (authError) throw authError
      }
    } catch (authError) {
      setError(authError.message || 'Authentication failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  async function signInWithGitHub() {
    setBusy(true)
    setError('')
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: { redirectTo: window.location.origin },
      })
      if (authError) throw authError
    } catch (authError) {
      setError(authError.message || 'Could not start GitHub sign-in. Check the provider setup in Supabase.')
      setBusy(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand-mark"><Cloud size={25} /></div>
        <div className="eyebrow auth-eyebrow"><span className="eyebrow-line" /> PERSONAL PROJECT DIRECTORY</div>
        <h1>Project <span>Hub</span></h1>
        <p className="auth-intro">Sign in to keep your projects synced across your devices.</p>
        <div className="auth-benefits">
          <span><Cloud size={15} /> Cloud synchronisation</span>
          <span><ShieldCheck size={15} /> Private to your account</span>
        </div>
        <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
          <button type="button" className={mode === 'signin' ? 'active' : ''} onClick={() => { setMode('signin'); setError(''); setMessage('') }}>Sign in</button>
          <button type="button" className={mode === 'signup' ? 'active' : ''} onClick={() => { setMode('signup'); setError(''); setMessage('') }}>Create account</button>
        </div>
        <form className="auth-form" onSubmit={submit}>
          <label htmlFor="auth-email">Email address</label>
          <div className="input-shell"><Mail size={17} /><input id="auth-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required /></div>
          <label htmlFor="auth-password">Password</label>
          <div className="input-shell"><LockKeyhole size={17} /><input id="auth-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" minLength={6} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required /></div>
          {error && <p className="auth-error" role="alert">{error}</p>}
          {message && <p className="auth-message" role="status">{message}</p>}
          <button className="button button-primary auth-submit" type="submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in to Project Hub'}</button>
        </form>
        <div className="auth-divider"><span>OR</span></div>
        <button type="button" className="button button-secondary auth-github" onClick={signInWithGitHub} disabled={busy}><Github size={17} /> Continue with GitHub</button>
        <p className="auth-footnote">GitHub sign-in works after enabling the GitHub provider in your Supabase authentication settings. Email sign-in is available once Supabase is configured.</p>
      </section>
    </main>
  )
}
