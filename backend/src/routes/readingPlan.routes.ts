import { Router } from 'express';
import { ReadingPlanController } from '../controllers/ReadingPlanController';
import { authMiddleware } from '../middlewares/authMiddleware';

const readingPlanRoutes = Router();
const readingPlanController = new ReadingPlanController();

readingPlanRoutes.use(authMiddleware);

readingPlanRoutes.post('/', readingPlanController.criar);
readingPlanRoutes.get('/', readingPlanController.listar);
readingPlanRoutes.post('/:id/concluir', readingPlanController.alternarStatusLeitura);

export { readingPlanRoutes };
