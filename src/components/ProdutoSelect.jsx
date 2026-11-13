import { Package, Plus, Tag } from 'lucide-react'
import { Field } from './ui'
import { api } from '../api/client'

export const NOVO = 'novo'
export const CATEGORIAS = ['Hortaliças', 'Legumes', 'Frutas', 'Grãos', 'Ovos e laticínios', 'Outros']

/* Select do catálogo de produtos + opção "Outro produto" para cadastrar um que ainda não existe.
   `novo` = { nome, categoria } (usado só quando value === NOVO). */
export default function ProdutoSelect({ produtos = [], value, onChange, novo, onNovoChange, errors = {}, label = 'Produto *', className }) {
  const grupos = CATEGORIAS.map((cat) => [cat, produtos.filter((p) => p.categoria === cat)]).filter(([, l]) => l.length)
  return (
    <>
      <Field label={label} icon={Package} error={errors.produtoId} className={className}>
        <select className="field__input" name="produtoId" value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={errors.produtoId ? true : undefined}>
          <option value="">Escolha…</option>
          {grupos.map(([cat, items]) => (
            <optgroup key={cat} label={cat}>
              {items.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </optgroup>
          ))}
          <option value={NOVO}>＋ Outro produto (não está na lista)</option>
        </select>
      </Field>
      {value === NOVO && (
        <div className="grid-2 novo-produto">
          <Field
            label="Nome do novo produto *"
            icon={Plus}
            name="novoNome"
            placeholder="Pimentão vermelho"
            value={novo.nome}
            onChange={(e) => onNovoChange({ ...novo, nome: e.target.value })}
            error={errors.novoNome}
            hint="Vai para o catálogo e outros produtores também poderão usar"
          />
          <Field label="Categoria *" icon={Tag}>
            <select className="field__input" value={novo.categoria} onChange={(e) => onNovoChange({ ...novo, categoria: e.target.value })}>
              {CATEGORIAS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
        </div>
      )}
    </>
  )
}

// Devolve o id do produto escolhido; se for "Outro produto", cadastra antes no catálogo
export async function garantirProduto(value, novo, unidade) {
  if (value !== NOVO) return Number(value)
  const p = await api('/produtos', { method: 'POST', body: { nome: novo.nome, categoria: novo.categoria, unidadePadrao: unidade } })
  return p.id
}
