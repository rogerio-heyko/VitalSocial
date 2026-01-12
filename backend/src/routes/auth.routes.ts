import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

const authRoutes = Router();
const authController = new AuthController();

authRoutes.post('/registrar', authController.registrar);
authRoutes.post('/login', authController.login);

export { authRoutes };
