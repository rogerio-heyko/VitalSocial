import 'express-async-errors';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppError } from './utils/AppError';
import { PrismaClient } from '@prisma/client';

// Load env vars
dotenv.config();

export const prisma = new PrismaClient();

import { authRoutes } from './routes/auth.routes';
import { profileRoutes } from './routes/profile.routes';
import { activityRoutes } from './routes/activity.routes';
import { attendanceRoutes } from './routes/attendance.routes';
import { readingPlanRoutes } from './routes/readingPlan.routes';
import { adminRoutes } from './routes/admin.routes';
import { projectRoutes } from './routes/project.routes';
import { donationRoutes } from './routes/donation.routes';

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for all origins
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/perfil', profileRoutes);
app.use('/atividades', activityRoutes);
app.use('/presenca', attendanceRoutes);
app.use('/leitura', readingPlanRoutes);
app.use('/admin', adminRoutes);
app.use('/doacoes', donationRoutes);
app.use('/projetos', projectRoutes);

import { classReportRoutes } from './routes/classReport.routes';
app.use('/relatorios', classReportRoutes);

// Statics
import path from 'path';
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));


app.get('/', (req: Request, res: Response) => {
    res.send('API do VitalSocial está rodando!');
});

app.get('/health', async (req: Request, res: Response) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ status: 'ok', banco_de_dados: 'conectado' });
    } catch (error) {
        res.status(500).json({ status: 'erro', banco_de_dados: 'desconectado', erro: String(error) });
    }
});

// Error handling middleware
// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message
        });
    }

    console.error(err);
    res.status(500).json({
        status: 'error',
        message: 'Internal Server Error',
    });
});

app.listen(port as number, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${port}`);
});
