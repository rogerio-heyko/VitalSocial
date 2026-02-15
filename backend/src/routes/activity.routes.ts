import { Router } from 'express';
import { ActivityController } from '../controllers/ActivityController';
import { authMiddleware } from '../middlewares/authMiddleware';

const activityRoutes = Router();
const activityController = new ActivityController();

activityRoutes.use(authMiddleware);

activityRoutes.post('/', activityController.criar);
activityRoutes.get('/', activityController.listar);
activityRoutes.post('/:id/inscrever', activityController.inscrever);
activityRoutes.get('/minhas', activityController.minhasInscricoes);
activityRoutes.get('/projeto/:projetoId', activityController.listarPorProjeto);
activityRoutes.put('/:id', activityController.update);
activityRoutes.delete('/:id', activityController.delete);

export { activityRoutes };
