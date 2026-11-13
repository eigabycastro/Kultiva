/* Sobe um PostgreSQL local de verdade (binários via npm, sem instalar nada).
   Útil para desenvolver e para a demonstração. Em produção use o Neon (DATABASE_URL).
   Uso: npm run db:local   (deixe o terminal aberto; Ctrl+C para parar) */
import EmbeddedPostgres from 'embedded-postgres'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const dir = fileURLToPath(new URL('../.pgdata', import.meta.url))
const port = Number(process.env.PGPORT) || 5433

const pg = new EmbeddedPostgres({ databaseDir: dir, user: 'kultiva', password: 'kultiva', port, persistent: true })

const novo = !existsSync(dir)
if (novo) await pg.initialise()
await pg.start()
if (novo) await pg.createDatabase('kultiva')

console.log(`PostgreSQL rodando em postgresql://kultiva:kultiva@localhost:${port}/kultiva`)
if (novo) console.log('Banco novo criado. Agora rode: npm run db:deploy && npm run db:seed')

const parar = async () => {
  await pg.stop()
  process.exit(0)
}
process.on('SIGINT', parar)
process.on('SIGTERM', parar)
