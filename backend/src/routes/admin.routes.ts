import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import AdminUserController from '../controllers/AdminUserController';
import ProjectController from '../controllers/ProjectController';

const adminRoutes = Router();

// Gestão de Usuários (Admin)
adminRoutes.get('/users', authMiddleware, AdminUserController.listAll);
adminRoutes.put('/users/:userId/role', authMiddleware, AdminUserController.updateRole);

// Gestão de Projetos (Admin)
adminRoutes.post('/projects', authMiddleware, ProjectController.create);
adminRoutes.put('/projects/:id', authMiddleware, ProjectController.update);
adminRoutes.delete('/projects/:id', authMiddleware, ProjectController.delete);
adminRoutes.get('/projects', authMiddleware, ProjectController.listAll); // Lista todos (ativos e inativos)

export { adminRoutes };
