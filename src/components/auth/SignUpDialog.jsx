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
    Box,
    InputAdornment,
    Alert,
    CircularProgress,
    Chip
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useState } from "react";
import { sendEmailCodeApi, verifyEmailCodeApi, signUpApi } from "../../api/authApi";

const INITIAL_FORM = {
    name: "",
    loginId: "",
    password: "",
    passwordConfirm: "",
    email: "",
    emailCode: "",
    phone: "",
    birth: "",
    agree: false,
};

export default function SignUpDialog({ open, onClose }) {
    const [form, setForm] = useState(INITIAL_FORM);

    // 이메일 인증 상태
    const [codeSent, setCodeSent] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);

    // 로딩/에러 상태
    const [sendingCode, setSendingCode] = useState(false);
    const [verifyingCode, setVerifyingCode] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        // 이메일 변경 시 인증 상태 초기화
        if (name === "email") {
            setCodeSent(false);
            setEmailVerified(false);
        }
    };

    /** 만 14세 이상 클라이언트 사전 검사 */
    const isAgeValid = () => {
        if (!form.birth) return false;
        const birth = new Date(form.birth);
        const today = new Date();
        const age = today.getFullYear() - birth.getFullYear()
            - (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0);
        return age >= 14;
    };

    /** 인증코드 발송 */
    const handleSendCode = async () => {
        setError("");
        if (!form.email) {
            setError("이메일을 입력해주세요.");
            return;
        }
        setSendingCode(true);
        try {
            await sendEmailCodeApi(form.email);
            setCodeSent(true);
            setEmailVerified(false);
            setForm((prev) => ({ ...prev, emailCode: "" }));
        } catch (e) {
            const msg = e.response?.data?.message || "인증코드 발송에 실패했습니다.";
            setError(msg);
        } finally {
            setSendingCode(false);
        }
    };

    /** 인증코드 확인 */
    const handleVerifyCode = async () => {
        setError("");
        if (!form.emailCode) {
            setError("인증코드를 입력해주세요.");
            return;
        }
        setVerifyingCode(true);
        try {
            await verifyEmailCodeApi(form.email, form.emailCode);
            setEmailVerified(true);
        } catch (e) {
            const msg = e.response?.data?.message || "인증코드가 올바르지 않거나 만료되었습니다.";
            setError(msg);
        } finally {
            setVerifyingCode(false);
        }
    };

    /** 회원가입 제출 */
    const handleSubmit = async () => {
        setError("");
        setSuccess("");

        if (!form.name || !form.loginId || !form.password || !form.email || !form.birth) {
            setError("필수 항목을 모두 입력해주세요.");
            return;
        }
        if (!isAgeValid()) {
            setError("만 14세 이상만 가입하실 수 있습니다.");
            return;
        }
        if (form.password !== form.passwordConfirm) {
            setError("비밀번호가 일치하지 않습니다.");
            return;
        }
        if (!emailVerified) {
            setError("이메일 인증을 완료해주세요.");
            return;
        }
        if (!form.agree) {
            setError("이용약관 및 개인정보 처리방침에 동의해주세요.");
            return;
        }

        setSubmitting(true);
        try {
            await signUpApi({
                name: form.name,
                loginId: form.loginId,
                password: form.password,
                email: form.email,
                phone: form.phone,
                birth: form.birth,
            });
            setSuccess("회원가입이 완료되었습니다! 로그인해주세요.");
            setForm(INITIAL_FORM);
            setCodeSent(false);
            setEmailVerified(false);
        } catch (e) {
            const msg = e.response?.data?.message || "회원가입에 실패했습니다.";
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setForm(INITIAL_FORM);
        setCodeSent(false);
        setEmailVerified(false);
        setError("");
        setSuccess("");
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">

            <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
                <Typography fontWeight={800} sx={{ flex: 1 }}>
                    회원가입
                </Typography>
                <IconButton onClick={handleClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                <Box className="notranslate">
                    <Stack spacing={2} sx={{ mt: 1 }}>

                        {/* 에러/성공 메시지 */}
                        {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
                        {success && <Alert severity="success">{success}</Alert>}

                        {/* 이름 */}
                        <TextField
                            label="이름 *"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            fullWidth
                            disabled={!!success}
                        />

                        {/* 생년월일 - 만 14세 이상 안내 */}
                        <TextField
                            label="생년월일 *"
                            type="date"
                            name="birth"
                            value={form.birth}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            disabled={!!success}
                            helperText="만 14세 이상만 가입 가능합니다."
                            error={form.birth !== "" && !isAgeValid()}
                        />

                        {/* 아이디 */}
                        <TextField
                            label="아이디 *"
                            name="loginId"
                            value={form.loginId}
                            onChange={handleChange}
                            fullWidth
                            disabled={!!success}
                        />

                        {/* 비밀번호 */}
                        <TextField
                            label="비밀번호 *"
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            fullWidth
                            disabled={!!success}
                        />

                        {/* 비밀번호 확인 */}
                        <TextField
                            label="비밀번호 확인 *"
                            name="passwordConfirm"
                            type="password"
                            value={form.passwordConfirm}
                            onChange={handleChange}
                            fullWidth
                            disabled={!!success}
                            error={form.passwordConfirm !== "" && form.password !== form.passwordConfirm}
                            helperText={
                                form.passwordConfirm !== "" && form.password !== form.passwordConfirm
                                    ? "비밀번호가 일치하지 않습니다."
                                    : ""
                            }
                        />

                        {/* 이메일 + 인증코드 발송 버튼 */}
                        <TextField
                            label="이메일 *"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            fullWidth
                            disabled={emailVerified || !!success}
                            InputProps={{
                                endAdornment: emailVerified ? (
                                    <InputAdornment position="end">
                                        <Chip
                                            icon={<CheckCircleIcon />}
                                            label="인증완료"
                                            color="success"
                                            size="small"
                                        />
                                    </InputAdornment>
                                ) : (
                                    <InputAdornment position="end">
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={handleSendCode}
                                            disabled={sendingCode || !form.email || !!success}
                                            sx={{ whiteSpace: "nowrap", minWidth: 80 }}
                                        >
                                            {sendingCode
                                                ? <CircularProgress size={16} />
                                                : codeSent ? "재발송" : "인증코드 발송"
                                            }
                                        </Button>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {/* 인증코드 입력 - 발송 후 표시 */}
                        {codeSent && !emailVerified && (
                            <TextField
                                label="인증코드 입력 *"
                                name="emailCode"
                                value={form.emailCode}
                                onChange={handleChange}
                                fullWidth
                                disabled={!!success}
                                placeholder="6자리 숫자 입력"
                                helperText="이메일로 발송된 6자리 인증코드를 입력해주세요. (5분 유효)"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <Button
                                                size="small"
                                                variant="contained"
                                                onClick={handleVerifyCode}
                                                disabled={verifyingCode || !form.emailCode || !!success}
                                                sx={{
                                                    whiteSpace: "nowrap",
                                                    minWidth: 80,
                                                    backgroundColor: "#7CB342",
                                                    "&:hover": { backgroundColor: "#689F38" }
                                                }}
                                            >
                                                {verifyingCode ? <CircularProgress size={16} color="inherit" /> : "인증 확인"}
                                            </Button>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        )}

                        {/* 휴대폰 번호 */}
                        <TextField
                            label="휴대폰 번호"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            fullWidth
                            disabled={!!success}
                            placeholder="010-0000-0000"
                        />

                        {/* 이용약관 동의 */}
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="agree"
                                    checked={form.agree}
                                    onChange={handleChange}
                                    disabled={!!success}
                                />
                            }
                            label="이용약관 및 개인정보 처리방침에 동의합니다. *"
                        />

                    </Stack>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                {success ? (
                    <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        onClick={handleClose}
                        sx={{ backgroundColor: "#7CB342", fontWeight: 600, py: 1.5, "&:hover": { backgroundColor: "#689F38" } }}
                    >
                        확인
                    </Button>
                ) : (
                    <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        onClick={handleSubmit}
                        disabled={submitting}
                        sx={{ backgroundColor: "#7CB342", fontWeight: 600, py: 1.5, "&:hover": { backgroundColor: "#689F38" } }}
                    >
                        {submitting ? <CircularProgress size={24} color="inherit" /> : "회원가입"}
                    </Button>
                )}
            </DialogActions>

        </Dialog>
    );
}
