import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Stack,
    IconButton,
    Typography,
    Checkbox,
    FormControlLabel,
    Box
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";

export default function SignUpDialog({ open, onClose }) {

    const [form, setForm] = useState({
        name: "",
        loginId: "",
        password: "",
        passwordConfirm: "",
        email: "",
        phone: "",
        birth: "",
        agree: false
    });

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;

        setForm({
            ...form,
            [name]: type === "checkbox" ? checked : value
        });
    };

    const handleSubmit = () => {
        console.log("회원가입 데이터", form);
        // 나중에 API 연결
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">

            {/* 타이틀 */}
            <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
                <Typography fontWeight={800} sx={{ flex: 1 }}>
                    회원가입
                </Typography>

                <IconButton onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            {/* 폼 영역 */}
            <DialogContent>

                <Box className="notranslate">

                    <Stack spacing={2} sx={{ mt: 1 }}>

                        <TextField
                            label="이름"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            fullWidth
                        />

                        <TextField
                            label="생년월일"
                            type="date"
                            name="birth"
                            value={form.birth}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                        />

                        <TextField
                            label="아이디"
                            name="loginId"
                            value={form.loginId}
                            onChange={handleChange}
                            fullWidth
                        />

                        <TextField
                            label="비밀번호"
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            fullWidth
                        />

                        <TextField
                            label="비밀번호 확인"
                            name="passwordConfirm"
                            type="password"
                            value={form.passwordConfirm}
                            onChange={handleChange}
                            fullWidth
                        />

                        <TextField
                            label="이메일"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            fullWidth
                        />

                        <TextField
                            label="휴대폰 번호"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            fullWidth
                        />

                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="agree"
                                    checked={form.agree}
                                    onChange={handleChange}
                                />
                            }
                            label="이용약관 및 개인정보 처리방침에 동의합니다."
                        />

                    </Stack>

                </Box>

            </DialogContent>

            {/* 하단 버튼 */}
            <DialogActions sx={{ p: 2 }}>

                <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={handleSubmit}
                    sx={{
                        backgroundColor: "#7CB342",
                        fontWeight: 600,
                        py: 1.5,
                        "&:hover": {
                            backgroundColor: "#689F38"
                        }
                    }}
                >
                    회원가입
                </Button>

            </DialogActions>

        </Dialog>
    );
}