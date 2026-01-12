import { Router } from 'express';
import { AdminConfigController } from '../controllers/DonationController'; // Importing from same file for simplicity based on previous step
import { authMiddleware } from '../middlewares/authMiddleware';

const adminRoutes = Router();
const controller = new AdminConfigController();

// TODO: Adicionar middleware para verificar se é ADMIN
adminRoutes.get('/config', authMiddleware, controller.listConfigs);
adminRoutes.put('/config/:chave', authMiddleware, controller.updateConfig);

export { adminRoutes };
