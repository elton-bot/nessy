import React, { useState } from 'react'

/* ---------------- Icons (inline SVG, stroke-based) ---------------- */
type IconProps = { size?: number; className?: string }
const S = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
    strokeLinecap="round" strokeLinejoin="round" {...p} />
)
export const Icon = {
  home: (p: IconProps) => <S width={p.size} height={p.size} className={p.className}><path d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /></S>,
  box: (p: IconProps) => <S width={p.size} height={p.size} className={p.className}><path d="M3.3 7 12 12l8.7-5M12 12v9.5M3.3 7 12 2.5 20.7 7v10L12 21.5 3.3 17z" /></S>,
  cart: (p: IconProps) => <S width={p.size} height={p.size} className={p.className}><circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" /><path d="M2 3h2l2.2 12.2a1 1 0 0 0 1 .8h9.4a1 1 0 0 0 1-.8L21 7H5.2" /></S>,
  tasks: (p: IconProps) => <S width={p.size} height={p.size} className={p.className}><path d="M4 7h11M4 12h11M4 17h7" /><path d="m17 7 1.5 1.5L21 6M17 16l1.5 1.5L21 15" /></S>,
  dots: (p: IconProps) => <S width={p.size} height={p.size} className={p.className}><circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" /></S>,
  tools: (p: IconProps) => <S width={p.size} height={p.size} className={p.className}><path d="M14.7 6.3a3.5 3.5 0 0 0 4.6 4.6L21 12l-7 7-2-2 1.1-4.7a3.5 3.5 0 0 0-4.6-4.6L6 5l2-2 4.7 1.1z" /></S>,
  alert: (p: IconProps) => <S width={p.size} height={p.size} className={p.className}><path d="M12 4 2 20h20L12 4zM12 10v5M12 18h.01" /></S>,
  leaf: (p: IconProps) => <S width={p.size} height={p.size} className={p.className}><path d="M11 20A7 7 0 0 1 4 13c0-4 3-8 9-9 1 6-2 10-6 11M4 13c8 0 9-4 9-9" /></S>,
  fridge: (p: IconProps) => <S width={p.size} height={p.size} className={p.className}><rect x="6" y="2.5" width="12" height="19" rx="2" /><path d="M6 10h12M9 6v1.5M9 13v2.5" /></S>,
  plus: (p: IconProps) => <S width={p.size} height={p.size} className={p.className}><path d="M12 5v14M5 12h14" /></S>,
  check: (p: IconProps) => <S width={p.size} height={p.size} className={p.className}><path d="m5 12 5 5L20 6" /></S>,
  bell: (p: IconProps) => <S width={p.size} height={p.size} className={p.className}><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" /></S>,
  sun: (p: IconProps) => <S width={p.size} height={p.size} className={p.className}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" /></S>,
}

/* ---------------- Stepper ---------------- */
export function Stepper({ value, onDec, onInc }: { value: number; onDec: () => void; onInc: () => void }) {
  return (
    <div className="stepper" role="group" aria-label="quantity">
      <button aria-label="decrease" onClick={onDec}>−</button>
      <span className="qty">{value}</span>
      <button aria-label="increase" onClick={onInc}>+</button>
    </div>
  )
}

/* ---------------- Checkbox ---------------- */
export function CheckBox({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button className={`check ${on ? 'on' : ''}`} aria-pressed={on} aria-label="toggle" onClick={onClick}>
      {on && <Icon.check />}
    </button>
  )
}

/* ---------------- Segmented tabs ---------------- */
export function Segmented<T extends string>({ options, value, onChange }: {
  options: T[]; value: T; onChange: (v: T) => void
}) {
  return (
    <div className="segmented" role="tablist">
      {options.map(o => (
        <button key={o} role="tab" aria-selected={o === value}
          className={o === value ? 'active' : ''} onClick={() => onChange(o)}>{o}</button>
      ))}
    </div>
  )
}

/* ---------------- Avatar ---------------- */
export const Avatar = ({ name }: { name: string }) => (
  <span className="avatar" title={name}>{name.slice(0, 1).toUpperCase()}</span>
)

/* ---------------- Bottom sheet ---------------- */
export function Sheet({ title, onClose, children }: {
  title: string; onClose: () => void; children: React.ReactNode
}) {
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()} role="dialog" aria-label={title}>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  )
}

/* ---------------- Field helpers ---------------- */
export function TextField({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <input type={type} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} />
    </div>
  )
}
export function SelectField<T extends string>({ label, value, onChange, options }: {
  label: string; value: T; onChange: (v: T) => void; options: readonly T[]
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value as T)}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

/* small hook for sheet open state */
export function useSheet() {
  const [open, setOpen] = useState(false)
  return { open, openSheet: () => setOpen(true), closeSheet: () => setOpen(false) }
}
