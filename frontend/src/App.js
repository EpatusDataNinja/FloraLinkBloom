import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ErrorBoundary } from "react-error-boundary";

// Importing components from the landing pages
import Home from "./pages/landing/Home_page";
import About from "./pages/landing/aboutPage";
import Contact from "./pages/landing/contactPage";
import NotFound from './pages/landing/Accounts_Auto/notfound';
import Logout from './pages/landing/Accounts_Auto/logout';
import Notifications from './pages/AdminDashboard/NotificationPage'
import LoginPage from "./pages/landing/LoginPage";
import SignupPage from "./pages/landing/SignupPage";

import Forgot from "./pages/landing/Forgot_password";
import Code_verification from "./pages/landing/Code_Verification";
import ResetPassword from "./pages/landing/ResetPassword";
import UserProducts from './pages/landing/User_products';
import AUTO from './pages/landing/AUTO';

// Import new cart and checkout components
import CartPage from './pages/BuyerDashboard/CartPage';
import CheckoutPage from './pages/BuyerDashboard/CheckoutPage';

import AdminDashboard from "./pages/AdminDashboard/UsersPage";
import SellerDashboard from './pages/SellerDashboard/dashboard';
import BuyerDashboardPage from "./pages/BuyerDashboard/BuyerDashboardPage";

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

import Chat from './pages/BuyerDashboard/ChatPage';
import SalesReportPage from './pages/SellerDashboard/SalesReportPage';
import ProductCategories from './pages/SellerDashboard/ProductCategoryPage';
import PendingProducts from './pages/AdminDashboard/PendingProducts';

// Import profile and settings pages for each role
import SellerProfile from "./pages/SellerDashboard/user-profile";
import BuyerProfile from "./pages/BuyerDashboard/user-profile";
import AdminProfile from "./pages/AdminDashboard/user-profile";
import SellerSettings from "./pages/SellerDashboard/settings";
import BuyerSettings from "./pages/BuyerDashboard/settings";
import AdminSettings from "./pages/AdminDashboard/settings";

import SellerDashboardPage from "./pages/SellerDashboard/SellerDashboardPage";
import SellerOverview from "./pages/SellerDashboard/dashboard";
import OrdersPage from './pages/SellerDashboard/OrdersList';
import Categories from './pages/SellerDashboard/categoriesManagement';
import ProductForm from './pages/SellerDashboard/productForm';
import OutOfStockProducts from './pages/SellerDashboard/ListOfOutProduct';
import ProductList from './pages/SellerDashboard/LIST_OF_ALL_PRODUCT';
import AdminDashboard_Page from "./pages/AdminDashboard/AdminDashboard_Page";

// Add these imports
import {
  UserActivityReport,
  ReportLayout,
  ProductPerformanceReport,
  SeasonalTrendsReport,
  SalesReport,
  StockPerishabilityReport
} from './pages/AdminDashboard/Reports';

// Main App component
function App() {
  console.log('SalesReport imported:', SalesReport); // Debug log
  console.log('ReportLayout imported:', ReportLayout); // Debug log
  
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <ToastContainer />
      {/* Define the routes using the Routes component */}
      <Routes>
        {/* Landing Pages */}
        <Route path="/" element={<Home />} exact={true} />
        <Route path="/about" element={<About />} exact={true} />
        <Route path="/contact" element={<Contact />} exact={true} />
        
        {/* Authentication Routes */}
        <Route path="/login" element={<LoginPage />} exact={true} />
        <Route path="/register" element={<SignupPage />} exact={true} />
        <Route path="/forgot" element={<Forgot />} exact={true} />
        <Route path="/code_verification/:email" element={<Code_verification/>} exact={true} />
        <Route path="/resetPassword/:email" element={<ResetPassword/>} exact={true} />
        <Route path="/logout" element={<Logout />} exact={true} />

        {/* Cart and Checkout Routes */}
        <Route path="/cart" element={<CartPage />} exact={true} />
        <Route path="/checkout" element={<CheckoutPage />} exact={true} />

        <Route path="*" element={<NotFound />} />
        <Route path="/dashboard/admin" element={<AdminDashboard_Page />} />
        <Route path="/dashboard/seller" element={
          <SellerDashboardPage>
            <SellerOverview />
          </SellerDashboardPage>
        } />
        <Route path="/dashboard/buyer" element={<BuyerDashboardPage />} />

        <Route path="/notifications" element={<Notifications/>} exact={true} />
        <Route path="/user-products/:userId" element={<UserProducts />} />
        <Route path="/dashboard/user-products/:userId" element={<UserProductsAdmin />} />
        <Route path="/dashboard/users" element={<Users/>} exact={true} />
        <Route path="/auto" element={<AUTO />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Profile />} />

        <Route path="/add_product" element={
          <SellerDashboardPage>
            <ProductForm />
          </SellerDashboardPage>
        } />
        <Route path="/admin/moderate_product" element={<ModelateProduct/>} />
        <Route path="/product_list" element={
          <SellerDashboardPage>
            <ProductList />
          </SellerDashboardPage>
        } />
        <Route path="/products" element={<ProductToBuy/>} />  

        <Route path="/buyer/orders" element={<BuyerOrders/>} />    
        <Route path="/seller/orders" element={
          <SellerDashboardPage>
            <OrdersPage />
          </SellerDashboardPage>
        } /> 
        <Route path="/admin/orders" element={<AdminOrders/>} /> 

        <Route path="/payment" element={<PaymentPage/>} />  

        <Route path="/buyer/overview" element={<BuyerDashboardPage />} />    
        <Route path="/seller/overview" element={
          <SellerDashboardPage>
            <SellerOverview />
          </SellerDashboardPage>
        } /> 
        <Route path="/chat" element={<Chat/>} /> 
        <Route path="/product/categories" element={
          <SellerDashboardPage>
            <Categories />
          </SellerDashboardPage>
        } /> 
        <Route path="/sales/report" element={
          <SellerDashboardPage>
            <SalesReportPage />
          </SellerDashboardPage>
        } />
        <Route path="/dashboard/seller/add-product" element={
          <SellerDashboardPage>
            <ProductForm />
          </SellerDashboardPage>
        } />
        <Route path="/dashboard/seller/products" element={
          <SellerDashboardPage>
            <ProductList />
          </SellerDashboardPage>
        } />
        <Route path="/admin/pending_products" element={<PendingProducts />} />

        {/* Profile and Settings Routes */}
        <Route path="/seller-dashboard/user-profile" element={<SellerProfile />} />
        <Route path="/buyer-dashboard/user-profile" element={<BuyerProfile />} />
        <Route path="/admin-dashboard/user-profile" element={<AdminProfile />} />
        <Route path="/seller-dashboard/settings" element={<SellerSettings />} />
        <Route path="/buyer-dashboard/settings" element={<BuyerSettings />} />
        <Route path="/admin-dashboard/settings" element={<AdminSettings />} />

        {/* Admin Routes */}
        <Route path="/admin/overview" element={<AdminDashboard_Page />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/pending_products" element={<PendingProducts />} />
        <Route path="/admin/moderate_product" element={<ModelateProduct />} />

        {/* Reports Routes */}
        <Route 
          path="/admin/reports/sales" 
          element={
            <ErrorBoundary>
              <ReportLayout>
                <SalesReport />
              </ReportLayout>
            </ErrorBoundary>
          } 
        />
        <Route 
          path="/admin/reports/products" 
          element={
            <ReportLayout>
              <ProductPerformanceReport />
            </ReportLayout>
          } 
        />
        <Route 
          path="/admin/reports/users" 
          element={
            <ErrorBoundary>
              <ReportLayout>
                <UserActivityReport />
              </ReportLayout>
            </ErrorBoundary>
          } 
        />
        <Route 
          path="/admin/reports/seasonal" 
          element={
            <ErrorBoundary>
              <ReportLayout>
                <SeasonalTrendsReport />
              </ReportLayout>
            </ErrorBoundary>
          } 
        />
        <Route 
          path="/admin/reports/stock" 
          element={
            <ErrorBoundary>
              <ReportLayout>
                <StockPerishabilityReport />
              </ReportLayout>
            </ErrorBoundary>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

// Export the App component as the default export
export default App;