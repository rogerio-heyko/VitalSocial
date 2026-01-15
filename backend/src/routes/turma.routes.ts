import { Router } from 'express';
import TurmaController from '../controllers/TurmaController';
import { authMiddleware } from '../middlewares/authMiddleware';

const turmaRoutes = Router();

turmaRoutes.use(authMiddleware);

turmaRoutes.post('/', TurmaController.create);
turmaRoutes.get('/atividade/:atividadeId', TurmaController.listByActivity);
turmaRoutes.get('/minhas', TurmaController.listMyClasses);
turmaRoutes.get('/:id', TurmaController.getDetails);
turmaRoutes.post('/:id/alunos', TurmaController.addStudent);

export { turmaRoutes };
