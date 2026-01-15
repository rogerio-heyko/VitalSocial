import { Router } from 'express';
import { ProfileController } from '../controllers/ProfileController';
import { authMiddleware } from '../middlewares/authMiddleware';

const profileRoutes = Router();
const profileController = new ProfileController();

// Todas as rotas abaixo requerem autenticação
profileRoutes.use(authMiddleware);

profileRoutes.get('/me', profileController.meuPerfil);
profileRoutes.put('/', profileController.atualizarUsuario); // Basic Info (Name, Password)
profileRoutes.put('/doador', profileController.atualizarDoador);
profileRoutes.put('/beneficiario', profileController.atualizarBeneficiario);

export { profileRoutes };
