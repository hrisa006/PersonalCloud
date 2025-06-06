import { Router } from 'express';
import { login, register } from '../controller/auth-controller';
const authRoutes = Router();

authRoutes.post('/login', login);
authRoutes.post('/register', register);

export default authRoutes;
