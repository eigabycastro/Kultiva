import { badRequest } from './errors.js'

// Coordenadas de referência (centro da cidade) para o Sul de Minas, usadas se o geocodificador não responder
const CIDADES = {
  'pouso alegre/mg': [-22.2266, -45.9389],
  'santa rita do sapucai/mg': [-22.2522, -45.7036],
  'borda da mata/mg': [-22.2736, -46.1653],
  'cachoeira de minas/mg': [-22.3511, -45.7808],
  'congonhal/mg': [-22.1486, -46.0428],
  'estiva/mg': [-22.4578, -46.0181],
  'itajuba/mg': [-22.4256, -45.4528],
  'varginha/mg': [-21.5513, -45.4303],
  'pocos de caldas/mg': [-21.7878, -46.5614],
  'extrema/mg': [-22.8547, -46.3181],
  'cambui/mg': [-22.6117, -46.0572],
  'ouro fino/mg': [-22.2828, -46.3689],
  'lavras/mg': [-21.2453, -44.9997],
  'tres coracoes/mg': [-21.6956, -45.2553],
  'silvianopolis/mg': [-22.0272, -45.8353],
  'sao paulo/sp': [-23.5505, -46.6333],
  'belo horizonte/mg': [-19.9167, -43.9345],
}
const semAcento = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const cache = new Map()

async function geocodificar(cidade, uf, logradouro) {
  const chave = `${semAcento(cidade)}/${uf.toLowerCase()}`
  try {
    const q = new URLSearchParams({ format: 'json', limit: '1', country: 'Brazil', state: uf, city: cidade })
    if (logradouro) q.set('street', logradouro)
    const r = await fetch(`https://nominatim.openstreetmap.org/search?${q}`, {
      headers: { 'User-Agent': 'KultivaAPI/0.3 (projeto academico)' },
      signal: AbortSignal.timeout(4000),
    })
    const [hit] = r.ok ? await r.json() : []
    if (hit) return { latitude: Number(hit.lat), longitude: Number(hit.lon) }
  } catch {
    /* sem rede ou limite do serviço: cai na tabela local */
  }
  const ref = CIDADES[chave]
  return ref ? { latitude: ref[0], longitude: ref[1] } : { latitude: null, longitude: null }
}

// Consulta o ViaCEP (API externa) e devolve endereço + coordenadas aproximadas
export async function buscarCep(cepBruto) {
  const cep = String(cepBruto ?? '').replace(/\D/g, '')
  if (cep.length !== 8) throw badRequest('CEP inválido: informe 8 números, ex.: 37550-000.')
  if (cache.has(cep)) return cache.get(cep)

  let dados
  try {
    const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`, { signal: AbortSignal.timeout(5000) })
    dados = await r.json()
  } catch {
    throw badRequest('Não foi possível consultar o CEP agora. Tente de novo em instantes.')
  }
  if (!dados || dados.erro) throw badRequest('CEP não encontrado. Confira os números.')

  const coords = await geocodificar(dados.localidade, dados.uf, dados.logradouro)
  const resultado = {
    cep: `${cep.slice(0, 5)}-${cep.slice(5)}`,
    endereco: [dados.logradouro, dados.bairro].filter(Boolean).join(', '),
    cidade: dados.localidade,
    uf: dados.uf,
    ...coords,
  }
  cache.set(cep, resultado)
  return resultado
}
