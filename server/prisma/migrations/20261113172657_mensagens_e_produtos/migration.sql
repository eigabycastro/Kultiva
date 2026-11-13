-- AlterTable
ALTER TABLE "Produto" ADD COLUMN     "criadoPorId" INTEGER,
ALTER COLUMN "foto" SET DEFAULT 'outro';

-- CreateTable
CREATE TABLE "Mensagem" (
    "id" SERIAL NOT NULL,
    "remetenteId" INTEGER NOT NULL,
    "destinatarioId" INTEGER NOT NULL,
    "ofertaId" INTEGER,
    "texto" TEXT NOT NULL,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mensagem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Mensagem_remetenteId_destinatarioId_criadoEm_idx" ON "Mensagem"("remetenteId", "destinatarioId", "criadoEm");

-- CreateIndex
CREATE INDEX "Mensagem_destinatarioId_lida_idx" ON "Mensagem"("destinatarioId", "lida");

-- AddForeignKey
ALTER TABLE "Mensagem" ADD CONSTRAINT "Mensagem_remetenteId_fkey" FOREIGN KEY ("remetenteId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensagem" ADD CONSTRAINT "Mensagem_destinatarioId_fkey" FOREIGN KEY ("destinatarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensagem" ADD CONSTRAINT "Mensagem_ofertaId_fkey" FOREIGN KEY ("ofertaId") REFERENCES "Oferta"("id") ON DELETE SET NULL ON UPDATE CASCADE;
