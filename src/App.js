// App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import MainLayout from "./layout/MainLayout";
import AdminLayout from './layout/AdminLayout';

// pages
import LoginPage from "./pages/LoginPage";
import Forbidden from "./pages/Forbidden";
import OAuthCallback from "./pages/OAuthCallback";
import PasswordResetPage from "./pages/PasswordResetPage";

import ClientHome from "./pages/client/ClientHome";
import OtherClientPage from "./pages/client/OtherClientPage";
import TourListPage from "./pages/client/TourListPage";
import TourDetailPage from "./pages/client/TourDetailPage";

import AdminDashboard from "./pages/admin/AdminDashboard";
import CategoryPage from './pages/admin/CategoryPage';
import ProductPage from './pages/admin/ProductPage';
import ProductFormPage from './pages/admin/ProductFormPage';

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
                        <Route path="/tour/:category" element={<TourListPage />} />
                        <Route path="/tour/:category/:id" element={<TourDetailPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/oauth/callback" element={<OAuthCallback />} />
                        <Route path="/password-reset" element={<PasswordResetPage />} />
                    </Route>

                    {/* 클라이언트 영역 (USER, ADMIN) */}
                    <Route
                        element={<ProtectedRoute roles={["USER", "ADMIN"]} />}
                    >
                        <Route path="/client" element={<ClientHome />} />
                        <Route path="/client/other" element={<OtherClientPage />} />
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
                        </Route>
                    </Route>

                    {/* 권한 없음 */}
                    <Route path="/forbidden" element={<Forbidden />} />

                </Routes>
            </AuthProvider>
        </Router>
    );
}
