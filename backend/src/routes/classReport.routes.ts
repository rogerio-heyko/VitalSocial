import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ClassReportController } from '../controllers/ClassReportController';

const classReportRoutes = Router();
const controller = new ClassReportController();

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); 
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
classReportRoutes.post('/attendance', controller.registerAttendance.bind(controller));

export { classReportRoutes };
