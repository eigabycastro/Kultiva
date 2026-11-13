import { describe, expect, it } from 'vitest'
import { distanciaKm } from '../src/lib/geo.js'
import { paginacao, paginado } from '../src/lib/pagination.js'
import { acoesPermitidas } from '../src/services/pedidos.js'

describe('fluxo de status do pedido', () => {
  it('produtor aceita ou recusa um pedido pendente', () => {
    expect(acoesPermitidas('PENDENTE', 'PRODUTOR')).toEqual(['aceitar', 'recusar'])
  })
  it('varejista só pode cancelar um pedido pendente', () => {
    expect(acoesPermitidas('PENDENTE', 'VAREJISTA')).toEqual(['cancelar'])
  })
  it('pedido aceito pode ser entregue (produtor) ou cancelado (ambos)', () => {
    expect(acoesPermitidas('ACEITO', 'PRODUTOR')).toEqual(['entregar', 'cancelar'])
    expect(acoesPermitidas('ACEITO', 'VAREJISTA')).toEqual(['cancelar'])
  })
  it('status finais não têm mais ações', () => {
    for (const s of ['ENTREGUE', 'RECUSADO', 'CANCELADO']) {
      expect(acoesPermitidas(s, 'PRODUTOR')).toEqual([])
      expect(acoesPermitidas(s, 'VAREJISTA')).toEqual([])
    }
  })
})

describe('distância (Haversine)', () => {
  it('Pouso Alegre → Santa Rita do Sapucaí fica entre 20 e 30 km', () => {
    const km = distanciaKm({ latitude: -22.2266, longitude: -45.9389 }, { latitude: -22.2522, longitude: -45.7036 })
    expect(km).toBeGreaterThan(20)
    expect(km).toBeLessThan(30)
  })
  it('sem coordenadas devolve null', () => {
    expect(distanciaKm({ latitude: null }, { latitude: 1, longitude: 1 })).toBeNull()
  })
})

describe('paginação', () => {
  it('limita o tamanho da página e calcula o deslocamento', () => {
    expect(paginacao({ page: '3', pageSize: '500' })).toEqual({ page: 3, pageSize: 50, skip: 100, take: 50 })
    expect(paginacao({ page: '-1' })).toMatchObject({ page: 1, skip: 0 })
  })
  it('calcula o total de páginas', () => {
    expect(paginado([], 25, { page: 1, pageSize: 10 }).totalPages).toBe(3)
  })
})
