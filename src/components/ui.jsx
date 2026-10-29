import { useId } from 'react'
import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import './ui.css'

const cx = (...c) => c.filter(Boolean).join(' ')

/* Setas ←/→ (e Home/End) movem a seleção entre itens irmãos de um grupo (tabs, radiogroup) */
function arrowNav(e, items, value, onChange) {
  const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }
  const i = items.indexOf(value)
  let next
  if (e.key in keys) next = (i + keys[e.key] + items.length) % items.length
  else if (e.key === 'Home') next = 0
  else if (e.key === 'End') next = items.length - 1
  else return
  e.preventDefault()
  onChange?.(items[next])
  e.currentTarget.parentElement.children[next]?.focus()
}

/* Button — Variant: primary | secondary | ghost | accent · Size: m | s
   Com `to`, vira um <Link> (navegação); sem `to`, é um <button> (ação). */
export function Button({
  variant = 'primary',
  size = 'm',
  icon: Icon,
  iconRight: IconRight,
  block,
  className,
  children,
  to,
  as,
  ...props
}) {
  const Tag = as ?? (to ? Link : 'button')
  const iconSize = size === 's' ? 16 : 18
  return (
    <Tag
      className={cx('btn', `btn--${variant}`, `btn--${size}`, block && 'btn--block', className)}
      {...(Tag === 'button' ? { type: 'button' } : {})}
      {...(to ? { to } : {})}
      {...props}
    >
      {Icon && <Icon size={iconSize} strokeWidth={2} aria-hidden />}
      {children}
      {IconRight && <IconRight size={iconSize} strokeWidth={2} aria-hidden />}
    </Tag>
  )
}

export function IconButton({ icon: Icon, label, className, size = 20, ...props }) {
  return (
    <button type="button" className={cx('icon-btn', className)} aria-label={label} {...props}>
      <Icon size={size} strokeWidth={2} aria-hidden />
    </button>
  )
}

/* Badge — Tone: success | warning | neutral | info | danger | brand */
export function Badge({ tone = 'success', icon: Icon, className, children }) {
  return (
    <span className={cx('badge', `badge--${tone}`, className)}>
      {Icon && <Icon size={12} strokeWidth={2.5} aria-hidden />}
      {children}
    </span>
  )
}

/* Chip de filtro — selecionado = verde sólido com ✓ */
export function Chip({ selected, onClick, children, className }) {
  return (
    <button
      type="button"
      className={cx('chip', selected && 'chip--selected', className)}
      aria-pressed={!!selected}
      onClick={onClick}
    >
      {selected && <Check size={14} strokeWidth={2.5} aria-hidden />}
      {children}
    </button>
  )
}

export function ChipGroup({ options, value, onChange, multiple, className, label }) {
  const isSel = (o) => (multiple ? value.includes(o) : value === o)
  const toggle = (o) => {
    if (!onChange) return
    if (multiple) onChange(isSel(o) ? value.filter((v) => v !== o) : [...value, o])
    else onChange(o)
  }
  return (
    <div className={cx('chip-group', className)} role="group" aria-label={label}>
      {options.map((o) => (
        <Chip key={o} selected={isSel(o)} onClick={() => toggle(o)}>
          {o}
        </Chip>
      ))}
    </div>
  )
}

/* Campo de texto — label sempre visível acima; foco com borda verde 2px.
   `error` mostra a mensagem logo abaixo do campo e marca aria-invalid. */
export function Field({
  label,
  icon: Icon,
  hint,
  error,
  className,
  as = 'input',
  children,
  rightSlot,
  autoComplete = 'off',
  ...props
}) {
  const Control = as
  const errorId = useId()
  return (
    <label className={cx('field', error && 'field--error', className)}>
      {label && <span className="field__label">{label}</span>}
      <span className={cx('field__control', as === 'textarea' && 'field__control--area')}>
        {Icon && <Icon size={18} strokeWidth={2} className="field__icon" aria-hidden />}
        {children ?? (
          <Control
            className="field__input"
            autoComplete={autoComplete}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            {...props}
          />
        )}
        {rightSlot}
      </span>
      {hint && !error && <span className="field__hint">{hint}</span>}
      <span id={errorId} className="field__error" aria-live="polite">
        {error}
      </span>
    </label>
  )
}

export function SearchInput({ icon: Icon, className, autoComplete = 'off', ...props }) {
  return (
    <span className={cx('search-input', className)}>
      {Icon && <Icon size={18} strokeWidth={2} className="field__icon" aria-hidden />}
      <input className="field__input" autoComplete={autoComplete} {...props} />
    </span>
  )
}

export function Avatar({ initials, size = 40, tone = 'brand', className }) {
  return (
    <span
      className={cx('avatar', `avatar--${tone}`, className)}
      style={{ width: size, height: size, fontSize: size <= 32 ? 11 : 13 }}
      aria-hidden
    >
      {initials}
    </span>
  )
}

export function Card({ className, children, as: Tag = 'section', ...props }) {
  return (
    <Tag className={cx('card', className)} {...props}>
      {children}
    </Tag>
  )
}

export function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={cx('toggle', checked && 'toggle--on')}
      onClick={() => onChange?.(!checked)}
    >
      <span className="toggle__thumb" />
    </button>
  )
}

export function Checkbox({ checked, onChange, children }) {
  return (
    <label className="checkbox">
      <input type="checkbox" checked={checked} onChange={(e) => onChange?.(e.target.checked)} />
      <span className="checkbox__box">
        <Check size={14} strokeWidth={3} aria-hidden />
      </span>
      <span>{children}</span>
    </label>
  )
}

/* Ícone em quadrado tingido (KPIs, listas de evento) */
export function IconTile({ icon: Icon, tone = 'brand', size = 32, iconSize = 18, className }) {
  return (
    <span className={cx('icon-tile', `icon-tile--${tone}`, className)} style={{ width: size, height: size }}>
      <Icon size={iconSize} strokeWidth={2} aria-hidden />
    </span>
  )
}

export function Tabs({ tabs, value, onChange, className, label }) {
  return (
    <div className={cx('tabs', className)} role="tablist" aria-label={label}>
      {tabs.map((t) => (
        <button
          key={t}
          type="button"
          role="tab"
          aria-selected={value === t}
          tabIndex={value === t ? 0 : -1}
          className={cx('tabs__item', value === t && 'tabs__item--active')}
          onClick={() => onChange?.(t)}
          onKeyDown={(e) => arrowNav(e, tabs, value, onChange)}
        >
          {t}
        </button>
      ))}
    </div>
  )
}

/* Grupo de opções exclusivas (role=radiogroup) com navegação por setas */
export function Segmented({ options, value, onChange, className, itemClassName = 'segmented__item', activeClassName = 'segmented__item--active', label }) {
  const values = options.map((o) => o.value)
  return (
    <div className={cx(className ?? 'segmented')} role="radiogroup" aria-label={label}>
      {options.map(({ value: v, label: l, icon: Icon }) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          tabIndex={value === v ? 0 : -1}
          className={cx(itemClassName, value === v && activeClassName)}
          onClick={() => onChange?.(v)}
          onKeyDown={(e) => arrowNav(e, values, value, onChange)}
        >
          {Icon && <Icon size={18} strokeWidth={2} aria-hidden />}
          {l}
        </button>
      ))}
    </div>
  )
}

export { cx }
