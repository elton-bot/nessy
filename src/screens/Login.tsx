import { useState } from 'react'
import { useHousehold } from '../store/HouseholdStore'

const MEMBERS = ['Liza', 'Andre', 'Joaquin', 'Maria']

export function Login() {
  const { login } = useHousehold()
  const [name, setName] = useState('Liza')
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    setBusy(true); setError(null)
    const err = await login(name, pin)
    setBusy(false)
    if (err) setError(err)
  }

  return (
    <div className="login">
      <div className="login-brand">
        <div className="login-logo">N</div>
        <h1>Nessy</h1>
        <p>Your household, organized.</p>
      </div>

      <div className="login-card">
        <div className="login-label">The Reyes home</div>
        <div className="login-members">
          {MEMBERS.map(m => (
            <button key={m} className={`login-member ${name === m ? 'on' : ''}`}
              onClick={() => { setName(m); setError(null) }}>
              <span className="avatar">{m[0]}</span>{m}
            </button>
          ))}
        </div>

        <label className="login-field">
          <span>PIN</span>
          <input type="password" inputMode="numeric" value={pin} placeholder="••••"
            onChange={e => setPin(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && pin && submit()} autoFocus />
        </label>

        {error && <div className="login-error">{error}</div>}

        <button className="btn primary" style={{ width: '100%' }} disabled={busy || !pin}
          onClick={submit}>{busy ? 'Signing in…' : 'Sign in'}</button>

        <div className="login-hint">Demo PIN for every member: <b>1234</b></div>
      </div>
    </div>
  )
}
