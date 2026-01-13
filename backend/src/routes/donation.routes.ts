import { Router } from 'express';
import { DonationController } from '../controllers/DonationController';
import { authMiddleware } from '../middlewares/authMiddleware';

const donationRoutes = Router();
const controller = new DonationController();

donationRoutes.post('/pix', authMiddleware, controller.createPixDonation);
donationRoutes.post('/crypto', authMiddleware, controller.createCryptoDonation);
donationRoutes.get('/crypto', authMiddleware, controller.getCryptoWallets);
donationRoutes.get('/minhas', authMiddleware, controller.getMyDonations);

export { donationRoutes };
