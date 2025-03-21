import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import Title from "../../components_part/TitleCard";
import ProductModerationList from "../../components_part/ProductModerationList";

const ListOfOutProduct = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const productsPerPage = 6;

  const fetchProducts = async () => {
    try {
      let token = localStorage.getItem("token");
      if (!token) {
        toast.error("No token found! Please login.");
        return;
      }

      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/v1/product/outofstock`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setProducts(response.data.data);
      } else {
        toast.error(response.data.message || "Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Error fetching products");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (productId) => {
    try {
      let token = localStorage.getItem("token");
      if (!token) {
        toast.error("No token found! Please login.");
        return;
      }

      // Add debug logging
      console.log('Attempting to approve product:', productId);

      const response = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/api/v1/product/activate/${productId}`,
        {}, // empty body
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      console.log('Server response:', response.data);

      if (response.data.success) {
        // Check if we have the necessary data for notification
        if (response.data.data && response.data.data.userID) {
          try {
            await axios.post(
              `${process.env.REACT_APP_BASE_URL}/api/v1/notification/create`,
              {
                userID: response.data.data.userID, // Changed from sellerID to userID
                title: "Product Approved",
                message: `Your product "${response.data.data.name}" has been approved and is now live.`,
                type: "PRODUCT_APPROVED",
                relatedId: productId
              },
              {
                headers: { Authorization: `Bearer ${token}` }
              }
            );
          } catch (notifError) {
            console.error("Notification error:", notifError);
            // Log more details about the notification error
            console.error("Notification error details:", {
              message: notifError.message,
              response: notifError.response?.data,
              status: notifError.response?.status
            });
            // Continue even if notification fails
          }
        } else {
          console.warn("Missing user data for notification:", response.data);
        }

        toast.success("Product approved successfully!");
        fetchProducts(); // Refresh the products list
      } else {
        throw new Error(response.data.message || "Failed to approve product");
      }
    } catch (error) {
      // Enhanced error logging
      console.error("Error approving product:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });

      toast.error(
        error.response?.data?.message || 
        error.message || 
        "Error approving product. Please try again."
      );
    }
  };

  const handleReject = async (productId) => {
    try {
      let token = localStorage.getItem("token");
      if (!token) {
        toast.error("No token found! Please login.");
        return;
      }

      const response = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/api/v1/product/disactivate/${productId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        // Send notification to seller about product rejection
        try {
          await axios.post(
            `${process.env.REACT_APP_BASE_URL}/api/v1/notification/create`,
            {
              userID: response.data.data.sellerID,
              title: "Product Rejected",
              message: `Your product "${response.data.data.name}" has been rejected. Please review and update accordingly.`,
              type: "PRODUCT_REJECTED",
              relatedId: productId
            },
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
        } catch (notifError) {
          console.error("Notification error:", notifError);
          // Don't block the rejection process if notification fails
        }

        toast.success("Product rejected successfully!");
        fetchProducts();
      } else {
        throw new Error(response.data.message || "Failed to reject product");
      }
    } catch (error) {
      console.error("Error rejecting product:", error);
      toast.error(error.response?.data?.message || "Error rejecting product");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  return (
    <div className="out-of-stock-products">
      <Title title="Out of Stock Products" />
      <ToastContainer />
      <ProductModerationList
        products={products}
        currentProducts={currentProducts}
        loading={loading}
        currentPage={currentPage}
        productsPerPage={productsPerPage}
        handleApprove={handleApprove}
        handleReject={handleReject}
        handlePageChange={setCurrentPage}
      />
    </div>
  );
};

export default ListOfOutProduct;
