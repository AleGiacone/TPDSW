import express from 'express';
import { createAdmin } from './admin.controller.js';

const adminRouter = express.Router();

adminRouter.post('/', createAdmin);

export {adminRouter}