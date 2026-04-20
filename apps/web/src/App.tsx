import { Routes, Route, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import Navbar from '@/components/Navbar'

// Public pages
import Landing from '@/pages/Landing'
import HomePage from '@/pages/HomePage'
import ShopList from '@/pages/ShopList'
import ShopDetail from '@/pages/ShopDetail'
import ProductDetail from '@/pages/ProductDetail'
import ProductsPage from '@/pages/ProductsPage'
import SearchResultsPage from '@/pages/SearchResultsPage'
import CategoryPage from '@/pages/CategoryPage'
import NotFoundPage from '@/pages/NotFoundPage'
import ErrorPage from '@/pages/ErrorPage'
import UnauthorizedPage from '@/pages/UnauthorizedPage'
import AdminLogin from '@/pages/AdminLogin'

// Auth pages
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/ResetPasswordPage'
import VerifyEmailPage from '@/pages/VerifyEmailPage'

// Customer pages
import Cart from '@/pages/Cart'
import Checkout from '@/pages/Checkout'
import OrderConfirmationPage from '@/pages/OrderConfirmationPage'
import Orders from '@/pages/Orders'
import OrderDetailPage from '@/pages/OrderDetailPage'
import OrderTrackPage from '@/pages/OrderTrackPage'
import Profile from '@/pages/Profile'
import SettingsPage from '@/pages/SettingsPage'
import AddressesPage from '@/pages/AddressesPage'
import AddressFormPage from '@/pages/AddressFormPage'
import WishlistPage from '@/pages/WishlistPage'
import NotificationsPage from '@/pages/NotificationsPage'

// Shop owner pages
import ShopDashboard from '@/pages/shop/ShopDashboard'
import ShopProductsPage from '@/pages/shop/ShopProductsPage'
import ShopProductFormPage from '@/pages/shop/ShopProductFormPage'
import ShopOrdersPage from '@/pages/shop/ShopOrdersPage'
import ShopOrderDetailPage from '@/pages/shop/ShopOrderDetailPage'
import ShopSettingsPage from '@/pages/shop/ShopSettingsPage'
import ShopAnalyticsPage from '@/pages/shop/ShopAnalyticsPage'
import ShopDeliveryBoysPage from '@/pages/shop/ShopDeliveryBoysPage'
import ShopReviewsPage from '@/pages/shop/ShopReviewsPage'

// Delivery boy pages
import DeliveryDashboard from '@/pages/delivery/DeliveryDashboard'
import DeliveryAssignmentsPage from '@/pages/delivery/DeliveryAssignmentsPage'
import DeliveryDetailPage from '@/pages/delivery/DeliveryDetailPage'
import DeliveryHistoryPage from '@/pages/delivery/DeliveryHistoryPage'
import DeliveryEarningsPage from '@/pages/delivery/DeliveryEarningsPage'

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminShopsPage from '@/pages/admin/AdminShopsPage'
import AdminShopDetailPage from '@/pages/admin/AdminShopDetailPage'
import AdminUsersPage from '@/pages/admin/AdminUsersPage'
import AdminUserDetailPage from '@/pages/admin/AdminUserDetailPage'
import AdminOrdersPage from '@/pages/admin/AdminOrdersPage'
import AdminOrderDetailPage from '@/pages/admin/AdminOrderDetailPage'
import AdminAnalyticsPage from '@/pages/admin/AdminAnalyticsPage'
import AdminCategoriesPage from '@/pages/admin/AdminCategoriesPage'
import AdminReviewsPage from '@/pages/admin/AdminReviewsPage'
import AdminSettingsPage from '@/pages/admin/AdminSettingsPage'
import SellerSettlements from '@/pages/admin/SellerSettlements'
import SellerSettlementDetail from '@/pages/admin/SellerSettlementDetail'
import PlatformSettings from '@/pages/admin/PlatformSettings'

const pageVariants = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.15, ease: [0.22, 1, 0.36, 1] } },
}

const noAnimationPaths = ['/', '/shop/dashboard', '/delivery/dashboard', '/admin']

function AnimatedRoute({ element, noAnimation = false }: { element: React.ReactNode; noAnimation?: boolean }) {
  const location = useLocation()
  const shouldAnimate = !noAnimation && !noAnimationPaths.includes(location.pathname)

  if (!shouldAnimate) return <>{element}</>

  return (
    <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants}>
      {element}
    </motion.div>
  )
}

export default function App() {
  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<AnimatedRoute element={<Landing />} />} />
          <Route path="/home" element={<ProtectedRoute><AnimatedRoute element={<HomePage />} /></ProtectedRoute>} />
          <Route path="/shops" element={<AnimatedRoute element={<ShopList />} />} />
          <Route path="/shops/:id" element={<AnimatedRoute element={<ShopDetail />} />} />
          <Route path="/products" element={<AnimatedRoute element={<ProductsPage />} />} />
          <Route path="/products/:id" element={<AnimatedRoute element={<ProductDetail />} />} />
          <Route path="/search" element={<AnimatedRoute element={<SearchResultsPage />} />} />
          <Route path="/categories/:slug" element={<AnimatedRoute element={<CategoryPage />} />} />
          <Route path="/404" element={<AnimatedRoute element={<NotFoundPage />} />} />
          <Route path="/error" element={<AnimatedRoute element={<ErrorPage />} />} />
          <Route path="/unauthorized" element={<AnimatedRoute element={<UnauthorizedPage />} />} />

          {/* Auth Routes */}
          <Route path="/login" element={<AnimatedRoute element={<Login />} />} />
          <Route path="/register" element={<AnimatedRoute element={<Register />} />} />
          <Route path="/admin-login" element={<AnimatedRoute element={<AdminLogin />} />} />
          <Route path="/forgot-password" element={<AnimatedRoute element={<ForgotPasswordPage />} />} />
          <Route path="/reset-password" element={<AnimatedRoute element={<ResetPasswordPage />} />} />
          <Route path="/verify-email" element={<AnimatedRoute element={<VerifyEmailPage />} />} />

          {/* Customer Routes */}
          <Route path="/cart" element={<ProtectedRoute><AnimatedRoute element={<Cart />} /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><AnimatedRoute element={<Checkout />} /></ProtectedRoute>} />
          <Route path="/orders/:id/confirmation" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><AnimatedRoute element={<OrderConfirmationPage />} /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><AnimatedRoute element={<Orders />} /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><AnimatedRoute element={<OrderDetailPage />} /></ProtectedRoute>} />
          <Route path="/orders/:id/track" element={<ProtectedRoute><AnimatedRoute element={<OrderTrackPage />} /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><AnimatedRoute element={<Profile />} /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><AnimatedRoute element={<SettingsPage />} /></ProtectedRoute>} />
          <Route path="/addresses" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><AnimatedRoute element={<AddressesPage />} /></ProtectedRoute>} />
          <Route path="/addresses/new" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><AnimatedRoute element={<AddressFormPage />} /></ProtectedRoute>} />
          <Route path="/addresses/:id/edit" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><AnimatedRoute element={<AddressFormPage />} /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><AnimatedRoute element={<WishlistPage />} /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><AnimatedRoute element={<NotificationsPage />} /></ProtectedRoute>} />

          {/* Shop Owner Routes */}
          <Route path="/shop/dashboard" element={<ProtectedRoute allowedRoles={['SHOP_OWNER']}><AnimatedRoute element={<ShopDashboard />} noAnimation /></ProtectedRoute>} />
          <Route path="/shop/products" element={<ProtectedRoute allowedRoles={['SHOP_OWNER']}><AnimatedRoute element={<ShopProductsPage />} /></ProtectedRoute>} />
          <Route path="/shop/products/new" element={<ProtectedRoute allowedRoles={['SHOP_OWNER']}><AnimatedRoute element={<ShopProductFormPage />} /></ProtectedRoute>} />
          <Route path="/shop/products/:id/edit" element={<ProtectedRoute allowedRoles={['SHOP_OWNER']}><AnimatedRoute element={<ShopProductFormPage />} /></ProtectedRoute>} />
          <Route path="/shop/orders" element={<ProtectedRoute allowedRoles={['SHOP_OWNER']}><AnimatedRoute element={<ShopOrdersPage />} /></ProtectedRoute>} />
          <Route path="/shop/orders/:id" element={<ProtectedRoute allowedRoles={['SHOP_OWNER']}><AnimatedRoute element={<ShopOrderDetailPage />} /></ProtectedRoute>} />
          <Route path="/shop/settings" element={<ProtectedRoute allowedRoles={['SHOP_OWNER']}><AnimatedRoute element={<ShopSettingsPage />} /></ProtectedRoute>} />
          <Route path="/shop/analytics" element={<ProtectedRoute allowedRoles={['SHOP_OWNER']}><AnimatedRoute element={<ShopAnalyticsPage />} /></ProtectedRoute>} />
          <Route path="/shop/delivery-boys" element={<ProtectedRoute allowedRoles={['SHOP_OWNER']}><AnimatedRoute element={<ShopDeliveryBoysPage />} /></ProtectedRoute>} />
          <Route path="/shop/reviews" element={<ProtectedRoute allowedRoles={['SHOP_OWNER']}><AnimatedRoute element={<ShopReviewsPage />} /></ProtectedRoute>} />

          {/* Delivery Boy Routes */}
          <Route path="/delivery/dashboard" element={<ProtectedRoute allowedRoles={['DELIVERY_BOY']}><AnimatedRoute element={<DeliveryDashboard />} noAnimation /></ProtectedRoute>} />
          <Route path="/delivery/assignments" element={<ProtectedRoute allowedRoles={['DELIVERY_BOY']}><AnimatedRoute element={<DeliveryAssignmentsPage />} /></ProtectedRoute>} />
          <Route path="/delivery/:id" element={<ProtectedRoute allowedRoles={['DELIVERY_BOY']}><AnimatedRoute element={<DeliveryDetailPage />} /></ProtectedRoute>} />
          <Route path="/delivery/history" element={<ProtectedRoute allowedRoles={['DELIVERY_BOY']}><AnimatedRoute element={<DeliveryHistoryPage />} /></ProtectedRoute>} />
          <Route path="/delivery/earnings" element={<ProtectedRoute allowedRoles={['DELIVERY_BOY']}><AnimatedRoute element={<DeliveryEarningsPage />} /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AnimatedRoute element={<AdminDashboard />} noAnimation /></ProtectedRoute>} />
          <Route path="/admin/shops" element={<ProtectedRoute allowedRoles={['ADMIN']}><AnimatedRoute element={<AdminShopsPage />} /></ProtectedRoute>} />
          <Route path="/admin/shops/:id" element={<ProtectedRoute allowedRoles={['ADMIN']}><AnimatedRoute element={<AdminShopDetailPage />} /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><AnimatedRoute element={<AdminUsersPage />} /></ProtectedRoute>} />
          <Route path="/admin/users/:id" element={<ProtectedRoute allowedRoles={['ADMIN']}><AnimatedRoute element={<AdminUserDetailPage />} /></ProtectedRoute>} />
          <Route path="/admin/orders" element={<ProtectedRoute allowedRoles={['ADMIN']}><AnimatedRoute element={<AdminOrdersPage />} /></ProtectedRoute>} />
          <Route path="/admin/orders/:id" element={<ProtectedRoute allowedRoles={['ADMIN']}><AnimatedRoute element={<AdminOrderDetailPage />} /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['ADMIN']}><AnimatedRoute element={<AdminAnalyticsPage />} /></ProtectedRoute>} />
          <Route path="/admin/categories" element={<ProtectedRoute allowedRoles={['ADMIN']}><AnimatedRoute element={<AdminCategoriesPage />} /></ProtectedRoute>} />
          <Route path="/admin/reviews" element={<ProtectedRoute allowedRoles={['ADMIN']}><AnimatedRoute element={<AdminReviewsPage />} /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['ADMIN']}><AnimatedRoute element={<AdminSettingsPage />} /></ProtectedRoute>} />
          <Route path="/admin/seller-settlements" element={<ProtectedRoute allowedRoles={['ADMIN']}><AnimatedRoute element={<SellerSettlements />} /></ProtectedRoute>} />
          <Route path="/admin/seller-settlements/:id" element={<ProtectedRoute allowedRoles={['ADMIN']}><AnimatedRoute element={<SellerSettlementDetail />} /></ProtectedRoute>} />
          <Route path="/admin/platform-settings" element={<ProtectedRoute allowedRoles={['ADMIN']}><AnimatedRoute element={<PlatformSettings />} /></ProtectedRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<AnimatedRoute element={<NotFoundPage />} />} />
        </Routes>
      </AnimatePresence>
    </>
  )
}
