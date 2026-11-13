import { useState } from 'react'
import { Ban, Megaphone, Package, Search, ShieldCheck, Store, Sprout, Truck, UserCheck } from 'lucide-react'
import { Avatar, Badge, Button, Card, ChipGroup, IconTile, SearchInput } from '../../components/ui'
import { LoadState, Notice, Pagination } from '../../components/Feedback'
import { api } from '../../api/client'
import { useAuth } from '../../auth/AuthContext'
import { useApi } from '../../hooks/useApi'
import { useQueryState } from '../../hooks/useQueryState'
import { formatDate } from '../../utils/format'
import { PERFIL_LABEL } from '../../utils/status'
import '../pages.css'
import '../pedidos.css'
import './admin.css'
import { useConfirm } from '../../components/Confirm'

const PROFILES = { Todos: undefined, Produtores: 'PRODUTOR', Varejistas: 'VAREJISTA', Admins: 'ADMIN' }
const SITUATION = { Todas: undefined, Ativas: 'false', Bloqueadas: 'true' }
const PROFILE_ICON = { PRODUTOR: Sprout, VAREJISTA: Store, ADMIN: ShieldCheck }

// Tela 14 · Administração de usuários (US15): listar, buscar, bloquear e desbloquear
export default function AdminUsuarios() {
  const confirmar = useConfirm()
  const { usuario: me } = useAuth()
  const [q, setQ] = useQueryState('q', '')
  const [profile, setProfile] = useQueryState('perfil', 'Todos')
  const [situation, setSituation] = useQueryState('situacao', 'Todas')
  const [pageRaw, setPage] = useQueryState('pagina', '1')
  const page = Number(pageRaw) || 1
  const [notice, setNotice] = useState(null)
  const summary = useApi('/admin/resumo')
  const { data, error, loading, reload, setData } = useApi('/admin/usuarios', {
    q: q || undefined,
    perfil: PROFILES[profile],
    bloqueado: SITUATION[situation],
    page,
  })
  const rows = data?.data ?? []
  const s = summary.data

  const toggleBlock = async (u) => {
    const bloqueado = !u.bloqueado
    if (bloqueado && !(await confirmar({ titulo: `Bloquear ${u.organizacao || u.nome}?`, mensagem: 'A pessoa perde o acesso na hora e as ofertas dela somem das buscas. Dá para desbloquear depois.', confirmar: 'Bloquear', perigo: true }))) return
    try {
      const updated = await api(`/admin/usuarios/${u.id}/bloqueio`, { method: 'PATCH', body: { bloqueado } })
      setData((d) => ({ ...d, data: d.data.map((x) => (x.id === u.id ? { ...x, ...updated } : x)) }))
      setNotice({ tone: 'success', text: `${u.organizacao || u.nome} ${bloqueado ? 'bloqueado' : 'desbloqueado'}.` })
      summary.reload()
    } catch (err) {
      setNotice({ tone: 'danger', text: err.message })
    }
  }

  const tiles = s && [
    { icon: Sprout, label: 'Produtores', value: s.produtores },
    { icon: Store, label: 'Varejistas', value: s.varejistas },
    { icon: Package, label: 'Ofertas ativas', value: s.ofertasAtivas },
    { icon: Truck, label: 'Pedidos', value: s.pedidos },
    { icon: Megaphone, label: 'Procura-se abertos', value: s.demandasAbertas },
    { icon: Ban, label: 'Bloqueados', value: s.bloqueados },
  ]

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="h1">Administração de usuários</h1>
          <p className="body-m t-secondary">Modere quem usa a Kultiva. Contas bloqueadas não entram e somem das buscas.</p>
        </div>
      </header>

      {tiles && (
        <div className="admin-tiles">
          {tiles.map((t) => (
            <Card key={t.label} className="admin-tile">
              <IconTile icon={t.icon} tone="brand" size={36} iconSize={18} />
              <span className="list__text">
                <span className="admin-tile__value">{t.value}</span>
                <span className="body-s t-tertiary">{t.label}</span>
              </span>
            </Card>
          ))}
        </div>
      )}

      {notice && (
        <Notice tone={notice.tone} onClose={() => setNotice(null)}>
          {notice.text}
        </Notice>
      )}

      <div className="row-between orders-toolbar">
        <div className="admin-filters">
          <ChipGroup label="Perfil" options={Object.keys(PROFILES)} value={profile} onChange={(v) => (setProfile(v), setPage('1'))} />
          <ChipGroup label="Situação" options={Object.keys(SITUATION)} value={situation} onChange={(v) => (setSituation(v), setPage('1'))} />
        </div>
        <SearchInput
          icon={Search}
          type="search"
          value={q}
          onChange={(e) => (setQ(e.target.value), setPage('1'))}
          placeholder="Nome, e-mail, empresa ou cidade"
          aria-label="Buscar usuários"
        />
      </div>

      <Card className="panel panel--flush">
        <LoadState loading={loading} error={error} onRetry={reload} empty={rows.length === 0} emptyText="Nenhum usuário com esses filtros.">
          <div className="table-wrap">
            <table className="table table--compact">
              <thead>
                <tr>
                  <th>Usuário</th>
                  <th>Perfil</th>
                  <th className="col-sec">Cidade</th>
                  <th className="num col-sec">Pedidos</th>
                  <th className="num col-sec">Cadastro</th>
                  <th>Situação</th>
                  <th>
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => {
                  const Icon = PROFILE_ICON[u.perfil]
                  return (
                    <tr key={u.id}>
                      <td className="wrap">
                        <span className="with-avatar">
                          <Avatar initials={u.iniciais} size={32} tone={u.bloqueado ? 'neutral' : 'brand'} />
                          <span className="list__text">
                            <span className="label-m">{u.organizacao || u.nome}</span>
                            <span className="body-s t-tertiary">
                              {u.nome} · {u.email}
                            </span>
                          </span>
                        </span>
                      </td>
                      <td>
                        <span className="with-avatar body-s">
                          <Icon size={16} aria-hidden />
                          {PERFIL_LABEL[u.perfil]}
                        </span>
                      </td>
                      <td className="col-sec">{u.cidade ? `${u.cidade}/${u.uf}` : '—'}</td>
                      <td className="num col-sec">{u.pedidos}</td>
                      <td className="num col-sec">{formatDate(u.criadoEm)}</td>
                      <td>
                        <Badge tone={u.bloqueado ? 'danger' : 'success'}>{u.bloqueado ? 'Bloqueado' : 'Ativo'}</Badge>
                      </td>
                      <td>
                        {u.id !== me.id && (
                          <span className="row-actions">
                            <Button size="s" variant={u.bloqueado ? 'secondary' : 'danger-ghost'} icon={u.bloqueado ? UserCheck : Ban} onClick={() => toggleBlock(u)}>
                              {u.bloqueado ? 'Desbloquear' : 'Bloquear'}
                            </Button>
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </LoadState>
        <Pagination page={page} totalPages={data?.totalPages} total={data?.total} onChange={(p) => setPage(String(p))} label="usuários" />
      </Card>
    </div>
  )
}
