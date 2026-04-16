import { Request, Response } from 'express';
import { prisma } from '../server';
import { AppError } from '../utils/AppError';
import jwt from 'jsonwebtoken';

export class ClassReportController {

    // 1. Start Class / Create Report
    async create(req: Request, res: Response) {
        // presencas (manual) is optional now, as we want QR code mostly
        const { atividadeId, turmaId, dataAula, descricao, presencas } = req.body;
        const foto = req.file;

        if (!atividadeId || !dataAula || !descricao) {
            throw new AppError('Dados incompletos: atividadeId, dataAula e descricao são obrigatórios.', 400);
        }

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

        // Create Report
        const relatorio = await prisma.relatorioAula.create({
            data: {
                atividadeId,
                turmaId: turmaId || null,
                dataAula: new Date(dataAula),
                descricao,
                fotoUrl,
                videoUrl
            }
        });


        // Manual Presences (Legacy/Backup)
        if (presencas) {
            let presencasObj = presencas;
            if (typeof presencas === 'string') {
                try {
                    presencasObj = JSON.parse(presencas);
                } catch (e) { console.error("Error parsing presencas", e); }
            }

            if (Array.isArray(presencasObj)) {
                for (const p of presencasObj) {
                    // Try to find enrollment if only alunoId is provided, or use inscricaoId if available
                    if (p.inscricaoId) {
                        await prisma.presenca.create({
                            data: {
                                inscricaoId: p.inscricaoId,
                                dataAula: new Date(dataAula),
                                presente: !!p.presente,
                                relatorioAulaId: relatorio.id
                            }
                        });
                    }
                }
            }
        }

        // Generate JWT Token for QR Code
        // Valid for 4 hours to cover the class duration
        const token = jwt.sign(
            {
                aulaId: relatorio.id,
                type: 'attendance',
                atividadeId: relatorio.atividadeId,
                turmaId: relatorio.turmaId
            },
            process.env.JWT_SECRET || 'default_secret',
            { expiresIn: '4h' }
        );

        return res.status(201).json({
            relatorio,
            token, // Frontend will use this to generate QR Code
            message: "Aula iniciada com sucesso. Use o token para gerar o QR Code."
        });
    }

    // 2. Register Attendance via QR Code
    async registerAttendance(req: Request, res: Response) {
        const { token } = req.body;
        const studentId = (req as any).user_id; // Added by Auth Middleware

        if (!token) throw new AppError('Token de presença obrigatório.');

        let decoded: any;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
        } catch (e) {
            throw new AppError('Token inválido ou expirado.', 401);
        }

        if (decoded.type !== 'attendance' || !decoded.aulaId) {
            throw new AppError('Token inválido para presença.', 400);
        }

        const { aulaId, atividadeId } = decoded;

        // Find Student's Enrollment (Inscricao)
        // We look for an active enrollment in the Activity
        const inscricao = await prisma.inscricao.findFirst({
            where: {
                alunoId: studentId,
                atividadeId: atividadeId
            }
        });

        if (!inscricao) {
            throw new AppError('Aluno não está inscrito nesta atividade.', 403);
        }

        // Check if already registered
        const existingPresenca = await prisma.presenca.findFirst({
            where: {
                inscricaoId: inscricao.id,
                relatorioAulaId: aulaId
            }
        });

        if (existingPresenca) {
            return res.json({ message: 'Presença já registrada anteriormente.', presenca: existingPresenca });
        }

        // Register Presence
        const presenca = await prisma.presenca.create({
            data: {
                inscricaoId: inscricao.id,
                relatorioAulaId: aulaId,
                dataAula: new Date(), // Time of scan
                presente: true
            }
        });

        return res.status(201).json({ message: 'Presença registrada com sucesso!', presenca });
    }

    // 3. Social Feed
    async listFeed(req: Request, res: Response) {
        // Base URL helper
        const baseUrl = process.env.API_URL || 'http://localhost:3000';

        const reports = await prisma.relatorioAula.findMany({
            where: {
                fotoUrl: { not: null } // Only show reports with photos
            },
            take: 20,
            orderBy: { criadoEm: 'desc' },
            include: {
                atividade: {
                    select: {
                        titulo: true,
                        projeto: { select: { nome: true } },
                        coordenador: { // Updated from 'professor' to 'coordenador'
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

        const feed = reports.map((r: any) => ({
            id: r.id,
            titulo: r.turma ? `${r.atividade.titulo} - ${r.turma ? r.turma.nome : ''}` : r.atividade.titulo,
            projeto: r.atividade.projeto?.nome || "Comunidade",
            professor: r.atividade.coordenador?.nome || "Coordenador",
            professorCargo: r.atividade.coordenador?.cargo || "Staff",
            data: r.dataAula,
            descricao: r.descricao,
            fotoUrl: r.fotoUrl ? `${baseUrl}/uploads/${r.fotoUrl}` : null,
            videoUrl: r.videoUrl ? `${baseUrl}/uploads/${r.videoUrl}` : null,

        }));

        return res.json(feed);
    }
}
