
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Importing components from the landing pages
import Home from "./pages/landing/Home_page";
import About from "./pages/landing/aboutPage";
import Contact from "./pages/landing/contactPage";
import NotFound from './pages/landing/Accounts_Auto/notfound';
import Logout from './pages/landing/Accounts_Auto/logout';
import Notifications from './pages/AdminDashboard/NotificationPage'


import Forgot from "./pages/landing/Forgot_password";
import Code_verification from "./pages/landing/Code_Verification";
import ResetPassword from "./pages/landing/ResetPassword";
import UserProducts from './pages/landing/User_products';
import AUTO from './pages/landing/AUTO';


import AdminDashboard from "./pages/AdminDashboard/UsersPage";
import SellerDashboard from "./pages/SellerDashboard/homePage";
import BuyerDashboard from "./pages/BuyerDashboard/homePage";

import Users from "./pages/AdminDashboard/UsersPage";
import UserProductsAdmin from './pages/AdminDashboard/UserProduct';
import Profile from './pages/AdminDashboard/profile_page';
import AddProduct from './pages/SellerDashboard/AddProductPage';
import ModelateProduct from './pages/AdminDashboard/modelete_Product';
import GeneralProductList from './pages/SellerDashboard/Product_List_page';
import ProductToBuy from './pages/BuyerDashboard/ProductPage';
import PaymentPage from './pages/BuyerDashboard/PaymentPage';

import BuyerOrders from './pages/BuyerDashboard/BuyerOrdersPage';
import SellersOrders from './pages/SellerDashboard/SellerOrdersPage';
import AdminOrders from './pages/AdminDashboard/AdminOrdersPage';

import AdminOverView from './pages/AdminDashboard/AdminDashboard_Page';
import SellerOverView from './pages/SellerDashboard/SellerDashboard_Page';
import BuyerOverView from './pages/BuyerDashboard/SellerDashboard_Page';
import Chat from './pages/BuyerDashboard/ChatPage';
import SalesReport from './pages/SellerDashboard/SalesReportPage';
import ProductCategories from './pages/SellerDashboard/ProductCategoryPage';





// Main App component
function App() {
  return (
    // Set up the BrowserRouter for handling routes
    <BrowserRouter>
      {/* Define the routes using the Routes component */}
      <Routes>
        {/* Landing Pages */}
        <Route path="/" element={<Home />} exact={true} />
        <Route path="/about" element={<About />} exact={true} />
        <Route path="/contact" element={<Contact />} exact={true} />
        <Route path="*" element={<NotFound />} />
        <Route path="/dashboard/admin" element={<AdminDashboard />} exact={true} />
        <Route path="/dashboard/seller" element={<SellerDashboard />} exact={true} />
        <Route path="/dashboard/buyer" element={<BuyerDashboard/>} exact={true} />

        <Route path="/notifications" element={<Notifications/>} exact={true} />
        <Route path="/user-products/:userId" element={<UserProducts />} />
        <Route path="/dashboard/user-products/:userId" element={<UserProductsAdmin />} />
        <Route path="/dashboard/users" element={<Users/>} exact={true} />
        <Route path="/auto" element={<AUTO />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Profile />} />
        <Route path="/forgot" element={<Forgot />} exact={true} />
        <Route path="/code_verification/:email" element={<Code_verification/>} exact={true} />
        <Route path="/resetPassword/:email" element={<ResetPassword/>} exact={true} />

        <Route path="/add_product" element={<AddProduct/>} />
        <Route path="/admin/moderate_product" element={<ModelateProduct/>} />
        <Route path="/product_list" element={<GeneralProductList/>} />  
        <Route path="/products" element={<ProductToBuy/>} />  

        <Route path="/buyer/orders" element={<BuyerOrders/>} />    
        <Route path="/seller/orders" element={<SellersOrders/>} /> 
        <Route path="/admin/orders" element={<AdminOrders/>} /> 

        <Route path="/payment" element={<PaymentPage/>} />  

        <Route path="/buyer/overview" element={<BuyerOverView/>} />    
        <Route path="/seller/overview" element={<SellerOverView/>} /> 
        <Route path="/admin/overview" element={<AdminOverView/>} />   
        <Route path="/sales/report" element={<SalesReport/>} />   
        <Route path="/chat" element={<Chat/>} /> 
        <Route path="/product/categories" element={<ProductCategories/>} /> 
      </Routes>
    </BrowserRouter>
  );
}

// Export the App component as the default export    OurResto
export default App;
