import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Calendar,
  Check,
  ChevronLeft,
  Ellipsis,
  Package,
  Paperclip,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
} from 'lucide-react'
import { useRole } from '../components/layout/AppLayout'
import { Avatar, Badge, Button, SearchInput, cx } from '../components/ui'
import { ChatBubble } from '../components/cards'
import { ProduceThumb } from '../components/ProduceArt'
import { chatMessages, conversations } from '../data/mock'
import { formatTime } from '../utils/format'
import Title from '../components/Title'
import './negociacoes.css'

const COUNTERPART = {
  varejista: { name: 'João Silva', initials: 'JS', sub: 'Sítio Boa Vista' },
  produtor: { name: 'Supermercado Mais', initials: 'SM', sub: 'Varejista · 8 km' },
}

function Proposal({ onAccept }) {
  return (
    <div className="proposal">
      <div className="proposal__title">
        <Sparkles size={16} aria-hidden />
        Proposta de pedido
      </div>
      <div className="row-between body-s">
        <span className="t-secondary">120 maços × R$ 3,20</span>
        <span className="label-m">R$ 384,00</span>
      </div>
      <div className="row-between body-s">
        <span className="t-secondary">Entrega</span>
        <span className="label-s">Qui, 09/10 · 07h–10h</span>
      </div>
      <div className="proposal__actions">
        <Button size="s" icon={Check} onClick={onAccept}>
          Aceitar
        </Button>
        <Button size="s" variant="secondary">
          Contrapropor
        </Button>
      </div>
    </div>
  )
}

export default function Negociacoes() {
  const role = useRole()
  const navigate = useNavigate()
  const who = COUNTERPART[role]
  const [active, setActive] = useState(1)
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState(chatMessages)
  // o produtor vê a mesma conversa do outro lado
  const side = (s) => (role === 'produtor' ? (s === 'in' ? 'out' : 'in') : s)
  const confirm = () => navigate('/pedido-confirmado', { state: { role } })

  const send = (e) => {
    e.preventDefault()
    if (!draft.trim()) return
    // TODO(back-end): enviar mensagem via API / websocket
    const time = formatTime()
    setMessages((m) => [...m, { id: Date.now(), side: role === 'produtor' ? 'in' : 'out', text: draft, time }])
    setDraft('')
  }

  return (
    <div className="chat">
      <aside className="chat__list only-desktop">
        <Title className="h3">Negociações</Title>
        <SearchInput icon={Search} type="search" name="busca-conversa" placeholder="Buscar conversa…" aria-label="Buscar conversa" />
        <ul className="conv-list">
          {conversations.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                className={cx('conv', active === c.id && 'conv--active')}
                aria-current={active === c.id ? 'true' : undefined}
                onClick={() => setActive(c.id)}
              >
                <Avatar initials={c.initials} />
                <span className="conv__text">
                  <span className="row-between">
                    <span className="label-m">{c.name}</span>
                    <span className="body-s t-tertiary">{c.time}</span>
                  </span>
                  <span className="row-between">
                    <span className="body-s t-secondary conv__last">{c.last}</span>
                    {c.unread && <span className="conv__unread">{c.unread}</span>}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="chat__main">
        <header className="chat__head">
          <button type="button" className="icon-btn only-mobile" aria-label="Voltar" onClick={() => navigate(-1)}>
            <ChevronLeft size={22} aria-hidden />
          </button>
          <Avatar initials={who.initials} />
          <div className="list__text">
            <span className="chat__name">
              <Title mobile as="span" className="label-m">
                {who.name}
              </Title>
              <Badge tone="success" icon={ShieldCheck} className="only-desktop">
                Selo de qualidade
              </Badge>
              <ShieldCheck size={16} color="var(--icon-brand)" className="only-mobile" aria-hidden />
            </span>
            <span className="body-s t-tertiary chat__status">
              <i className="online-dot" />
              <span className="only-desktop">Online · costuma responder em 5 min</span>
              <span className="only-mobile">Online · {who.sub}</span>
            </span>
          </div>
          <Button variant="ghost" size="s" icon={User} className="only-desktop">
            Ver perfil
          </Button>
          <button type="button" className="icon-btn" aria-label="Mais opções">
            <Ellipsis size={20} aria-hidden />
          </button>
        </header>

        <div className="chat__context body-s">
          <Package size={16} aria-hidden />
          <span className="only-desktop">Negociando: Alface crespa orgânica · R$ 3,20/maço · 240 disponíveis</span>
          <span className="only-mobile">Alface crespa · R$ 3,20/maço · 240 disp.</span>
        </div>

        <div className="chat__messages" role="log" aria-live="polite" aria-label={`Conversa com ${who.name}`}>
          <span className="chat__day body-s">Hoje</span>
          {messages.map((m) =>
            m.side === 'proposal' ? (
              <div key={m.id} className="bubble-row">
                <Proposal onAccept={confirm} />
              </div>
            ) : (
              <ChatBubble
                key={m.id}
                side={side(m.side)}
                text={
                  m.mobileText ? (
                    <>
                      <span className="only-desktop">{m.text}</span>
                      <span className="only-mobile">{m.mobileText}</span>
                    </>
                  ) : (
                    m.text
                  )
                }
                time={m.time}
              />
            ),
          )}
        </div>

        <form className="chat__composer" onSubmit={send}>
          <button type="button" className="icon-btn" aria-label="Anexar">
            <Paperclip size={20} aria-hidden />
          </button>
          <SearchInput
            name="mensagem"
            placeholder="Escreva uma mensagem…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="chat__input"
            aria-label="Mensagem"
          />
          <Button type="submit" icon={Send} className="only-desktop">
            Enviar
          </Button>
          <button type="submit" className="chat__send only-mobile" aria-label="Enviar">
            <Send size={20} aria-hidden />
          </button>
        </form>
      </section>

      <aside className="chat__summary only-desktop">
        <h2 className="h3">Resumo do pedido</h2>
        <div className="summary__product">
          <ProduceThumb kind="alface" size={48} radius={8} />
          <div className="list__text">
            <span className="label-m">Alface crespa orgânica</span>
            <span className="body-s t-tertiary">Sítio Boa Vista · 12 km</span>
          </div>
        </div>
        <dl className="summary__rows">
          <div>
            <dt>Quantidade</dt>
            <dd>120 maços</dd>
          </div>
          <div>
            <dt>Preço unitário</dt>
            <dd>R$ 3,20</dd>
          </div>
          <div>
            <dt>Frete</dt>
            <dd>Incluso</dd>
          </div>
          <div>
            <dt>Entrega</dt>
            <dd>Qui, 09/10 · 07h–10h</dd>
          </div>
        </dl>
        <div className="summary__total">
          <span className="h4">Total</span>
          <span className="summary__total-value">R$ 384,00</span>
        </div>
        <div className="savings body-s">
          <TrendingUp size={16} aria-hidden />
          Você economiza ~R$ 96 vs. preço médio do atravessador.
        </div>
        <div className="summary__actions">
          <Button block icon={Check} onClick={confirm}>
            Fechar pedido
          </Button>
          <Button block variant="secondary" icon={Calendar}>
            Agendar entrega
          </Button>
          <p className="body-s t-tertiary" style={{ textAlign: 'center' }}>
            Pagamento combinado direto com o produtor.
          </p>
        </div>
      </aside>
    </div>
  )
}
