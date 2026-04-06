import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
    Box, Button, TextField, Typography, Stack, Alert, CircularProgress, Paper
} from "@mui/material";
import { resetPasswordApi } from "../api/authApi";
import { getErrorMessage } from "../api/errorMessage";

export default function PasswordResetPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [success, setSuccess] = useState(false);

    if (!token) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
                <Alert severity="error">유효하지 않은 링크입니다.</Alert>
            </Box>
        );
    }

    const handleReset = async () => {
        setErrorMsg("");
        if (newPassword.length < 8) {
            setErrorMsg("비밀번호는 8자 이상이어야 합니다.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setErrorMsg("비밀번호가 일치하지 않습니다.");
            return;
        }
        setLoading(true);
        try {
            await resetPasswordApi(token, newPassword);
            setSuccess(true);
        } catch (e) {
            setErrorMsg(getErrorMessage(e));
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
                <Paper sx={{ p: 4, maxWidth: 400, width: "100%", textAlign: "center" }}>
                    <Typography variant="h6" fontWeight={700} sx={{ color: "#7CB342", mb: 2 }}>
                        비밀번호가 변경되었습니다
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        새 비밀번호로 로그인해주세요.
                    </Typography>
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={() => navigate("/")}
                        sx={{ backgroundColor: "#7CB342", "&:hover": { backgroundColor: "#689F38" } }}
                    >
                        홈으로 이동
                    </Button>
                </Paper>
            </Box>
        );
    }

    return (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
            <Paper sx={{ p: 4, maxWidth: 400, width: "100%" }} translate="no">
                <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                    비밀번호 재설정
                </Typography>
                <Stack spacing={2}>
                    {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
                    <TextField
                        label="새 비밀번호"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        fullWidth
                        slotProps={{ htmlInput: { translate: "no", spellCheck: "false" } }}
                        helperText="8자 이상 입력해주세요"
                    />
                    <TextField
                        label="비밀번호 확인"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        fullWidth
                        slotProps={{ htmlInput: { translate: "no", spellCheck: "false" } }}
                        onKeyDown={(e) => e.key === "Enter" && handleReset()}
                    />
                    <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        disabled={loading}
                        onClick={handleReset}
                        sx={{
                            backgroundColor: "#7CB342",
                            fontWeight: 600,
                            py: 1.5,
                            "&:hover": { backgroundColor: "#689F38" }
                        }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : "비밀번호 변경"}
                    </Button>
                </Stack>
            </Paper>
        </Box>
    );
}
