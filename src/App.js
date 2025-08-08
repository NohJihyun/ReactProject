// App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from './layout/AppLayout';
import CategoryPage from './pages/admin/CategoryPage';
// 추가된 import (경로 확인!)
//import Dashboard from './pages/admin/Dashboard';
//import ProductPage from './pages/admin/ProductPage';
//import OrderPage from './pages/admin/OrderPage';
//import Home from './pages/Home';

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/admin" element={<AppLayout />}>
                    {/*<Route index element={<Dashboard />} />  /admin */}
                    <Route path="categories" element={<CategoryPage />} />
                    {/*<Route path="products" element={<ProductPage />} />*/}
                    {/*<Route path="orders" element={<OrderPage />} />*/}
                </Route>
                {/*<Route path="/" element={<Home />} />*/}
            </Routes>
        </Router>
    );
}
