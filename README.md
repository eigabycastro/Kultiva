# Kultiva — Front-end

Front-end em React + Vite do design **Kultiva — UI Design** (Figma). Só a camada visual: os dados vêm de `src/data/mock.js` e devem ser trocados pelas respostas da API.

## Rodar

```bash
npm install
npm run dev
```

## Telas e rotas

| Figma | Rota |
| --- | --- |
| 01 · Login / M01 | `/login` |
| 07 · Onboarding — Cadastro | `/cadastro` |
| 02 · Dashboard — Produtor / M02 | `/produtor` (também `/produtor/previsao`) |
| 08 · Cadastrar oferta | `/produtor/produtos` |
| 05 · Procura-se — Produtor / M05 | `/produtor/procura-se` |
| 09 · Calendário de safra | `/produtor/calendario` |
| 10 · Notificações | `/produtor/notificacoes` |
| 03 · Buscar produtos — Varejista / M03 | `/varejista/buscar` (também `/varejista` e `/varejista/favoritos`) |
| 11 · Detalhe do produto | `/varejista/produto/:id` |
| 12 · Publicar Procura-se | `/varejista/procura-se` |
| 13 · Histórico de pedidos | `/varejista/pedidos` e `/produtor/pedidos` |
| 04 · Negociação — Chat / M04 | `/varejista/negociacoes` e `/produtor/negociacoes` |
| 06 · Planos | `/produtor/planos` e `/varejista/planos` |
| M06 · Pedido confirmado | `/pedido-confirmado` |

No login, "Sou produtor" / "Sou varejista" decide para qual área o usuário vai. Abaixo de 768px o layout muda para o mobile (sem sidebar, com barra de navegação inferior), seguindo as telas do iPhone 17 Pro Max.

## Estrutura

- `src/index.css`: tokens do Design System (cores, raios, sombras, tipografia Plus Jakarta Sans)
- `src/components/ui.jsx`: Button, Badge, Chip, Field, Avatar, Card, Toggle, Checkbox, Tabs, Segmented
- `src/components/cards.jsx`: StatCard (KPI), ProductCard, DemandCard (Procura-se), ChatBubble
- `src/components/layout/AppLayout.jsx`: Sidebar, Topbar e Bottom navigation, por perfil
- `src/components/Logo.jsx`, `src/components/ProduceArt.jsx`: logo e ilustrações dos produtos em SVG
- `src/pages/`: uma pasta por perfil (`produtor/`, `varejista/`); as telas compartilhadas ficam na raiz

## Para o back-end

- Os pontos de integração estão marcados com `TODO(back-end)` (login, publicar oferta, publicar demanda, enviar mensagem).
- `src/data/mock.js` lista todos os campos que as telas usam.
