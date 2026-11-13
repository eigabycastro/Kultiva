import { PrismaClient } from '@prisma/client'

// Uma única instância do Prisma para toda a API (queries parametrizadas = proteção contra SQL Injection)
export const prisma = globalThis.__kultivaPrisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalThis.__kultivaPrisma = prisma
