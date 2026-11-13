// Documentação OpenAPI 3 servida em /docs (Swagger UI) e /docs.json
const ref = (nome) => ({ $ref: `#/components/schemas/${nome}` })
const json = (schema, description = 'OK') => ({ description, content: { 'application/json': { schema } } })
const corpo = (schema) => ({ required: true, content: { 'application/json': { schema } } })
const erro = (description) => json(ref('Erro'), description)
const id = { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
const q = (name, schema = { type: 'string' }, description) => ({ name, in: 'query', schema, description })
const paginas = [q('page', { type: 'integer', default: 1 }), q('pageSize', { type: 'integer', default: 12, maximum: 50 })]
const lista = (item) => ({
  type: 'object',
  properties: {
    data: { type: 'array', items: item },
    page: { type: 'integer' },
    pageSize: { type: 'integer' },
    total: { type: 'integer' },
    totalPages: { type: 'integer' },
  },
})
const comuns = { 400: erro('Dados inválidos'), 401: erro('Sem login ou token inválido'), 403: erro('Perfil sem permissão') }

function op(tag, summary, { perfis, params, body, ok = json({ type: 'object' }), status = 200, extra = {}, publica } = {}) {
  return {
    tags: [tag],
    summary,
    description: perfis ? `Perfis: **${perfis}**` : undefined,
    ...(publica && { security: [] }),
    parameters: params,
    requestBody: body && corpo(body),
    responses: { [status]: ok, ...comuns, ...extra },
  }
}

export const openapi = {
  openapi: '3.0.3',
  info: {
    title: 'Kultiva API',
    version: '0.3.0',
    description:
      'API da Kultiva: produtores rurais vendendo direto para o varejo.\n\n' +
      '1. Faça login em **POST /api/auth/login** (usuários de teste no README).\n' +
      '2. Clique em **Authorize** e cole o `token`.\n\n' +
      'Erros sempre voltam como `{ "error": "mensagem", "details": [{ "campo", "mensagem" }] }`.',
  },
  servers: [{ url: '/' }],
  security: [{ bearer: [] }],
  tags: [
    { name: 'Autenticação' },
    { name: 'Propriedades', description: 'CRUD do produtor' },
    { name: 'Ofertas', description: 'CRUD do produtor e busca do varejista' },
    { name: 'Pedidos', description: 'Regra de negócio: status + baixa de estoque' },
    { name: 'Procura-se', description: 'CRUD de demandas do varejista + match' },
    { name: 'Notificações' },
    { name: 'Favoritos' },
    { name: 'Dashboard' },
    { name: 'Administração' },
    { name: 'Apoio' },
  ],
  paths: {
    '/api/auth/cadastro': {
      post: op('Autenticação', 'Criar conta (produtor já ganha a 1ª propriedade)', {
        publica: true,
        body: ref('Cadastro'),
        status: 201,
        ok: json(ref('Sessao'), 'Conta criada'),
        extra: { 409: erro('E-mail já cadastrado') },
      }),
    },
    '/api/auth/login': {
      post: op('Autenticação', 'Entrar e receber o JWT', {
        publica: true,
        body: { type: 'object', required: ['email', 'senha'], properties: { email: { type: 'string', example: 'joao@sitioboavista.com.br' }, senha: { type: 'string', example: 'kultiva123' } } },
        ok: json(ref('Sessao')),
      }),
    },
    '/api/auth/logout': { post: op('Autenticação', 'Sair (o cliente descarta o token)', { ok: { description: 'Sem conteúdo' }, status: 204 }) },
    '/api/auth/me': {
      get: op('Autenticação', 'Dados do usuário logado', { ok: json(ref('Usuario')) }),
      put: op('Autenticação', 'Atualizar perfil (e senha, com senhaAtual)', { body: { type: 'object' }, ok: json(ref('Usuario')) }),
      delete: op('Autenticação', 'Excluir a própria conta (sem pedidos no histórico)', { status: 204, ok: { description: 'Excluída' }, extra: { 409: erro('Há pedidos') } }),
    },
    '/api/cep/{cep}': {
      get: op('Apoio', 'Endereço e coordenadas a partir do CEP (ViaCEP)', {
        publica: true,
        params: [{ name: 'cep', in: 'path', required: true, schema: { type: 'string', example: '37550-000' } }],
        ok: json({ type: 'object', properties: { cep: { type: 'string' }, endereco: { type: 'string' }, cidade: { type: 'string' }, uf: { type: 'string' }, latitude: { type: 'number' }, longitude: { type: 'number' } } }),
      }),
    },
    '/api/produtos': { get: op('Apoio', 'Catálogo de produtos', { ok: json({ type: 'array', items: ref('Produto') }) }) },

    '/api/propriedades': {
      get: op('Propriedades', 'Listar minhas propriedades', { perfis: 'PRODUTOR', ok: json({ type: 'array', items: ref('Propriedade') }) }),
      post: op('Propriedades', 'Cadastrar propriedade', { perfis: 'PRODUTOR', body: ref('PropriedadeEntrada'), status: 201, ok: json(ref('Propriedade')) }),
    },
    '/api/propriedades/{id}': {
      get: op('Propriedades', 'Detalhe', { perfis: 'PRODUTOR', params: [id], ok: json(ref('Propriedade')) }),
      put: op('Propriedades', 'Editar', { perfis: 'PRODUTOR', params: [id], body: ref('PropriedadeEntrada'), ok: json(ref('Propriedade')) }),
      delete: op('Propriedades', 'Excluir (bloqueado se houver pedidos)', { perfis: 'PRODUTOR', params: [id], status: 204, ok: { description: 'Excluída' }, extra: { 409: erro('Em uso') } }),
    },

    '/api/ofertas': {
      get: op('Ofertas', 'Buscar ofertas por produto, preço e distância (paginado)', {
        params: [
          q('q', undefined, 'Texto: produto, variedade ou propriedade'),
          q('categoria', { type: 'string', enum: ['Hortaliças', 'Frutas', 'Legumes', 'Grãos'] }),
          q('produtoId', { type: 'integer' }),
          q('produtorId', { type: 'integer' }),
          q('precoMin', { type: 'number' }),
          q('precoMax', { type: 'number' }),
          q('raioKm', { type: 'integer' }, 'Distância máxima a partir do endereço do usuário'),
          q('colheita', { type: 'string', enum: ['hoje', 'semana'] }),
          q('organico', { type: 'boolean' }),
          q('ordenar', { type: 'string', enum: ['distancia', 'menor_preco', 'maior_preco', 'recentes'] }),
          ...paginas,
        ],
        ok: json(lista(ref('Oferta'))),
      }),
      post: op('Ofertas', 'Cadastrar oferta (avisa demandas compatíveis)', { perfis: 'PRODUTOR', body: ref('OfertaEntrada'), status: 201, ok: json(ref('Oferta')) }),
    },
    '/api/ofertas/minhas': { get: op('Ofertas', 'Minhas ofertas', { perfis: 'PRODUTOR', ok: json({ type: 'array', items: ref('Oferta') }) }) },
    '/api/ofertas/{id}': {
      get: op('Ofertas', 'Detalhe com outras ofertas do produtor e histórico de preço', { params: [id], ok: json(ref('Oferta')) }),
      put: op('Ofertas', 'Editar oferta', { perfis: 'PRODUTOR (dono)', params: [id], body: ref('OfertaEntrada'), ok: json(ref('Oferta')) }),
      delete: op('Ofertas', 'Excluir oferta (bloqueado se houver pedidos)', { perfis: 'PRODUTOR (dono)', params: [id], status: 204, ok: { description: 'Excluída' }, extra: { 409: erro('Tem pedidos') } }),
    },
    '/api/ofertas/{id}/status': {
      patch: op('Ofertas', 'Pausar ou reativar', {
        perfis: 'PRODUTOR (dono)',
        params: [id],
        body: { type: 'object', properties: { status: { type: 'string', enum: ['ATIVA', 'PAUSADA'] } } },
        ok: json(ref('Oferta')),
      }),
    },

    '/api/pedidos': {
      get: op('Pedidos', 'Histórico com filtro e paginação', {
        params: [
          q('grupo', { type: 'string', enum: ['andamento', 'concluidos', 'cancelados'] }),
          q('status', { type: 'string', enum: ['PENDENTE', 'ACEITO', 'RECUSADO', 'CANCELADO', 'ENTREGUE'] }),
          q('q', undefined, 'Código (#KT-1042), produto ou parceiro'),
          q('de', { type: 'string', format: 'date' }),
          q('ate', { type: 'string', format: 'date' }),
          ...paginas,
        ],
        ok: json(lista(ref('Pedido'))),
      }),
      post: op('Pedidos', 'Fazer pedido (bloqueia quantidade acima do estoque)', {
        perfis: 'VAREJISTA',
        body: ref('PedidoEntrada'),
        status: 201,
        ok: json(ref('Pedido')),
        extra: { 409: erro('Estoque insuficiente ou oferta indisponível') },
      }),
    },
    '/api/pedidos/{id}': { get: op('Pedidos', 'Detalhe do pedido', { params: [id], ok: json(ref('Pedido')) }) },
    '/api/pedidos/{id}/status': {
      patch: op('Pedidos', 'Aceitar (baixa o estoque), recusar, entregar ou cancelar', {
        perfis: 'PRODUTOR: aceitar/recusar/entregar/cancelar · VAREJISTA: cancelar',
        params: [id],
        body: { type: 'object', required: ['acao'], properties: { acao: { type: 'string', enum: ['aceitar', 'recusar', 'entregar', 'cancelar'] }, motivo: { type: 'string' } } },
        ok: json(ref('Pedido')),
        extra: { 409: erro('Transição inválida ou estoque insuficiente') },
      }),
    },

    '/api/demandas': {
      get: op('Procura-se', 'Varejista: minhas demandas · Produtor: demandas abertas no raio', {
        params: [q('status', { type: 'string', enum: ['ABERTA', 'ENCERRADA'] }), q('q'), q('compativeis', { type: 'boolean' }), q('urgentes', { type: 'boolean' }), ...paginas],
        ok: json(lista(ref('Demanda'))),
      }),
      post: op('Procura-se', 'Publicar demanda (notifica produtores compatíveis)', { perfis: 'VAREJISTA', body: ref('DemandaEntrada'), status: 201, ok: json(ref('Demanda')) }),
    },
    '/api/demandas/previa': {
      get: op('Procura-se', 'Quantos produtores atendem antes de publicar', {
        perfis: 'VAREJISTA',
        params: [q('produtoId', { type: 'integer' }), q('raioKm', { type: 'integer' }), q('precoMaximo', { type: 'number' })],
      }),
    },
    '/api/demandas/{id}': {
      get: op('Procura-se', 'Detalhe', { params: [id], ok: json(ref('Demanda')) }),
      put: op('Procura-se', 'Editar', { perfis: 'VAREJISTA (dono)', params: [id], body: ref('DemandaEntrada'), ok: json(ref('Demanda')) }),
      delete: op('Procura-se', 'Excluir', { perfis: 'VAREJISTA (dono)', params: [id], status: 204, ok: { description: 'Excluída' } }),
    },
    '/api/demandas/{id}/status': {
      patch: op('Procura-se', 'Encerrar ou reabrir', {
        perfis: 'VAREJISTA (dono)',
        params: [id],
        body: { type: 'object', properties: { status: { type: 'string', enum: ['ABERTA', 'ENCERRADA'] } } },
        ok: json(ref('Demanda')),
      }),
    },

    '/api/notificacoes': {
      get: op('Notificações', 'Listar (com contagem por tipo)', {
        params: [q('tipo', { type: 'string', enum: ['DEMANDA', 'PEDIDO', 'MENSAGEM', 'PRECO', 'SISTEMA'] }), q('naoLidas', { type: 'boolean' }), ...paginas],
      }),
    },
    '/api/notificacoes/nao-lidas': { get: op('Notificações', 'Total de não lidas') },
    '/api/notificacoes/lidas': { patch: op('Notificações', 'Marcar todas como lidas') },
    '/api/notificacoes/{id}/lida': { patch: op('Notificações', 'Marcar uma como lida', { params: [id], status: 204, ok: { description: 'OK' } }) },
    '/api/notificacoes/{id}': { delete: op('Notificações', 'Apagar', { params: [id], status: 204, ok: { description: 'OK' } }) },

    '/api/favoritos': { get: op('Favoritos', 'Ofertas e produtores salvos', { perfis: 'VAREJISTA' }) },
    '/api/favoritos/{ofertaId}': {
      post: op('Favoritos', 'Favoritar oferta', { perfis: 'VAREJISTA', params: [{ ...id, name: 'ofertaId' }], status: 201 }),
      delete: op('Favoritos', 'Remover dos favoritos', { perfis: 'VAREJISTA', params: [{ ...id, name: 'ofertaId' }], status: 204, ok: { description: 'OK' } }),
    },

    '/api/dashboard': { get: op('Dashboard', 'KPIs, vendas por semana e por produto, pedidos recentes', { perfis: 'PRODUTOR, VAREJISTA' }) },

    '/api/admin/resumo': { get: op('Administração', 'Totais da plataforma', { perfis: 'ADMIN' }) },
    '/api/admin/usuarios': {
      get: op('Administração', 'Listar usuários com busca e paginação', {
        perfis: 'ADMIN',
        params: [q('q'), q('perfil', { type: 'string', enum: ['PRODUTOR', 'VAREJISTA', 'ADMIN'] }), q('bloqueado', { type: 'boolean' }), ...paginas],
        ok: json(lista(ref('Usuario'))),
      }),
    },
    '/api/admin/usuarios/{id}/bloqueio': {
      patch: op('Administração', 'Bloquear ou desbloquear usuário', {
        perfis: 'ADMIN',
        params: [id],
        body: { type: 'object', properties: { bloqueado: { type: 'boolean' } } },
        ok: json(ref('Usuario')),
      }),
    },
  },
  components: {
    securitySchemes: { bearer: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    schemas: {
      Erro: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Estoque insuficiente de Tomate italiano: há 80 kg disponíveis.' },
          details: { type: 'array', items: { type: 'object', properties: { campo: { type: 'string' }, mensagem: { type: 'string' } } } },
        },
      },
      Sessao: { type: 'object', properties: { token: { type: 'string' }, usuario: ref('Usuario') } },
      Usuario: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          nome: { type: 'string' },
          email: { type: 'string' },
          perfil: { type: 'string', enum: ['PRODUTOR', 'VAREJISTA', 'ADMIN'] },
          organizacao: { type: 'string' },
          cidade: { type: 'string' },
          uf: { type: 'string' },
          raioKm: { type: 'integer' },
          bloqueado: { type: 'boolean' },
        },
      },
      Cadastro: {
        type: 'object',
        required: ['perfil', 'nome', 'email', 'senha', 'organizacao', 'cep'],
        properties: {
          perfil: { type: 'string', enum: ['PRODUTOR', 'VAREJISTA'] },
          nome: { type: 'string', example: 'Ana Souza' },
          email: { type: 'string', example: 'ana@sitio.com.br' },
          senha: { type: 'string', minLength: 8, example: 'senhaSegura1' },
          organizacao: { type: 'string', example: 'Sítio Esperança' },
          tipoEstabelecimento: { type: 'string', example: 'Supermercado' },
          cep: { type: 'string', example: '37550-000' },
          numero: { type: 'string' },
          telefone: { type: 'string' },
          documento: { type: 'string' },
          raioKm: { type: 'integer', example: 30 },
        },
      },
      Produto: { type: 'object', properties: { id: { type: 'integer' }, nome: { type: 'string' }, categoria: { type: 'string' }, foto: { type: 'string' }, unidadePadrao: { type: 'string' } } },
      PropriedadeEntrada: {
        type: 'object',
        required: ['nome', 'cep'],
        properties: { nome: { type: 'string' }, cep: { type: 'string' }, endereco: { type: 'string' }, areaHa: { type: 'number' }, raioEntregaKm: { type: 'integer' } },
      },
      Propriedade: {
        allOf: [ref('PropriedadeEntrada'), { type: 'object', properties: { id: { type: 'integer' }, cidade: { type: 'string' }, uf: { type: 'string' }, latitude: { type: 'number' }, longitude: { type: 'number' } } }],
      },
      OfertaEntrada: {
        type: 'object',
        required: ['propriedadeId', 'produtoId', 'preco', 'unidade', 'quantidade', 'dataColheita'],
        properties: {
          propriedadeId: { type: 'integer' },
          produtoId: { type: 'integer' },
          variedade: { type: 'string' },
          preco: { type: 'number', example: 3.2 },
          unidade: { type: 'string', enum: ['kg', 'maço', 'caixa', 'unidade', 'dúzia'] },
          quantidade: { type: 'integer', example: 300 },
          pedidoMinimo: { type: 'integer', example: 20 },
          dataColheita: { type: 'string', example: '2026-11-14' },
          disponivelAte: { type: 'string', example: '2026-11-20' },
          organico: { type: 'boolean' },
          entregaInclusa: { type: 'boolean' },
          rascunho: { type: 'boolean' },
        },
      },
      Oferta: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          produto: { type: 'string' },
          preco: { type: 'number' },
          unidade: { type: 'string' },
          quantidadeTotal: { type: 'integer' },
          quantidadeDisponivel: { type: 'integer' },
          status: { type: 'string', enum: ['ATIVA', 'PAUSADA', 'RASCUNHO', 'ESGOTADA'] },
          distanciaKm: { type: 'number' },
          propriedade: { type: 'object' },
          produtor: { type: 'object' },
        },
      },
      PedidoEntrada: {
        type: 'object',
        required: ['itens'],
        properties: {
          itens: { type: 'array', items: { type: 'object', properties: { ofertaId: { type: 'integer' }, quantidade: { type: 'integer' } } } },
          dataEntrega: { type: 'string', example: '2026-11-20' },
          observacao: { type: 'string' },
        },
      },
      Pedido: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          codigo: { type: 'string', example: '#KT-1042' },
          status: { type: 'string', enum: ['PENDENTE', 'ACEITO', 'RECUSADO', 'CANCELADO', 'ENTREGUE'] },
          total: { type: 'number' },
          itens: { type: 'array', items: { type: 'object' } },
          acoes: { type: 'array', items: { type: 'string' }, description: 'Ações que o usuário logado pode executar agora' },
        },
      },
      DemandaEntrada: {
        type: 'object',
        required: ['produtoId', 'quantidade', 'unidade', 'prazo'],
        properties: {
          produtoId: { type: 'integer' },
          quantidade: { type: 'integer', example: 300 },
          unidade: { type: 'string', example: 'kg' },
          precoMaximo: { type: 'number', example: 5.8 },
          prazo: { type: 'string', example: '2026-11-25' },
          frequencia: { type: 'string', enum: ['Compra única', 'Semanal', 'Quinzenal', 'Mensal'] },
          raioKm: { type: 'integer', example: 30 },
          observacoes: { type: 'string' },
        },
      },
      Demanda: { allOf: [ref('DemandaEntrada'), { type: 'object', properties: { id: { type: 'integer' }, status: { type: 'string' }, produto: { type: 'string' } } }] },
    },
  },
}
