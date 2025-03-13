import db from "../database/models/index.js";
const { Users } = db;

export const checkReportAccess = async (req, res, next) => {
  try {
    const user = await Users.findByPk(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only administrators can access reports.'
      });
    }
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking report access',
      error: error.message
    });
  }
}; 