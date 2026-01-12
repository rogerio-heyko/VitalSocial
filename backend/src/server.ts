import 'express-async-errors';
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();
import { authRoutes } from './routes/auth.routes';
import { profileRoutes } from './routes/profile.routes';
import { activityRoutes } from './routes/activity.routes';
import { attendanceRoutes } from './routes/attendance.routes';
import { readingPlanRoutes } from './routes/readingPlan.routes';
import { adminRoutes } from './routes/admin.routes';
import { projectRoutes } from './routes/project.routes';

// ... (other imports)

app.use('/auth', authRoutes);
app.use('/perfil', profileRoutes);
app.use('/atividades', activityRoutes);
app.use('/presenca', attendanceRoutes);
app.use('/leitura', readingPlanRoutes);
app.use('/admin', adminRoutes);
app.use('/doacoes', donationRoutes);
app.use('/projetos', projectRoutes); // Rota Pública (com auth apenas, sem admin)

app.get('/', (req: Request, res: Response) => {
    res.send('API do Teleios está rodando!');
});

app.get('/health', async (req: Request, res: Response) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ status: 'ok', banco_de_dados: 'conectado' });
    } catch (error) {
        res.status(500).json({ status: 'erro', banco_de_dados: 'desconectado', erro: String(error) });
    }
});

app.use(errorMiddleware);

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
