import { NavLink, Route, Routes } from 'react-router-dom'
import { Icon } from './ui/components'
import { Dashboard } from './screens/Dashboard'
import { Inventory } from './screens/Inventory'
import { Grocery } from './screens/Grocery'
import { Shopping } from './screens/Shopping'
import { Tasks } from './screens/Tasks'
import { Maintenance } from './screens/Maintenance'

function StatusBar() {
  return (
    <div className="statusbar">
      <span>9:41</span>
      <span className="icons">●●●● ▢</span>
    </div>
  )
}

function TabBar() {
  const tabs = [
    { to: '/', label: 'Home', icon: Icon.home, end: true },
    { to: '/inventory', label: 'Inventory', icon: Icon.box },
    { to: '/shopping', label: 'Shopping', icon: Icon.cart },
    { to: '/tasks', label: 'Tasks', icon: Icon.tasks },
    { to: '/more', label: 'More', icon: Icon.dots },
  ]
  return (
    <nav className="tabbar">
      {tabs.map(t => {
        const I = t.icon
        return (
          <NavLink key={t.to} to={t.to} end={t.end}
            className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}>
            <I /><span>{t.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}

export function App() {
  return (
    <div className="shell">
      <StatusBar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/grocery" element={<Grocery />} />
        <Route path="/shopping" element={<Shopping />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/more" element={<More />} />
      </Routes>
      <TabBar />
    </div>
  )
}

/* "More" hub → Grocery + Maintenance + reset */
import { useNavigate } from 'react-router-dom'
import { useHousehold } from './store/HouseholdStore'
function More() {
  const nav = useNavigate()
  const { dispatch } = useHousehold()
  return (
    <>
      <header className="appheader"><div><h1>More</h1><div className="sub">Modules & settings</div></div></header>
      <div className="content">
        <button className="card" style={{ width: '100%', textAlign: 'left', border: 'none' }} onClick={() => nav('/grocery')}>
          <div className="row" style={{ padding: 0, border: 'none' }}>
            <span className="iconchip" style={{ background: 'var(--green-50)', color: 'var(--green)' }}><Icon.fridge size={20} /></span>
            <div className="grow"><div className="name">Grocery &amp; Pantry</div><div className="meta">Pantry, fridge, freezer &amp; expiry</div></div>
            <span style={{ color: 'var(--ink-3)' }}>›</span>
          </div>
        </button>
        <button className="card" style={{ width: '100%', textAlign: 'left', border: 'none' }} onClick={() => nav('/maintenance')}>
          <div className="row" style={{ padding: 0, border: 'none' }}>
            <span className="iconchip" style={{ background: 'var(--amber-50)', color: 'var(--amber)' }}><Icon.tools size={20} /></span>
            <div className="grow"><div className="name">Home Maintenance</div><div className="meta">Servicing schedule &amp; vendors</div></div>
            <span style={{ color: 'var(--ink-3)' }}>›</span>
          </div>
        </button>
        <div className="section-label" style={{ marginTop: 18 }}>Prototype</div>
        <button className="btn ghost" style={{ width: '100%' }}
          onClick={() => { if (confirm('Reset all data to the seeded demo?')) dispatch({ type: 'RESET_SEED' }) }}>
          Reset demo data
        </button>
      </div>
    </>
  )
}
