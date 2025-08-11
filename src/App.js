// App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from './layout/AppLayout';
import CategoryPage from './pages/admin/CategoryPage';

// 추가된 import (/login, /client, /forbidden, /oauth/callback 페이지 추가-로그인)
// pages
import LoginPage from "./pages/LoginPage";
import Forbidden from "./pages/Forbidden";
import OAuthCallback from "./pages/OAuthCallback";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ClientHome from "./pages/client/ClientHome";
import OtherClientPage from "./pages/client/OtherClientPage";

// 인증
import AuthProvider from "./auth/AuthProvider";
import ProtectedRoute from "./auth/ProtectedRoute";

export default function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* 공개 라우트 */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/forbidden" element={<Forbidden />} />
                    <Route path="/oauth/callback" element={<OAuthCallback />} />

                    {/* 클라이언트 영역: USER, ADMIN 접근 */}
                    <Route
                        path="/client"
                        element={
                            <ProtectedRoute roles={["USER", "ADMIN"]}>
                                <ClientHome />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/client/other"
                        element={
                            <ProtectedRoute roles={["USER", "ADMIN"]}>
                                <OtherClientPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* 관리자 영역: ADMIN만 */}
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute roles={["ADMIN"]}>
                                <AppLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<AdminDashboard />} />
                        <Route path="categories" element={<CategoryPage />} />
                    </Route>

                    {/* 기본 */}
                    <Route path="/" element={<LoginPage />} />
                    <Route path="*" element={<LoginPage />} />
                </Routes>
            </AuthProvider>
        </Router>

        /*<Router>
          <AuthProvider>
            <Routes>
                {/!* 로그인/클라이언트/포비든/OAuth *!/}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/client" element={<ClientHome />} />
                <Route path="/forbidden" element={<Forbidden />} />
                <Route path="/oauth/callback" element={<OAuthCallback />} />

                {/!* Admin 라우트 *!/}
                <Route path="/admin" element={<AppLayout />}>
                    <Route path="categories" element={<CategoryPage />} />
                    {/!*<Route index element={<Dashboard />} />  /admin *!/}
                    {/!*<Route path="products" element={<ProductPage />} />*!/}
                    {/!*<Route path="orders" element={<OrderPage />} />*!/}
                </Route>

                {/!* 기본 라우트 *!/}
                <Route path="/" element={<LoginPage />} />
                <Route path="*" element={<LoginPage />} />
                {/!*<Route path="/" element={<Home />} />*!/}
            </Routes>
          </AuthProvider>
        </Router>*/
    );
}
