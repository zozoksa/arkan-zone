import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import AdminRoute from '@/components/admin/AdminRoute';
import Home from '@/pages/Home';

// Home is eager (landing page); everything else is code-split per route.
const Courses = lazy(() => import('@/pages/Courses'));
const CourseDetails = lazy(() => import('@/pages/CourseDetails'));
const Categories = lazy(() => import('@/pages/Categories'));
const About = lazy(() => import('@/pages/About'));
const InfoPage = lazy(() => import('@/pages/InfoPage'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const VerifyEmail = lazy(() => import('@/pages/VerifyEmail'));
const Certificate = lazy(() => import('@/pages/Certificate'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const MyCourses = lazy(() => import('@/pages/MyCourses'));
const Favorites = lazy(() => import('@/pages/Favorites'));
const Profile = lazy(() => import('@/pages/Profile'));
const Learn = lazy(() => import('@/pages/Learn'));
const Checkout = lazy(() => import('@/pages/Checkout'));
const CheckoutResult = lazy(() => import('@/pages/CheckoutResult'));
const MockPayment = lazy(() => import('@/pages/MockPayment'));
const AdminLayout = lazy(() => import('@/components/admin/AdminLayout'));
const AdminOverview = lazy(() => import('@/pages/admin/AdminOverview'));
const AdminOrders = lazy(() => import('@/pages/admin/AdminOrders'));
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'));
const AdminCoupons = lazy(() => import('@/pages/admin/AdminCoupons'));
const AdminMessages = lazy(() => import('@/pages/admin/AdminMessages'));
const NotFound = lazy(() => import('@/pages/NotFound'));

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="courses" element={<Courses />} />
        <Route path="courses/:id" element={<CourseDetails />} />
        <Route path="categories" element={<Categories />} />
        <Route path="about" element={<About />} />
        <Route path="faq" element={<InfoPage />} />
        <Route path="privacy" element={<InfoPage />} />
        <Route path="terms" element={<InfoPage />} />
        <Route path="refund-policy" element={<InfoPage />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="verify-email" element={<VerifyEmail />} />
        <Route path="certificates/:code" element={<Certificate />} />
        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="my-courses" element={<MyCourses />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="profile" element={<Profile />} />
          <Route path="learn/:id" element={<Learn />} />
          <Route path="checkout/result" element={<CheckoutResult />} />
          <Route path="checkout/mock/:orderId" element={<MockPayment />} />
          <Route path="checkout/:id" element={<Checkout />} />
        </Route>
        <Route path="admin" element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="messages" element={<AdminMessages />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
