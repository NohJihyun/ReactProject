// App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import MainLayout from "./layout/MainLayout";
import AdminLayout from './layout/AdminLayout';

// pages
import Forbidden from "./pages/Forbidden";
import OAuthCallback from "./pages/OAuthCallback";
import PasswordResetPage from "./pages/PasswordResetPage";

import ClientHome from "./pages/client/ClientHome";
import AboutPage from "./pages/client/AboutPage";
import TermsPage from "./pages/client/TermsPage";
import PrivacyPage from "./pages/client/PrivacyPage";
import TravelTermsPage from "./pages/client/TravelTermsPage";
import OtherClientPage from "./pages/client/OtherClientPage";
import TourListPage from "./pages/client/TourListPage";
import TourDetailPage from "./pages/client/TourDetailPage";
import SearchResultsPage from "./pages/client/SearchResultsPage";

import AdminDashboard from "./pages/admin/AdminDashboard";
import CategoryPage from './pages/admin/CategoryPage';
import ProductPage from './pages/admin/ProductPage';
import ProductFormPage from './pages/admin/ProductFormPage';
import AdminReviewPage from './pages/admin/AdminReviewPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminBookingPage from './pages/admin/AdminBookingPage';
import MyReviewPage from './pages/client/MyReviewPage';
import MyBookingPage from './pages/client/MyBookingPage';
import PaymentPage from './pages/client/PaymentPage';
import InquiryPage from './pages/client/InquiryPage';
import AdminInquiryPage from './pages/admin/AdminInquiryPage';

// auth
import AuthProvider from "./auth/AuthProvider";
import ProtectedRoute from "./auth/ProtectedRoute";

export default function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>

                    {/* 메인 / 공용 (비인증) */}
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<ClientHome />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/terms" element={<TermsPage />} />
                        <Route path="/privacy" element={<PrivacyPage />} />
                        <Route path="/travel-terms" element={<TravelTermsPage />} />
                        <Route path="/tour/:category" element={<TourListPage />} />
                        <Route path="/tour/:category/:id" element={<TourDetailPage />} />
                        <Route path="/search" element={<SearchResultsPage />} />
                        <Route path="/inquiry" element={<InquiryPage />} />
                        <Route path="/oauth/callback" element={<OAuthCallback />} />
                        <Route path="/password-reset" element={<PasswordResetPage />} />
                    </Route>

                    {/* 클라이언트 영역 (USER, ADMIN) */}
                    <Route
                        element={<ProtectedRoute roles={["USER", "ADMIN"]} />}
                    >
                        <Route path="/client" element={<ClientHome />} />
                        <Route path="/client/other" element={<OtherClientPage />} />
                        <Route path="/client/reviews" element={<MyReviewPage />} />
                        <Route path="/client/bookings" element={<MyBookingPage />} />
                    </Route>

                    {/*  관리자 영역 (ADMIN) */}
                    <Route
                        element={<ProtectedRoute roles={["ADMIN"]} />}
                    >
                        <Route element={<AdminLayout />}>
                            <Route path="/admin" element={<AdminDashboard />} />
                            <Route path="/admin/categories" element={<CategoryPage />} />
                            <Route path="/admin/products" element={<ProductPage />} />
                            <Route path="/admin/products/new" element={<ProductFormPage />} />
                            <Route path="/admin/products/:id" element={<ProductFormPage />} />
                            <Route path="/admin/users" element={<AdminUsersPage />} />
                            <Route path="/admin/bookings" element={<AdminBookingPage />} />
                            <Route path="/admin/review" element={<AdminReviewPage />} />
                            <Route path="/admin/inquiries" element={<AdminInquiryPage />} />
                        </Route>
                    </Route>

                    {/* 결제 페이지 (새 창) */}
                    <Route path="/payment/:bookingNumber" element={<PaymentPage />} />

                    {/* 권한 없음 */}
                    <Route path="/forbidden" element={<Forbidden />} />

                </Routes>
            </AuthProvider>
        </Router>
    );
}
