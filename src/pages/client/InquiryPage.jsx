import { useState } from 'react';
import {
    Box, Container, Typography, TextField, MenuItem,
    Button, Paper, Alert, Divider, Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useAuth } from '../../auth/AuthProvider';
import { createInquiry, getMyInquiries } from '../../api/inquiryApi';
import { useEffect } from 'react';

const CATEGORIES = ['예약문의', '상품문의', '결제문의', '기타'];

const STATUS_LABEL = { NEW: '답변대기', COMPLETED: '답변완료' };
const STATUS_COLOR = { NEW: '#e65100', COMPLETED: '#2e7d32' };
const STATUS_BG    = { NEW: '#fff3e0', COMPLETED: '#e8f5e9' };

export default function InquiryPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: user?.name ?? '',
        phone: user?.phone ?? '',
        email: user?.email ?? '',
        category: '',
        title: '',
        content: '',
    });
    const [success, setSuccess] = useState(false);
    const [error, setError]     = useState('');
    const [loading, setLoading] = useState(false);
    const [myList, setMyList]   = useState([]);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        if (user) {
            getMyInquiries().then(setMyList).catch(() => {});
        }
    }, [user, success]);

    const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async () => {
        if (!form.name || !form.phone || !form.email || !form.category || !form.title || !form.content) {
            setError('모든 항목을 입력해 주세요.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await createInquiry(form);
            setSuccess(true);
            setForm({ name: user?.name ?? '', phone: user?.phone ?? '', email: user?.email ?? '', category: '', title: '', content: '' });
        } catch {
            setError('문의 등록에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ bgcolor: '#f7f8fc', minHeight: '100vh' }}>
            {/* 히어로 */}
            <Box sx={{
                background: 'linear-gradient(135deg, #1a237e 0%, #283593 40%, #1565c0 100%)',
                color: 'white', py: { xs: 6, md: 10 },
                position: 'relative', overflow: 'hidden',
            }}>
                {[{ size: 300, top: -80, right: -60, opacity: 0.06 }, { size: 180, bottom: -40, left: -40, opacity: 0.07 }].map((c, i) => (
                    <Box key={i} sx={{ position: 'absolute', width: c.size, height: c.size, borderRadius: '50%', bgcolor: 'white', opacity: c.opacity, top: c.top, bottom: c.bottom, left: c.left, right: c.right }} />
                ))}
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <QuestionAnswerIcon sx={{ fontSize: 32 }} />
                        <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.7)', letterSpacing: 4 }}>INQUIRY</Typography>
                    </Box>
                    <Typography variant="h3" fontWeight={900} sx={{ fontSize: { xs: '1.8rem', md: '2.8rem' }, mb: 1 }}>
                        문의하기
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.75)', fontWeight: 400 }}>
                        궁금한 사항을 남겨주시면 빠르게 답변드리겠습니다.
                    </Typography>
                </Container>
            </Box>

            <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 } }}>

                {/* 문의 폼 */}
                <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 }, mb: 5, borderRadius: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                        <Typography variant="h6" fontWeight={800}>문의 등록</Typography>
                        <Button
                            startIcon={<ArrowBackIcon />}
                            size="small"
                            onClick={() => { navigate('/'); window.scrollTo(0, 0); }}
                            sx={{ color: 'text.secondary' }}
                        >
                            홈으로
                        </Button>
                    </Box>

                    {success && (
                        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(false)}>
                            문의가 등록되었습니다. 빠른 시일 내에 답변드리겠습니다.
                        </Alert>
                    )}
                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                    <Stack spacing={2.5}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                            <TextField label="이름" name="name" value={form.name} onChange={handleChange} size="small" required />
                            <TextField label="연락처" name="phone" value={form.phone} onChange={handleChange} size="small" required placeholder="010-0000-0000" />
                        </Box>
                        <TextField label="이메일" name="email" value={form.email} onChange={handleChange} size="small" required type="email" />
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                            <TextField
                                label="문의 유형" name="category" value={form.category}
                                onChange={handleChange} size="small" required select>
                                {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                            </TextField>
                            <TextField
                                label="회원 구분" size="small"
                                value={user ? '로그인 회원' : '비회원'}
                                disabled
                                InputProps={{
                                    sx: {
                                        bgcolor: user ? '#e8f5e9' : '#f5f5f5',
                                        fontWeight: 700,
                                        color: user ? '#2e7d32' : '#757575',
                                    }
                                }}
                            />
                        </Box>
                        <TextField label="제목" name="title" value={form.title} onChange={handleChange} size="small" required />
                        <TextField
                            label="문의 내용" name="content" value={form.content}
                            onChange={handleChange} multiline rows={6} required
                            placeholder="문의하실 내용을 자세히 작성해주세요."
                        />
                        <Button
                            variant="contained" size="large" onClick={handleSubmit}
                            disabled={loading}
                            sx={{ borderRadius: 2, py: 1.3, fontWeight: 700, bgcolor: '#1565c0' }}>
                            {loading ? '등록 중...' : '문의 등록'}
                        </Button>
                    </Stack>
                </Paper>

                {/* 내 문의 목록 (로그인 시) */}
                {user && myList.length > 0 && (
                    <Box>
                        <Divider sx={{ mb: 4 }} />
                        <Typography variant="h6" fontWeight={800} sx={{ mb: 2.5 }}>내 문의 내역</Typography>
                        <Stack spacing={2}>
                            {myList.map(inq => (
                                <Paper
                                    key={inq.inquiryId}
                                    variant="outlined"
                                    onClick={() => setSelected(selected?.inquiryId === inq.inquiryId ? null : inq)}
                                    sx={{
                                        p: 2.5, borderRadius: 2, cursor: 'pointer',
                                        borderColor: inq.status === 'COMPLETED' && selected?.inquiryId !== inq.inquiryId ? '#a5d6a7' : undefined,
                                        '&:hover': { bgcolor: '#f9f9f9' },
                                    }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box sx={{
                                                px: 1, py: 0.2, borderRadius: 1,
                                                bgcolor: STATUS_BG[inq.status],
                                                color: STATUS_COLOR[inq.status],
                                                fontSize: '0.72rem', fontWeight: 700,
                                            }}>
                                                {STATUS_LABEL[inq.status] ?? inq.status}
                                            </Box>
                                            <Box sx={{ px: 1, py: 0.2, borderRadius: 1, bgcolor: '#e3f2fd', color: '#1565c0', fontSize: '0.72rem', fontWeight: 600 }}>
                                                {inq.category}
                                            </Box>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Typography variant="caption" color="text.disabled">{inq.createdAt}</Typography>
                                            {selected?.inquiryId === inq.inquiryId
                                                ? <ExpandLessIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                                : <ExpandMoreIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                            }
                                        </Box>
                                    </Box>
                                    <Typography variant="body2" fontWeight={700} sx={{ mb: 0.3 }}>{inq.title}</Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {inq.content}
                                    </Typography>
                                    {inq.status === 'COMPLETED' && selected?.inquiryId !== inq.inquiryId && (
                                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.8, color: '#2e7d32', fontWeight: 600 }}>
                                            💬 답변이 도착했어요 ^^ 클릭하면 답변이 밑으로 생성됩니다
                                        </Typography>
                                    )}

                                    {/* 펼치기 */}
                                    {selected?.inquiryId === inq.inquiryId && (
                                        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #eee' }}>
                                            <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mb: inq.answer ? 2 : 0 }}>
                                                {inq.content}
                                            </Typography>
                                            {inq.answer && (
                                                <Box sx={{ bgcolor: '#e8f5e9', borderRadius: 2, p: 2, mt: 1 }}>
                                                    <Typography variant="caption" fontWeight={700} color="#2e7d32" display="block" sx={{ mb: 0.5 }}>
                                                        ✅ 관리자 답변
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{inq.answer}</Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    )}
                                </Paper>
                            ))}
                        </Stack>
                    </Box>
                )}
            </Container>
        </Box>
    );
}
