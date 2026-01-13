import { Request, Response } from 'express';
import { prisma } from '../server';
import { AppError } from '../utils/AppError';

export class ClassReportController {
    async create(req: Request, res: Response) {
        const { atividadeId, dataAula, descricao, presencas } = req.body;
        const foto = req.file;

        if (!atividadeId || !dataAula || !descricao) {
            throw new AppError('Dados incompletos.', 400);
        }

        // Logic to save photo URL
        // If photo was uploaded via Multer, req.file.filename will be available
        let fotoUrl = null;
        if (foto) {
            // Assuming static serve from /uploads
            // We'll construct the full URL later or just store the filename
            fotoUrl = foto.filename;
        }

        // 1. Create RelatorioAula
        const relatorio = await prisma.relatorioAula.create({
            data: {
                atividadeId,
                dataAula: new Date(dataAula),
                descricao,
                fotoUrl
            }
        });

        // 2. Process Presencas
        // presencas is expected to be a JSON string or object { alunoId: boolean } if sent via multipart/form-data
        // parsing might be needed if sent as string
        let presencasObj = presencas;
        if (typeof presencas === 'string') {
            try {
                presencasObj = JSON.parse(presencas);
            } catch (e) {
                // Ignore or throw
            }
        }

        if (presencasObj && Array.isArray(presencasObj)) {
            // Array of objects { alunoId: string, presente: boolean, inscricaoId: string }
            for (const p of presencasObj) {
                if (p.inscricaoId) {
                    await prisma.presenca.create({
                        data: {
                            inscricaoId: p.inscricaoId,
                            dataAula: new Date(dataAula),
                            presente: p.presente,
                            relatorioAulaId: relatorio.id
                        }
                    });
                }
            }
        }

        // 3. Trigger Notifications (Async - Fire and Forget for now)
        this.notifyDonors(atividadeId, relatorio);

        return res.status(201).json(relatorio);
    }

    async listFeed(req: Request, res: Response) {
        // Simple feed: latest 20 reports, ordered by date desc
        const reports = await prisma.relatorioAula.findMany({
            take: 20,
            orderBy: { criadoEm: 'desc' },
            include: {
                atividade: {
                    select: {
                        titulo: true,
                        professor: {
                            select: {
                                nome: true,
                                cargo: true
                            }
                        },
                        // We might want to know the project name too
                        // But schema relation is: Atividade -> Professor. Not directly Project.
                        // Wait, Atividade doesn't strictly link to Project in current schema? 
                        // Let's check schema details.
                    }
                }
            }
        });

        // Map to friendlier format if needed
        const feed = reports.map(r => ({
            id: r.id,
            titulo: r.atividade.titulo,
            professor: r.atividade.professor.nome,
            data: r.dataAula,
            descricao: r.descricao,
            fotoUrl: r.fotoUrl ? `http://10.0.2.2:3000/uploads/${r.fotoUrl}` : null, // Assuming Android Emulator IP for MVP
            // In prod this should be env var BASE_URL
        }));

        return res.json(feed);
    }

    private async notifyDonors(atividadeId: string, relatorio: any) {
        // Logic to find project -> donors -> send push
        // Implementation TBD based on Project linkage.
        // Current Schema: Atividade doesn't have ProjectId directly? 
        // We might need to infer it or add it.
        // For MVP, skipping complex query.
        console.log(`[Notification] Would send push to donors about report ${relatorio.id}`);
    }
}
