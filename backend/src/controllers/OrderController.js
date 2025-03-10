import db from "../database/models/index.js";
const Orders = db["Orders"];
const Products = db["Products"];

export const getBuyerDashboardStats = async (req, res) => {
  try {
    const userID = req.user.id;

    // Get total orders count
    const totalOrders = await Orders.count({
      where: { userID: userID }
    });

    // Get pending orders count
    const pendingOrders = await Orders.count({
      where: { 
        userID: userID,
        status: 'pending'
      }
    });

    // Get delivered orders count
    const deliveredOrders = await Orders.count({
      where: { 
        userID: userID,
        status: 'delivered'
      }
    });

    // Get total amount spent
    const totalSpentResult = await Orders.sum('totalAmount', {
      where: { 
        userID: userID,
        status: ['delivered', 'shipped']
      }
    });
    const totalSpent = totalSpentResult || 0;

    // Get recent orders
    const recentOrders = await Orders.findAll({
      where: { userID: userID },
      include: [{
        model: Products,
        as: 'product',
        attributes: ['name', 'image']
      }],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    // Get recently viewed products
    const recentProducts = await Products.findAll({
      where: { 
        status: 'In Stock'
      },
      order: [['updatedAt', 'DESC']],
      limit: 4,
      attributes: ['id', 'name', 'price', 'image', 'quantity']
    });

    return res.status(200).json({
      success: true,
      data: {
        orderStats: {
          totalOrders,
          pendingOrders,
          deliveredOrders,
          totalSpent
        },
        recentOrders: recentOrders.map(order => ({
          id: order.id,
          status: order.status,
          totalAmount: order.totalAmount,
          createdAt: order.createdAt,
          product: order.product ? {
            name: order.product.name,
            image: order.product.image
          } : null
        })),
        recentProducts: recentProducts.map(product => ({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: product.quantity
        }))
      }
    });

  } catch (error) {
    console.error('Error in getBuyerDashboardStats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
}; 