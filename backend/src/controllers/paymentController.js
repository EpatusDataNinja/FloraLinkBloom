import {
    getAllPayments,
  } from "../services/PaymentService.js";
  
export const paymentController = async (req, res) => {
  try {
    let data =  await getAllPayments();
    if (req.user.role == "admin") {
        data = data;
        }
    if (req.user.role === "buyer") {
        data = data.filter(payment => payment.userID === req.user.id);
        }
    if (req.user.role === "seller") {
        data = data.filter(payment => payment.order.product.userID === req.user.id);
        }



    // if (!req.user) {
    //   // If the user is not logged in, return all public posts
    //   data = await generalproducts_available(); // Adjust this function to return only public posts if needed
    //   return res.status(200).json({
    //     success: true,
    //     message: "Public products retrieved successfully",
    //     data,
    //   });
    // }
    // const userID = req.user.id; // Get logged-in user's ID
    // if (req.user.role == "admin") {
    //   data = await generalproducts();
    // }
    // if (req.user.role == "seller") {
    //   data = await getAllProductses(userID);
    // }
    // if (req.user.role == "buyer") {
    //   data = await generalproducts_available();
    // }


    if (!data || data.length === 0) {
      return res.status(404).json({
        message: "No payment found",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment retrieved successfully",
      data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
      error,
    });
  }
};
