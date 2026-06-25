import { useNavigate } from 'react-router-dom'
import { useHousehold } from '../store/HouseholdStore'
import { Icon, Avatar, CheckBox } from '../ui/components'
import { SyncBar, ActivityCard } from '../ui/sync-ui'
import {
  selectTodayTasks, selectLowStock, selectShoppingCount,
  selectMaintenanceDueCount, selectUpcomingMaintenance, maintState, daysUntil,
} from '../domain/selectors'

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}
const todayLabel = () =>
  new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })

export function Dashboard() {
  const { state, dispatch } = useHousehold()
  const nav = useNavigate()

  const todayTasks = selectTodayTasks(state)
  const lowStock = selectLowStock(state)
  const shoppingCount = selectShoppingCount(state)
  const maintDue = selectMaintenanceDueCount(state)
  const nextMaint = selectUpcomingMaintenance(state)[0]

  return (
    <>
      <header className="appheader">
        <div>
          <div className="sub">{greeting()}</div>
          <h1>{state.household.name}</h1>
          <div className="sub">{todayLabel()}</div>
        </div>
        <div className="weatherpill"><Icon.sun size={16} /> 28°</div>
      </header>

      <div className="content">
        {/* Multi-user sync: status + who am I (acts as this family member) */}
        <SyncBar />

        {/* Announcement (R1.8) */}
        <div className="announce">
          <Icon.bell size={18} />
          <span><strong>Maria’s birthday Sunday</strong> · order the cake</span>
        </div>

        {/* Stat tiles (R1.2–R1.5) */}
        <div className="stats">
          <button className="stat" onClick={() => nav('/tasks')}>
            <span className="iconchip" style={{ background: 'var(--brand-50)', color: 'var(--brand)' }}><Icon.tasks size={20} /></span>
            <div className="num">{todayTasks.length}</div><div className="lbl">Tasks today</div>
          </button>
          <button className="stat" onClick={() => nav('/maintenance')}>
            <span className="iconchip" style={{ background: 'var(--amber-50)', color: 'var(--amber)' }}><Icon.tools size={20} /></span>
            <div className="num">{maintDue}</div><div className="lbl">Maintenance due</div>
          </button>
          <button className="stat" onClick={() => nav('/inventory')}>
            <span className="iconchip" style={{ background: 'var(--red-50)', color: 'var(--red)' }}><Icon.alert size={20} /></span>
            <div className="num">{lowStock.length}</div><div className="lbl">Low stock</div>
          </button>
          <button className="stat" onClick={() => nav('/shopping')}>
            <span className="iconchip" style={{ background: 'var(--green-50)', color: 'var(--green)' }}><Icon.cart size={20} /></span>
            <div className="num">{shoppingCount}</div><div className="lbl">To buy</div>
          </button>
        </div>

        {/* Today's tasks (R1.2) */}
        <div className="card">
          <div className="card-title">Today’s tasks <span className="link" onClick={() => nav('/tasks')}>See all</span></div>
          {todayTasks.length === 0 && <div className="empty">All done for today 🎉</div>}
          {todayTasks.slice(0, 3).map(t => (
            <div className="row" key={t.id}>
              <CheckBox on={false} onClick={() => dispatch({ type: 'COMPLETE_TASK', id: t.id })} />
              <div className="grow">
                <div className="name">{t.title}</div>
                <div className="meta">{t.room} · {t.schedule}</div>
              </div>
              <Avatar name={t.assignee} />
            </div>
          ))}
        </div>

        {/* Upcoming maintenance (R1.3) */}
        {nextMaint && (
          <div className="card">
            <div className="card-title">Upcoming maintenance <span className="link" onClick={() => nav('/maintenance')}>View</span></div>
            <div className="row">
              <span className="iconchip" style={{ background: 'var(--amber-50)', color: 'var(--amber)' }}><Icon.tools size={20} /></span>
              <div className="grow">
                <div className="name">{nextMaint.name}</div>
                <div className="meta">{nextMaint.vendor} · ${nextMaint.estimatedCost}</div>
              </div>
              <DueBadge m={nextMaint} />
            </div>
          </div>
        )}

        {/* Low stock → add to shopping (R1.4 → R4) */}
        {lowStock.length > 0 && (
          <div className="card">
            <div className="card-title">Low stock · add to list</div>
            {lowStock.map(r => (
              <div className="row" key={r.id}>
                <span className="badge low">Low</span>
                <div className="grow">
                  <div className="name">{r.name}</div>
                  <div className="meta">{r.have} left · min {r.min}</div>
                </div>
                <button className="addbtn"
                  onClick={() => dispatch({ type: 'ADD_SHOPPING', name: r.name, category: r.kind === 'grocery' ? 'Groceries' : 'Supplies', source: r.kind })}>
                  + Add
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Live multi-device household activity feed */}
        <ActivityCard />

        {/* Quick actions (R1.7) */}
        <div className="section-label">Quick actions</div>
        <div className="chips">
          <button className="chip" onClick={() => nav('/tasks')}><span className="plus">+</span> Task</button>
          <button className="chip" onClick={() => nav('/shopping')}><span className="plus">+</span> Shopping</button>
          <button className="chip" onClick={() => nav('/inventory')}><span className="plus">+</span> Item</button>
          <button className="chip" onClick={() => nav('/grocery')}><span className="plus">+</span> Grocery</button>
        </div>
      </div>
    </>
  )
}

function DueBadge({ m }: { m: ReturnType<typeof selectUpcomingMaintenance>[number] }) {
  const st = maintState(m)
  const d = daysUntil(m.nextDue)!
  if (st === 'overdue') return <span className="badge overdue">{Math.abs(d)}d overdue</span>
  if (st === 'soon') return <span className="badge due">in {d}d</span>
  return <span className="badge scheduled">in {d}d</span>
}
