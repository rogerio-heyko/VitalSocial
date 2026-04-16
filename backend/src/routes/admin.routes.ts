import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import AdminUserController from '../controllers/AdminUserController';
import ProjectController from '../controllers/ProjectController';
import AdminEnrollmentController from '../controllers/AdminEnrollmentController';

const adminRoutes = Router();

// Gestão de Usuários (Admin)
adminRoutes.get('/users', authMiddleware, AdminUserController.listAll);
adminRoutes.put('/users/:userId/role', authMiddleware, AdminUserController.updateRole);

// Gestão de Projetos (Admin)
adminRoutes.post('/projects', authMiddleware, ProjectController.create);
adminRoutes.put('/projects/:id', authMiddleware, ProjectController.update);
adminRoutes.delete('/projects/:id', authMiddleware, ProjectController.delete);
adminRoutes.get('/projects', authMiddleware, ProjectController.listAll); // Lista todos (ativos e inativos)

// Gestão de Inscrições / Fila de Espera
adminRoutes.get('/enrollments/waitlist', authMiddleware, AdminEnrollmentController.listWaitlist);
adminRoutes.put('/enrollments/:id/approve', authMiddleware, AdminEnrollmentController.approve);

export { adminRoutes };
