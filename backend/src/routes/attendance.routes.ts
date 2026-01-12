import { Router } from 'express';
import { AttendanceController } from '../controllers/AttendanceController';
import { authMiddleware } from '../middlewares/authMiddleware';

const attendanceRoutes = Router();
const attendanceController = new AttendanceController();

attendanceRoutes.use(authMiddleware);

attendanceRoutes.post('/', attendanceController.registrar);
attendanceRoutes.get('/:inscricaoId', attendanceController.listarPorInscricao);

export { attendanceRoutes };
