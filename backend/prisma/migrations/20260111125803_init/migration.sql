-- CreateEnum
CREATE TYPE "TipoUsuario" AS ENUM ('DOADOR', 'BENEFICIARIO', 'STAFF', 'ADMIN');

-- CreateEnum
CREATE TYPE "TipoAtividade" AS ENUM ('AULA', 'CURSO', 'EVENTO');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "tipo" "TipoUsuario" NOT NULL,
    "menorIdade" BOOLEAN NOT NULL DEFAULT false,
    "dataCadastro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Responsavel" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "responsavelId" TEXT NOT NULL,

    CONSTRAINT "Responsavel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerfilDoador" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "valorMensal" DECIMAL(65,30) NOT NULL,
    "diaVencimento" INTEGER NOT NULL,

    CONSTRAINT "PerfilDoador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerfilBeneficiario" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "dadosQuestionarioSocial" JSONB NOT NULL,

    CONSTRAINT "PerfilBeneficiario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Atividade" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "tipo" "TipoAtividade" NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL,
    "professorResponsavelId" TEXT NOT NULL,

    CONSTRAINT "Atividade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inscricao" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "atividadeId" TEXT NOT NULL,
    "dataInscricao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inscricao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Presenca" (
    "id" TEXT NOT NULL,
    "inscricaoId" TEXT NOT NULL,
    "dataAula" TIMESTAMP(3) NOT NULL,
    "presente" BOOLEAN NOT NULL,

    CONSTRAINT "Presenca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanoLeitura" (
    "id" SERIAL NOT NULL,
    "trechosBiblicos" TEXT NOT NULL,
    "reflexao" TEXT NOT NULL,

    CONSTRAINT "PlanoLeitura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeituraUsuario" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "planoLeituraId" INTEGER NOT NULL,
    "concluido" BOOLEAN NOT NULL DEFAULT false,
    "dataConclusao" TIMESTAMP(3),

    CONSTRAINT "LeituraUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForumPost" (
    "id" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "dataPostagem" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" TEXT NOT NULL,
    "atividadeId" TEXT NOT NULL,

    CONSTRAINT "ForumPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Responsavel_usuarioId_responsavelId_key" ON "Responsavel"("usuarioId", "responsavelId");

-- CreateIndex
CREATE UNIQUE INDEX "PerfilDoador_usuarioId_key" ON "PerfilDoador"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "PerfilBeneficiario_usuarioId_key" ON "PerfilBeneficiario"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "LeituraUsuario_usuarioId_planoLeituraId_key" ON "LeituraUsuario"("usuarioId", "planoLeituraId");

-- AddForeignKey
ALTER TABLE "Responsavel" ADD CONSTRAINT "Responsavel_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Responsavel" ADD CONSTRAINT "Responsavel_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerfilDoador" ADD CONSTRAINT "PerfilDoador_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerfilBeneficiario" ADD CONSTRAINT "PerfilBeneficiario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Atividade" ADD CONSTRAINT "Atividade_professorResponsavelId_fkey" FOREIGN KEY ("professorResponsavelId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inscricao" ADD CONSTRAINT "Inscricao_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inscricao" ADD CONSTRAINT "Inscricao_atividadeId_fkey" FOREIGN KEY ("atividadeId") REFERENCES "Atividade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presenca" ADD CONSTRAINT "Presenca_inscricaoId_fkey" FOREIGN KEY ("inscricaoId") REFERENCES "Inscricao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeituraUsuario" ADD CONSTRAINT "LeituraUsuario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeituraUsuario" ADD CONSTRAINT "LeituraUsuario_planoLeituraId_fkey" FOREIGN KEY ("planoLeituraId") REFERENCES "PlanoLeitura"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumPost" ADD CONSTRAINT "ForumPost_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumPost" ADD CONSTRAINT "ForumPost_atividadeId_fkey" FOREIGN KEY ("atividadeId") REFERENCES "Atividade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
