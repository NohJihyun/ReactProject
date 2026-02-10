import { Box, Typography } from "@mui/material";
import { useAuth } from "../auth/AuthProvider";

const Footer = () => {
    return (
        <Box
            component="footer"
            sx={{
                textAlign: "center",
                py: 2,
                backgroundColor: "#f5f5f5",
            }}
        >
            <Typography variant="body2">
                © 2026 Main Service. All rights reserved.
            </Typography>
        </Box>
    );
};

export default Footer;