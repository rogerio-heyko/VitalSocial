import { Request, Response } from 'express';
import { prisma } from '../server';
import { AppError } from '../utils/AppError';

export class ClassReportController {
    async create(req: Request, res: Response) {
        const { atividadeId, turmaId, dataAula, descricao, presencas } = req.body;
        const foto = req.file;

        if (!atividadeId || !dataAula || !descricao) {
            throw new AppError('Dados incompletos.', 400);
        }

        // Logic to save photo URL
        // If photo was uploaded via Multer, req.file.filename will be available
        let fotoUrl = null;
        let videoUrl = null;
        if (foto) {
            // Check if it's image or video
            if (foto.mimetype.startsWith('video/')) {
                videoUrl = foto.filename;
            } else {
                fotoUrl = foto.filename;
            }
        }

        const data: any = {
            atividadeId,
            dataAula: new Date(dataAula),
            descricao,
            fotoUrl,
            videoUrl
        };
        if (turmaId) data.turmaId = turmaId;

        // 1. Create RelatorioAula
        const relatorio = await prisma.relatorioAula.create({
            data
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
                        projeto: { select: { nome: true } }, // Include Project Name if possible
                        professor: {
                            select: {
                                nome: true,
                                cargo: true
                            }
                        }
                    }
                },
                turma: {
                    select: { nome: true }
                }
            }
        });

        // Map to friendlier format
        const feed = reports.map((r: any) => ({
            id: r.id,
            // Title logic: "Project Name - Activity Name" or just "Activity Name"
            // With Turma: "Activity Name - Turma Name"
            titulo: r.turma ? `${r.atividade.titulo} - ${r.turma.nome}` : r.atividade.titulo,
            projeto: r.atividade.projeto?.nome || "Comunidade",
            professor: r.atividade.professor.nome,
            professorCargo: r.atividade.professor.cargo,
            data: r.dataAula,
            descricao: r.descricao,
            fotoUrl: r.fotoUrl ? `http://10.0.2.2:3000/uploads/${r.fotoUrl}` : null,
            videoUrl: r.videoUrl ? `http://10.0.2.2:3000/uploads/${r.videoUrl}` : null,
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
