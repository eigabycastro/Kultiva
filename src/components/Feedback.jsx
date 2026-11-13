import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Info, RotateCw } from 'lucide-react'
import { Button, cx } from './ui'
import './feedback.css'

/* Aviso em linha: sucesso, erro ou informação */
export function Notice({ tone = 'info', children, onClose, className }) {
  if (!children) return null
  const Icon = tone === 'success' ? CheckCircle2 : tone === 'danger' ? AlertCircle : Info
  return (
    <div className={cx('notice', `notice--${tone}`, className)} role={tone === 'danger' ? 'alert' : 'status'}>
      <Icon size={18} strokeWidth={2} aria-hidden />
      <div className="notice__text body-s">{children}</div>
      {onClose && (
        <button type="button" className="notice__close label-s" onClick={onClose}>
          Fechar
        </button>
      )}
    </div>
  )
}

/* Envelope para listas vindas da API: carregando / erro / vazio / conteúdo */
export function LoadState({ loading, error, empty, emptyText = 'Nada por aqui ainda.', onRetry, children, skeleton = 3 }) {
  if (error) {
    return (
      <div className="load-state">
        <Notice tone="danger">{error.message}</Notice>
        {onRetry && (
          <Button variant="secondary" size="s" icon={RotateCw} onClick={onRetry}>
            Tentar de novo
          </Button>
        )}
      </div>
    )
  }
  if (loading && empty) {
    return (
      <div className="skeleton-list" aria-busy="true" aria-label="Carregando">
        {Array.from({ length: skeleton }, (_, i) => (
          <span key={i} className="skeleton" />
        ))}
      </div>
    )
  }
  if (empty) return <p className="empty body-m t-secondary">{emptyText}</p>
  return <div className={cx('load-state__content', loading && 'is-refreshing')}>{children}</div>
}

/* Paginação: "Página 2 de 5" + anterior/próxima + números */
export function Pagination({ page, totalPages, total, onChange, label = 'resultados' }) {
  if (!totalPages || totalPages <= 1) {
    return total != null ? <p className="pagination__info body-s t-tertiary">{total} {label}</p> : null
  }
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  )
  return (
    <nav className="pagination" aria-label="Paginação">
      <span className="body-s t-tertiary">
        {total} {label} · página {page} de {totalPages}
      </span>
      <div className="pagination__pages">
        <button type="button" className="icon-btn" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Página anterior">
          <ChevronLeft size={18} aria-hidden />
        </button>
        {pages.map((p, i) => (
          <span key={p} className="pagination__item">
            {i > 0 && p - pages[i - 1] > 1 && <span className="t-tertiary">…</span>}
            <button
              type="button"
              className={cx('pagination__num', p === page && 'is-active')}
              aria-current={p === page ? 'page' : undefined}
              onClick={() => onChange(p)}
            >
              {p}
            </button>
          </span>
        ))}
        <button type="button" className="icon-btn" disabled={page >= totalPages} onClick={() => onChange(page + 1)} aria-label="Próxima página">
          <ChevronRight size={18} aria-hidden />
        </button>
      </div>
    </nav>
  )
}
