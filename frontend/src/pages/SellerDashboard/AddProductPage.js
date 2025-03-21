import React from "react";
import { useLocation } from "react-router-dom";
import ProductForm from "./productForm";
import SellerDashboardPage from "./SellerDashboardPage";

const AddProductPage = () => {
  const location = useLocation();
  const { editMode = false, productData = null } = location.state || {};

  return (
    <SellerDashboardPage>
      <div className="content-wrapper">
        <ProductForm 
          editMode={editMode} 
          productData={productData}
          key={productData?.id || 'new'}
        />
      </div>
    </SellerDashboardPage>
  );
};

export default AddProductPage;
