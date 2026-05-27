import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Container, Typography, Paper, TextField, Button,
    Divider, Chip, Alert, CircularProgress, Snackbar,
    InputAdornment, IconButton,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import CakeIcon from '@mui/icons-material/Cake';
import LockIcon from '@mui/icons-material/Lock';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import BadgeIcon from '@mui/icons-material/Badge';
import EmailIcon from '@mui/icons-material/Email';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { getMyProfileApi, updateProfileApi, changePasswordApi } from '../../api/authApi';

const PROVIDER_LABEL = {
    LOCAL:  { label: '이메일 가입', color: '#1976d2', bg: '#e3f2fd' },
    KAKAO:  { label: '카카오',      color: '#3c1e1e', bg: '#fee500' },
    NAVER:  { label: '네이버',      color: '#fff',    bg: '#03c75a' },
    GOOGLE: { label: '구글',        color: '#fff',    bg: '#ea4335' },
};

const AVATAR_COLORS = ['#1565c0', '#2e7d32', '#6a1b9a', '#e65100', '#37474f'];
const getAvatarColor = (name) => {
    if (!name) return '#1565c0';
    return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
};

export default function MyPage() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    /* 프로필 수정 */
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState({ name: '', phone: '', birth: '' });
    const [saving, setSaving] = useState(false);
    const [profileError, setProfileError] = useState('');

    /* 비밀번호 변경 */
    const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
    const [pwSaving, setPwSaving] = useState(false);
    const [pwError, setPwError] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    /* 스낵바 */
    const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
    const showSnack = (msg, severity = 'success') => setSnack({ open: true, msg, severity });

    useEffect(() => {
        getMyProfileApi()
            .then(data => {
                setProfile(data);
                setForm({
                    name: data.name || '',
                    phone: data.phone || '',
                    birth: data.birth || '',
                });
            })
            .catch(() => navigate('/'))
            .finally(() => setLoading(false));
    }, [navigate]);

    const handleEditToggle = () => {
        if (editMode) {
            setForm({ name: profile.name || '', phone: profile.phone || '', birth: profile.birth || '' });
            setProfileError('');
        }
        setEditMode(v => !v);
    };

    const handleProfileSave = async () => {
        if (!form.name.trim()) { setProfileError('이름을 입력해주세요.'); return; }
        setSaving(true);
        setProfileError('');
        try {
            await updateProfileApi({ name: form.name.trim(), phone: form.phone, birth: form.birth || null });
            setProfile(prev => ({ ...prev, name: form.name.trim(), phone: form.phone, birth: form.birth }));
            setEditMode(false);
            showSnack('프로필이 저장되었습니다.');
        } catch (e) {
            setProfileError(e?.response?.data?.message || '저장 중 오류가 발생했습니다.');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordSave = async () => {
        if (!pwForm.currentPassword) { setPwError('현재 비밀번호를 입력해주세요.'); return; }
        if (pwForm.newPassword.length < 8) { setPwError('새 비밀번호는 8자 이상이어야 합니다.'); return; }
        if (pwForm.newPassword !== pwForm.confirm) { setPwError('새 비밀번호가 일치하지 않습니다.'); return; }
        setPwSaving(true);
        setPwError('');
        try {
            await changePasswordApi({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
            setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
            showSnack('비밀번호가 변경되었습니다.');
        } catch (e) {
            setPwError(e?.response?.data?.message || '비밀번호 변경 중 오류가 발생했습니다.');
        } finally {
            setPwSaving(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    const provider = PROVIDER_LABEL[profile?.provider] ?? PROVIDER_LABEL.LOCAL;
    const avatarColor = getAvatarColor(profile?.name);
    const initial = profile?.name ? profile.name[0] : '?';
    const joinDate = profile?.createdAt
        ? new Date(profile.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
        : '';

    return (
        <Box sx={{ bgcolor: '#f7f8fc', minHeight: '100vh', pb: 8 }}>

            {/* ── 프로필 헤더 ── */}
            <Box sx={{
                background: `linear-gradient(135deg, ${avatarColor} 0%, ${avatarColor}cc 100%)`,
                color: '#fff',
                pt: { xs: 5, md: 7 },
                pb: { xs: 7, md: 9 },
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* 배경 장식 원 */}
                {[
                    { size: 300, top: -80, right: -60,   opacity: 0.08 },
                    { size: 180, bottom: -50, left: -40, opacity: 0.07 },
                ].map((c, i) => (
                    <Box key={i} sx={{
                        position: 'absolute',
                        width: c.size, height: c.size,
                        borderRadius: '50%', bgcolor: 'white',
                        opacity: c.opacity,
                        top: c.top, bottom: c.bottom, left: c.left, right: c.right,
                    }} />
                ))}
                <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                        {/* 아바타 */}
                        <Box sx={{
                            width: { xs: 72, md: 96 }, height: { xs: 72, md: 96 },
                            borderRadius: '50%',
                            bgcolor: 'rgba(255,255,255,0.25)',
                            border: '3px solid rgba(255,255,255,0.6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: { xs: '2rem', md: '2.8rem' },
                            fontWeight: 900, color: '#fff',
                            flexShrink: 0,
                        }}>
                            {initial}
                        </Box>
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                                <Typography variant="h4" fontWeight={900} sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>
                                    {profile?.name ?? ''}
                                </Typography>
                                <Chip
                                    label={provider.label}
                                    size="small"
                                    sx={{
                                        bgcolor: provider.bg, color: provider.color,
                                        fontWeight: 700, fontSize: '0.7rem',
                                    }}
                                />
                            </Box>
                            <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                                {profile?.email}
                            </Typography>
                            <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', mt: 0.3 }}>
                                가입일 {joinDate}
                            </Typography>
                        </Box>
                    </Box>
                </Container>
            </Box>

            <Container maxWidth="md" sx={{ mt: { xs: -4, md: -5 }, position: 'relative', zIndex: 1 }}>

                {/* ── 기본 정보 카드 ── */}
                <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                    {/* 카드 헤더 */}
                    <Box sx={{
                        px: 3, py: 2,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        borderBottom: '1px solid #f0f0f0',
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PersonIcon sx={{ color: avatarColor }} />
                            <Typography fontWeight={700} fontSize="1.05rem">기본 정보</Typography>
                        </Box>
                        <Button
                            size="small"
                            variant={editMode ? 'outlined' : 'contained'}
                            color={editMode ? 'inherit' : 'primary'}
                            startIcon={editMode ? null : <EditIcon />}
                            onClick={handleEditToggle}
                            sx={{ borderRadius: 2, minWidth: 80 }}
                        >
                            {editMode ? '취소' : '수정'}
                        </Button>
                    </Box>

                    <Box sx={{ p: 3 }}>
                        {profileError && <Alert severity="error" sx={{ mb: 2 }}>{profileError}</Alert>}

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
                            {/* 아이디 (read-only) */}
                            <InfoField
                                icon={<BadgeIcon />}
                                label="아이디 (이메일)"
                                value={profile?.loginId}
                                readOnly
                            />
                            {/* 이메일 (read-only) */}
                            <InfoField
                                icon={<EmailIcon />}
                                label="이메일"
                                value={profile?.email}
                                readOnly
                            />
                            {/* 이름 */}
                            {editMode ? (
                                <TextField
                                    label="이름"
                                    value={form.name}
                                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                    size="small"
                                    InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ fontSize: 18, color: '#aaa' }} /></InputAdornment> }}
                                    sx={fieldSx}
                                />
                            ) : (
                                <InfoField icon={<PersonIcon />} label="이름" value={profile?.name} />
                            )}
                            {/* 연락처 */}
                            {editMode ? (
                                <TextField
                                    label="연락처"
                                    value={form.phone}
                                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                                    size="small"
                                    placeholder="010-0000-0000"
                                    InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ fontSize: 18, color: '#aaa' }} /></InputAdornment> }}
                                    sx={fieldSx}
                                />
                            ) : (
                                <InfoField icon={<PhoneIcon />} label="연락처" value={profile?.phone} empty="미등록" />
                            )}
                            {/* 생년월일 */}
                            {editMode ? (
                                <TextField
                                    label="생년월일"
                                    type="date"
                                    value={form.birth || ''}
                                    onChange={e => setForm(p => ({ ...p, birth: e.target.value }))}
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><CakeIcon sx={{ fontSize: 18, color: '#aaa' }} /></InputAdornment> }}
                                    sx={fieldSx}
                                />
                            ) : (
                                <InfoField icon={<CakeIcon />} label="생년월일" value={profile?.birth} empty="미등록" />
                            )}
                            {/* 가입일 */}
                            <InfoField icon={<CalendarMonthIcon />} label="가입일" value={joinDate} readOnly />
                        </Box>

                        {editMode && (
                            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                    variant="contained"
                                    startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                                    onClick={handleProfileSave}
                                    disabled={saving}
                                    sx={{ borderRadius: 2, px: 3, bgcolor: avatarColor, '&:hover': { bgcolor: avatarColor, filter: 'brightness(0.9)' } }}
                                >
                                    저장
                                </Button>
                            </Box>
                        )}
                    </Box>
                </Paper>

                {/* ── 비밀번호 변경 카드 (LOCAL만) ── */}
                {profile?.provider === 'LOCAL' && (
                    <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                        <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 1, borderBottom: '1px solid #f0f0f0' }}>
                            <LockIcon sx={{ color: '#e65100' }} />
                            <Typography fontWeight={700} fontSize="1.05rem">비밀번호 변경</Typography>
                        </Box>
                        <Box sx={{ p: 3 }}>
                            {pwError && <Alert severity="error" sx={{ mb: 2 }}>{pwError}</Alert>}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 420 }}>
                                <TextField
                                    label="현재 비밀번호"
                                    type={showCurrent ? 'text' : 'password'}
                                    value={pwForm.currentPassword}
                                    onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))}
                                    size="small"
                                    sx={fieldSx}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton size="small" onClick={() => setShowCurrent(v => !v)}>
                                                    {showCurrent ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <Divider />
                                <TextField
                                    label="새 비밀번호"
                                    type={showNew ? 'text' : 'password'}
                                    value={pwForm.newPassword}
                                    onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
                                    size="small"
                                    helperText="8자 이상 입력해주세요."
                                    sx={fieldSx}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton size="small" onClick={() => setShowNew(v => !v)}>
                                                    {showNew ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <TextField
                                    label="새 비밀번호 확인"
                                    type={showConfirm ? 'text' : 'password'}
                                    value={pwForm.confirm}
                                    onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
                                    size="small"
                                    sx={fieldSx}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton size="small" onClick={() => setShowConfirm(v => !v)}>
                                                    {showConfirm ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button
                                        variant="contained"
                                        onClick={handlePasswordSave}
                                        disabled={pwSaving}
                                        startIcon={pwSaving ? <CircularProgress size={16} color="inherit" /> : <LockIcon />}
                                        sx={{ borderRadius: 2, px: 3, bgcolor: '#e65100', '&:hover': { bgcolor: '#bf360c' } }}
                                    >
                                        변경
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    </Paper>
                )}
            </Container>

            <Snackbar
                open={snack.open}
                autoHideDuration={3000}
                onClose={() => setSnack(p => ({ ...p, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snack.severity} onClose={() => setSnack(p => ({ ...p, open: false }))} sx={{ borderRadius: 2 }}>
                    {snack.msg}
                </Alert>
            </Snackbar>
        </Box>
    );
}

/* ── 읽기 전용 필드 ── */
function InfoField({ icon, label, value, readOnly, empty = '-' }) {
    return (
        <Box sx={{
            display: 'flex', alignItems: 'flex-start', gap: 1.5,
            p: 1.5, borderRadius: 2,
            bgcolor: readOnly ? '#fafafa' : '#fff',
            border: '1px solid #f0f0f0',
        }}>
            <Box sx={{ color: '#bbb', mt: 0.2, flexShrink: 0 }}>
                {icon}
            </Box>
            <Box>
                <Typography variant="caption" color="text.disabled" display="block" lineHeight={1.2}>
                    {label}
                </Typography>
                <Typography fontWeight={600} fontSize="0.95rem" color={value ? 'text.primary' : 'text.disabled'}>
                    {value || empty}
                </Typography>
            </Box>
        </Box>
    );
}

const fieldSx = {
    '& .MuiOutlinedInput-root': {
        borderRadius: 2,
        '&:hover fieldset': { borderColor: '#1976d2' },
    },
};
