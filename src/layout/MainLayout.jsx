// src/layout/MainLayout.jsx
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function MainLayout() {
    return (
        <Box
            display="flex"
            flexDirection="column"
            minHeight="100vh"
        >
            <Header />
            <Box component="main" flex={1}>
                <Outlet />
            </Box>
            <Footer />
        </Box>
    );
}
