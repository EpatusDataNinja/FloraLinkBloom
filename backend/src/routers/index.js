import express from 'express';

import docrouter from '../documentation/index.doc.js';
import userRouter from './userRouter.js';
import authRouter from './authRouter.js';
import productRouter from './ProductRouter.js';
import CategoriesRouter from './categoriesRouter.js';
import notification from './notificationRouter.js';
import messagesRouter from './messagesRouter.js';
import OrdersRouter from './OrdersRouter.js';
import PaymentRouter from './paymentRouter.js';
import reportsRouter from './reportsRouter.js';



const router = express.Router();

router.use('/docs', docrouter);
router.use('/users', userRouter);
router.use('/auth', authRouter);
router.use('/product', productRouter);
router.use('/categories', CategoriesRouter);
router.use('/message', messagesRouter);
router.use('/order', OrdersRouter);
router.use('/payment', PaymentRouter);
router.use('/notification', notification);
router.use('/reports', reportsRouter);



export default router;
