import express from 'express';
import { inviaEmail } from '../controllers/emailController';

const router = express.Router();

router.post('/email', inviaEmail);

export default router;
