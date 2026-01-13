import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { ClassReportController } from '../controllers/ClassReportController';

const classReportRoutes = Router();
const controller = new ClassReportController();

// Configure Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Make sure this folder exists
    },
    filename: (req, file, cb) => {
        // Unique filename: timestamp-random.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Routes
classReportRoutes.post('/', upload.single('foto'), controller.create.bind(controller));
classReportRoutes.get('/feed', controller.listFeed.bind(controller));

export { classReportRoutes };
