import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

const authRoutes = Router();
const authController = new AuthController();

authRoutes.post('/registrar', authController.registrar);
authRoutes.post('/login', authController.login);
authRoutes.post('/verify', authController.verifyEmail);
authRoutes.post('/forgot-password', authController.forgotPassword);
authRoutes.post('/reset-password', authController.resetPassword);

export { authRoutes };
