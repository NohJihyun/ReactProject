import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Stack, Typography, Checkbox, FormControlLabel,
    Box, Divider, IconButton, Alert, CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { useAuthStore } from "../../auth/authStore";
import { agreeTermsApi, logoutApi } from "../../api/authApi";
import { getErrorMessage } from "../../api/errorMessage";
import { TERMS_CONTENT, AGREEMENT_ITEMS } from "../../constants/termsConstants";

const INITIAL_AGREEMENTS = { terms: false, privacy: false, thirdParty: false, marketing: false };
const INITIAL_EXPANDED   = { terms: false, privacy: false, thirdParty: false, marketing: false };

/**
 * 소셜 로그인 신규 사용자 약관 동의 다이얼로그
 * - pendingToken: 백엔드에서 발급된 AccessToken (아직 AuthProvider에 저장 전)
 * - onSuccess: 동의 완료 후 콜백
 * - onClose: 취소 시 콜백
 */
export default function SocialTermsDialog({ open, pendingToken, onSuccess, onClose }) {
    const { loginWithToken } = useAuth();
    const [agreements, setAgreements] = useState(INITIAL_AGREEMENTS);
    const [expanded, setExpanded]     = useState(INITIAL_EXPANDED);
    const [loading, setLoading]       = useState(false);
    const [error, setError]           = useState("");

    const allChecked  = AGREEMENT_ITEMS.every((i) => agreements[i.key]);
    const someChecked = AGREEMENT_ITEMS.some((i) => agreements[i.key]);

    const handleAllAgree = (checked) => {
        setAgreements({ terms: checked, privacy: checked, thirdParty: checked, marketing: checked });
    };

    const handleAgree = async () => {
        if (!agreements.terms || !agreements.privacy || !agreements.thirdParty) {
            setError("필수 약관에 모두 동의해주세요.");
            return;
        }
        setError("");
        setLoading(true);
        try {
            // pendingToken을 Zustand에 임시 세팅 → API 인터셉터가 Authorization 헤더 추가
            useAuthStore.getState().setAccessToken(pendingToken);
            await agreeTermsApi({
                agreedTerms: true,
                agreedPrivacy: true,
                agreedThirdParty: true,
                marketingAgreed: agreements.marketing,
            });
            // 약관 동의 완료 → 정식 로그인 처리
            await loginWithToken(pendingToken);
            localStorage.removeItem("oauth_pending_token");
            handleReset();
            onSuccess();
        } catch (e) {
            useAuthStore.getState().setAccessToken(null);
            setError(getErrorMessage(e));
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        // RT 쿠키 정리 (로그아웃 처리)
        try { await logoutApi(); } catch (_) {}
        localStorage.removeItem("oauth_pending_token");
        handleReset();
        onClose();
    };

    const handleReset = () => {
        setAgreements(INITIAL_AGREEMENTS);
        setExpanded(INITIAL_EXPANDED);
        setError("");
    };

    return (
        <Dialog open={open} onClose={handleCancel} fullWidth maxWidth="xs"
            slotProps={{ paper: { translate: "no" } }}
        >
            <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
                <Typography fontWeight={800} sx={{ flex: 1 }}>서비스 이용 약관 동의</Typography>
                <IconButton onClick={handleCancel}><CloseIcon /></IconButton>
            </DialogTitle>

            <DialogContent>
                <Box className="notranslate" translate="no">
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            간편 로그인을 완료하려면 서비스 이용 약관에 동의해주세요.
                        </Typography>

                        {error && <Alert severity="error">{error}</Alert>}

                        <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, overflow: "hidden" }}>
                            {/* 전체 동의 */}
                            <Box sx={{ px: 1.5, py: 1, bgcolor: "grey.50" }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={allChecked}
                                            indeterminate={someChecked && !allChecked}
                                            onChange={(e) => handleAllAgree(e.target.checked)}
                                        />
                                    }
                                    label={<Typography fontWeight={700} variant="body2">전체 동의</Typography>}
                                />
                            </Box>

                            <Divider />

                            {/* 각 약관 항목 */}
                            {AGREEMENT_ITEMS.map((item, idx) => (
                                <Box key={item.key}>
                                    <Box sx={{ display: "flex", alignItems: "center", px: 1, py: 0.5 }}>
                                        <Checkbox
                                            size="small"
                                            checked={agreements[item.key]}
                                            onChange={(e) =>
                                                setAgreements((prev) => ({ ...prev, [item.key]: e.target.checked }))
                                            }
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

            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button
                    variant="outlined" fullWidth size="large" onClick={handleCancel}
                    disabled={loading}
                    sx={{ fontWeight: 600, py: 1.4 }}
                >
                    취소
                </Button>
                <Button
                    variant="contained" fullWidth size="large" onClick={handleAgree}
                    disabled={loading}
                    sx={{ backgroundColor: "#7CB342", fontWeight: 600, py: 1.4, "&:hover": { backgroundColor: "#689F38" } }}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : "동의하고 시작하기"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
