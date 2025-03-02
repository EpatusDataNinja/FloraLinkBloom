import express from 'express';
import {
  addUser,
  deleteOneUser,
  getAllUsers,
  getOneUser,
  updateOneUser,
  activateOneUser,
  deactivateOneUser,
  changePassword,
  checkEmail,
  checkCode,
  ResetPassword,
  Signup,
  getAdminOverview,
  getSellerOverview,
  getBuyerOverview,
  getSellerSalesReport
} from '../controllers/userController.js';
import { protect } from '../middlewares/protect.js';
import multer from 'multer';
const router = express.Router();

const upload = multer({ dest: 'uploads/' });
router.post('/signup', Signup);
router.get('/', protect, getAllUsers);
router.get('/admin/overview', protect, getAdminOverview);
router.get('/seller/overview', protect, getSellerOverview);
router.get('/seller/sales-report', protect, getSellerSalesReport);
router.get('/buyer/overview', protect, getBuyerOverview);
router.get('/:id', protect, getOneUser);
router.post('/addUser', protect, addUser);
router.put('/update/:id', protect, updateOneUser);
router.delete('/delete/:id', protect, deleteOneUser);
router.put('/activate/:id', protect, activateOneUser);
router.put('/deactivate/:id', protect, deactivateOneUser);
router.put('/changePassword', protect, changePassword);

router.post('/check', checkEmail);
router.post('/code/:email', checkCode);
router.put('/resetPassword/:email', ResetPassword);

export default router;
