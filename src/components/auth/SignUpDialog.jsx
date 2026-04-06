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
    Chip,
    Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useState } from "react";
import { sendEmailCodeApi, verifyEmailCodeApi, signUpApi } from "../../api/authApi";
import { getErrorMessage } from "../../api/errorMessage";

// ─── 약관 내용 ────────────────────────────────────────────────────────────────
const TERMS_CONTENT = {
    terms: `로이투어 서비스 이용약관

로이투어(이하 "회사")는 여행 상담 및 여행상품 예약 관련 서비스를 제공합니다.
회원은 본 약관에 동의함으로써 회사가 제공하는 서비스를 이용할 수 있습니다.

제4조 (예약 및 취소)

여행상품 예약, 취소, 환불 조건은 해당 여행상품 또는 여행사 규정을 따릅니다.

제5조 (책임의 제한)

회사는 다음 사항에 대해 책임을 지지 않습니다.

- 여행 일정 변경 또는 취소
- 항공편 취소, 천재지변 등 불가항력 상황
- 여행사와 회원 간 계약 관련 분쟁
- 회원의 개인 사정으로 인한 취소

제6조 (약관의 변경)

회사는 필요한 경우 약관을 변경할 수 있으며, 변경 시 공지합니다.`,

    privacy: `개인정보 수집 및 이용 동의

회사는 회원가입 및 여행 상담 서비스 제공을 위해 아래와 같이 개인정보를 수집합니다.

[수집 항목]
- 이름
- 이메일
- 휴대폰 번호
- 생년월일

[수집 목적]
- 회원 관리
- 여행 상담 및 예약 진행
- 고객 문의 대응

[보유 기간]
회원 탈퇴 시까지

이용자는 개인정보 수집 및 이용 동의를 거부할 권리가 있으며,
동의를 거부할 경우 회원가입이 제한될 수 있습니다.`,

    thirdParty: `개인정보 제3자 제공 동의

회사는 여행 상담 및 예약 진행을 위해 개인정보를 제3자에게 제공할 수 있습니다.

[제공받는 자]
- 여행사
- 항공사
- 호텔
- 현지 투어 업체

[제공 항목]
- 이름
- 연락처
- 이메일

[제공 목적]
여행 예약 및 상담 진행

[보유 기간]
예약 및 서비스 제공 완료 시까지

이용자는 개인정보 제3자 제공에 대한 동의를 거부할 권리가 있으며,
동의를 거부할 경우 여행 예약 서비스 이용이 제한될 수 있습니다.`,

    marketing: `마케팅 정보 수신 동의

회사는 이벤트, 할인, 여행상품 안내 등의 정보를 이메일 또는 문자로 발송할 수 있습니다.
회원은 마케팅 정보 수신에 동의하지 않아도 서비스를 이용할 수 있습니다.`,
};

const AGREEMENT_ITEMS = [
    { key: "terms",      label: "이용약관 동의",           required: true  },
    { key: "privacy",    label: "개인정보 수집 및 이용 동의", required: true  },
    { key: "thirdParty", label: "개인정보 제3자 제공 동의",  required: true  },
    { key: "marketing",  label: "마케팅 정보 수신 동의",     required: false },
];

// ─── 초기값 ───────────────────────────────────────────────────────────────────
const INITIAL_FORM = {
    name: "",
    loginId: "",
    password: "",
    passwordConfirm: "",
    email: "",
    emailCode: "",
    phone: "",
    birth: "",
};

const INITIAL_AGREEMENTS = { terms: false, privacy: false, thirdParty: false, marketing: false };
const INITIAL_EXPANDED   = { terms: false, privacy: false, thirdParty: false, marketing: false };

// ─── 컴포넌트 ─────────────────────────────────────────────────────────────────
export default function SignUpDialog({ open, onClose }) {
    const [form, setForm]               = useState(INITIAL_FORM);
    const [agreements, setAgreements]   = useState(INITIAL_AGREEMENTS);
    const [expanded, setExpanded]       = useState(INITIAL_EXPANDED);

    // 이메일 인증 상태
    const [codeSent, setCodeSent]           = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);

    // 로딩/에러 상태
    const [sendingCode, setSendingCode]   = useState(false);
    const [verifyingCode, setVerifyingCode] = useState(false);
    const [submitting, setSubmitting]     = useState(false);
    const [error, setError]               = useState("");
    const [success, setSuccess]           = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (name === "email") {
            setCodeSent(false);
            setEmailVerified(false);
        }
    };

    /** 전체 동의 */
    const handleAllAgree = (checked) => {
        setAgreements({ terms: checked, privacy: checked, thirdParty: checked, marketing: checked });
    };

    const allChecked = agreements.terms && agreements.privacy && agreements.thirdParty && agreements.marketing;
    const someChecked = agreements.terms || agreements.privacy || agreements.thirdParty || agreements.marketing;

    /** 이메일 형식 검사 */
    const isEmailFormat = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

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
        if (!form.email) { setError("이메일을 입력해주세요."); return; }
        setSendingCode(true);
        try {
            await sendEmailCodeApi(form.email);
            setCodeSent(true);
            setEmailVerified(false);
            setForm((prev) => ({ ...prev, emailCode: "" }));
        } catch (e) {
            setError(getErrorMessage(e));
        } finally {
            setSendingCode(false);
        }
    };

    /** 인증코드 확인 */
    const handleVerifyCode = async () => {
        setError("");
        if (!form.emailCode) { setError("인증코드를 입력해주세요."); return; }
        setVerifyingCode(true);
        try {
            await verifyEmailCodeApi(form.email, form.emailCode);
            setEmailVerified(true);
        } catch (e) {
            setError(getErrorMessage(e));
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
        if (!isEmailFormat(form.loginId)) {
            setError("아이디는 이메일 형식으로 입력해주세요. (예: example@email.com)");
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
        if (!agreements.terms || !agreements.privacy || !agreements.thirdParty) {
            setError("필수 약관에 모두 동의해주세요.");
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
                agreedTerms: agreements.terms,
                agreedPrivacy: agreements.privacy,
                agreedThirdParty: agreements.thirdParty,
                marketingAgreed: agreements.marketing,
            });
            setSuccess("회원가입이 완료되었습니다! 로그인해주세요.");
            setForm(INITIAL_FORM);
            setAgreements(INITIAL_AGREEMENTS);
            setCodeSent(false);
            setEmailVerified(false);
        } catch (e) {
            setError(getErrorMessage(e));
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setForm(INITIAL_FORM);
        setAgreements(INITIAL_AGREEMENTS);
        setExpanded(INITIAL_EXPANDED);
        setCodeSent(false);
        setEmailVerified(false);
        setError("");
        setSuccess("");
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs"
            slotProps={{ paper: { translate: "no" } }}
        >
            <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
                <Typography fontWeight={800} sx={{ flex: 1 }}>회원가입</Typography>
                <IconButton onClick={handleClose}><CloseIcon /></IconButton>
            </DialogTitle>

            <DialogContent>
                <Box className="notranslate" translate="no">
                    <Stack spacing={2} sx={{ mt: 1 }}>

                        {/* 에러/성공 메시지 */}
                        <Alert severity="error" onClose={() => setError("")} sx={{ display: error ? "flex" : "none" }}>{error || " "}</Alert>
                        <Alert severity="success" sx={{ display: success ? "flex" : "none" }}>{success || " "}</Alert>

                        {/* 이름 */}
                        <TextField
                            label="이름 *" name="name" value={form.name}
                            onChange={handleChange} fullWidth disabled={!!success}
                        />

                        {/* 생년월일 */}
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
                            FormHelperTextProps={{
                                style: { color: 'red' }
                            }}
                        />

                        {/* 아이디 */}
                        <TextField
                            label="아이디 *" name="loginId" value={form.loginId}
                            onChange={handleChange} fullWidth disabled={!!success}
                            placeholder="example@email.com"
                            error={form.loginId !== "" && !isEmailFormat(form.loginId)}
                            helperText={
                                form.loginId !== "" && !isEmailFormat(form.loginId)
                                    ? "아이디는 이메일 형식으로 입력해주세요." : ""
                            }
                        />

                        {/* 비밀번호 */}
                        <TextField
                            label="비밀번호 *" name="password" type="password" value={form.password}
                            onChange={handleChange} fullWidth disabled={!!success}
                        />

                        {/* 비밀번호 확인 */}
                        <TextField
                            label="비밀번호 확인 *" name="passwordConfirm" type="password"
                            value={form.passwordConfirm} onChange={handleChange} fullWidth disabled={!!success}
                            error={form.passwordConfirm !== "" && form.password !== form.passwordConfirm}
                            helperText={
                                form.passwordConfirm !== "" && form.password !== form.passwordConfirm
                                    ? "비밀번호가 일치하지 않습니다." : ""
                            }
                        />

                        {/* 이메일 + 인증코드 발송 */}
                        <TextField
                            label="이메일 *" name="email" value={form.email}
                            onChange={handleChange} fullWidth disabled={emailVerified || !!success}
                            InputProps={{
                                endAdornment: emailVerified ? (
                                    <InputAdornment position="end">
                                        <Chip icon={<CheckCircleIcon />} label="인증완료" color="success" size="small" />
                                    </InputAdornment>
                                ) : (
                                    <InputAdornment position="end">
                                        <Button
                                            size="small" variant="outlined" onClick={handleSendCode}
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

                        {/* 인증코드 입력 */}
                        <TextField
                            sx={{ display: codeSent && !emailVerified ? "flex" : "none" }}
                            label="인증코드 입력 *" name="emailCode" value={form.emailCode}
                            onChange={handleChange} fullWidth disabled={!!success}
                            placeholder="6자리 숫자 입력"
                            helperText="이메일로 발송된 6자리 인증코드를 입력해주세요. (5분 유효)"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Button
                                            size="small" variant="contained" onClick={handleVerifyCode}
                                            disabled={verifyingCode || !form.emailCode || !!success}
                                            sx={{ whiteSpace: "nowrap", minWidth: 80, backgroundColor: "#7CB342", "&:hover": { backgroundColor: "#689F38" } }}
                                        >
                                            {verifyingCode ? <CircularProgress size={16} color="inherit" /> : "인증 확인"}
                                        </Button>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {/* 휴대폰 번호 */}
                        <TextField
                            label="휴대폰 번호" name="phone" value={form.phone}
                            onChange={handleChange} fullWidth disabled={!!success}
                            placeholder="010-0000-0000"
                        />

                        {/* ── 약관 동의 ── */}
                        <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, overflow: "hidden" }}>

                            {/* 전체 동의 */}
                            <Box sx={{ px: 1.5, py: 1, bgcolor: "grey.50" }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={allChecked}
                                            indeterminate={someChecked && !allChecked}
                                            onChange={(e) => handleAllAgree(e.target.checked)}
                                            disabled={!!success}
                                        />
                                    }
                                    label={<Typography fontWeight={700} variant="body2">전체 동의</Typography>}
                                />
                            </Box>

                            <Divider />

                            {/* 각 약관 항목 */}
                            {AGREEMENT_ITEMS.map((item, idx) => (
                                <Box key={item.key}>
                                    {/* 체크박스 행 */}
                                    <Box sx={{ display: "flex", alignItems: "center", px: 1, py: 0.5 }}>
                                        <Checkbox
                                            size="small"
                                            checked={agreements[item.key]}
                                            onChange={(e) =>
                                                setAgreements((prev) => ({ ...prev, [item.key]: e.target.checked }))
                                            }
                                            disabled={!!success}
                                        />
                                        <Typography variant="body2" sx={{ flex: 1 }}>
                                            <Typography
                                                component="span" variant="body2" fontWeight={600}
                                                color={item.required ? "error" : "text.secondary"}
                                                sx={{ mr: 0.5 }}
                                            >
                                                [{item.required ? "필수" : "선택"}]
                                            </Typography>
                                            {item.label}
                                        </Typography>
                                        <IconButton
                                            size="small"
                                            onClick={() =>
                                                setExpanded((prev) => ({ ...prev, [item.key]: !prev[item.key] }))
                                            }
                                        >
                                            {expanded[item.key] ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                                        </IconButton>
                                    </Box>

                                    {/* 약관 내용 (펼침) */}
                                    {expanded[item.key] && (
                                        <Box sx={{ mx: 2, mb: 1.5, p: 1.5, bgcolor: "grey.50", borderRadius: 1, maxHeight: 160, overflowY: "auto" }}>
                                            <Typography
                                                variant="body2"
                                                sx={{ whiteSpace: "pre-wrap", color: "text.secondary", fontSize: "0.72rem", lineHeight: 1.6 }}
                                            >
                                                {TERMS_CONTENT[item.key]}
                                            </Typography>
                                        </Box>
                                    )}

                                    {idx < AGREEMENT_ITEMS.length - 1 && <Divider />}
                                </Box>
                            ))}
                        </Box>

                    </Stack>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button
                    variant="contained" fullWidth size="large" onClick={handleClose}
                    sx={{ display: success ? "flex" : "none", backgroundColor: "#7CB342", fontWeight: 600, py: 1.5, "&:hover": { backgroundColor: "#689F38" } }}
                >
                    확인
                </Button>
                <Button
                    variant="contained" fullWidth size="large" onClick={handleSubmit}
                    disabled={submitting}
                    sx={{ display: success ? "none" : "flex", backgroundColor: "#7CB342", fontWeight: 600, py: 1.5, "&:hover": { backgroundColor: "#689F38" } }}
                >
                    {submitting ? <CircularProgress size={24} color="inherit" /> : "회원가입"}
                </Button>
            </DialogActions>

        </Dialog>
    );
}
