// src/layout/MainLayout.jsx
import { Box, Fab, Zoom } from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function MainLayout() {
    const [showTop, setShowTop] = useState(false);

    useEffect(() => {
        const onScroll = () => setShowTop(window.scrollY > 300);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <Box display="flex" flexDirection="column" minHeight="100vh">
            <Header />
            <Box component="main" flex={1}>
                <Outlet />
            </Box>
            <Footer />

            {/* 스크롤 상단 버튼 */}
            <Zoom in={showTop}>
                <Fab
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    size="medium"
                    sx={{
                        position: "fixed",
                        bottom: 32,
                        right: 24,
                        bgcolor: "#000",
                        color: "#fff",
                        "&:hover": { bgcolor: "#333" },
                        zIndex: 1000,
                    }}
                >
                    <KeyboardArrowUpIcon />
                </Fab>
            </Zoom>
        </Box>
    );
}
