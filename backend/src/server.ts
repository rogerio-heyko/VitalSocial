import 'express-async-errors';
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { authRoutes } from './routes/auth.routes';
import { profileRoutes } from './routes/profile.routes';
import { activityRoutes } from './routes/activity.routes';
import { attendanceRoutes } from './routes/attendance.routes';
import { readingPlanRoutes } from './routes/readingPlan.routes';
import { adminRoutes } from './routes/admin.routes';
import { donationRoutes } from './routes/donation.routes';
import { errorMiddleware } from './middlewares/errorMiddleware';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);
    next();
});

app.use('/auth', authRoutes);
app.use('/perfil', profileRoutes);
app.use('/atividades', activityRoutes);
app.use('/presenca', attendanceRoutes);
app.use('/leitura', readingPlanRoutes);
app.use('/admin', adminRoutes);
app.use('/doacoes', donationRoutes);

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
