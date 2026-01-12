import { Router } from 'express';
import ProjectController from '../controllers/ProjectController';
import { authMiddleware } from '../middlewares/authMiddleware';

const projectRoutes = Router();

// Lista projetos ativos (Público/Logado)
projectRoutes.get('/', authMiddleware, ProjectController.listPublic);

export { projectRoutes };
