import { useState } from 'react'
import { useHousehold } from '../store/HouseholdStore'
import { Avatar, CheckBox, Segmented, Sheet, TextField, SelectField, useSheet } from '../ui/components'
import { daysUntil, isTodayOrPast } from '../domain/selectors'
import { todayISO } from '../domain/dates'
import type { TaskFilter, Schedule, Room } from '../domain/types'

const FILTERS: TaskFilter[] = ['Today', 'Upcoming', 'All']
const SCHEDULES: Schedule[] = ['Daily', 'Weekly', 'Monthly', 'Custom']

function dueLabel(iso: string) {
  const d = daysUntil(iso)
  if (d == null) return ''
  if (d < 0) return `${Math.abs(d)}d overdue`
  if (d === 0) return 'Today'
  if (d === 1) return 'Tomorrow'
  return `in ${d}d`
}

export function Tasks() {
  const { state, dispatch } = useHousehold()
  const sheet = useSheet()
  const filter = state.taskFilter

  const visible = state.tasks.filter(t => {
    if (filter === 'Today') return isTodayOrPast(t.dueDate) && !t.done
    if (filter === 'Upcoming') return !t.done && (daysUntil(t.dueDate) ?? 0) > 0
    return true
  }).sort((a, b) => (daysUntil(a.dueDate) ?? 0) - (daysUntil(b.dueDate) ?? 0))

  return (
    <>
      <header className="appheader">
        <div><h1>Tasks</h1><div className="sub">Household chores & routines</div></div>
        <button className="addbtn" onClick={sheet.openSheet}>+ Add</button>
      </header>

      <div className="content">
        <Segmented options={FILTERS} value={filter} onChange={f => dispatch({ type: 'SET_TASK_FILTER', filter: f })} />

        <div className="card">
          {visible.length === 0 && <div className="empty">No tasks here.</div>}
          {visible.map(t => {
            const overdue = (daysUntil(t.dueDate) ?? 0) < 0 && !t.done
            return (
              <div className={`row ${t.done ? 'fade-done' : ''}`} key={t.id}>
                <CheckBox on={t.done} onClick={() => dispatch({ type: 'COMPLETE_TASK', id: t.id })} />
                <div className="grow">
                  <div className={`name ${t.done ? 'strike' : ''}`}>{t.title}</div>
                  <div className="meta">
                    {t.room ? `${t.room} · ` : ''}
                    <span className="badge neutral" style={{ marginRight: 5 }}>{t.schedule}</span>
                    {t.lastCompleted ? `next ${dueLabel(t.dueDate)}` : (overdue
                      ? <span style={{ color: 'var(--red)', fontWeight: 700 }}>{dueLabel(t.dueDate)}</span>
                      : dueLabel(t.dueDate))}
                  </div>
                </div>
                <Avatar name={t.assignee} />
              </div>
            )
          })}
        </div>
      </div>

      {sheet.open && <AddTaskSheet members={state.household.members} rooms={state.rooms} onClose={sheet.closeSheet}
        onSave={task => { dispatch({ type: 'ADD_TASK', task }); sheet.closeSheet() }} />}
    </>
  )
}

function AddTaskSheet({ members, rooms, onClose, onSave }: {
  members: string[]; rooms: Room[]; onClose: () => void
  onSave: (task: { title: string; assignee: string; schedule: Schedule; room: Room; dueDate: string }) => void
}) {
  const [title, setTitle] = useState('')
  const [assignee, setAssignee] = useState(members[0])
  const [schedule, setSchedule] = useState<Schedule>('Weekly')
  const [room, setRoom] = useState<Room>(rooms[0])
  const [dueDate, setDueDate] = useState(todayISO())
  const valid = title.trim().length > 0
  return (
    <Sheet title="Add task" onClose={onClose}>
      <TextField label="Task" value={title} onChange={setTitle} placeholder="e.g. Clean the garage" />
      <div className="grid2">
        <SelectField label="Assign to" value={assignee} onChange={setAssignee} options={members} />
        <SelectField label="Schedule" value={schedule} onChange={setSchedule} options={SCHEDULES} />
      </div>
      <div className="grid2">
        <SelectField label="Room" value={room} onChange={setRoom} options={rooms} />
        <TextField label="Due date" value={dueDate} onChange={setDueDate} type="date" />
      </div>
      <div className="sheet-actions">
        <button className="btn ghost" onClick={onClose}>Cancel</button>
        <button className="btn primary" disabled={!valid} style={{ opacity: valid ? 1 : .5 }}
          onClick={() => onSave({ title: title.trim(), assignee, schedule, room, dueDate })}>Add task</button>
      </div>
    </Sheet>
  )
}
