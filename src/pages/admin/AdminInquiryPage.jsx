import { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody,
    TextField, MenuItem, Button, Chip, Dialog, DialogTitle, DialogContent,
    DialogActions, IconButton, Alert, Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CommonPagination from '../../components/CommonPagination';
import {
    getAdminInquiries, updateInquiryAnswer, updateInquiryStatus, deleteInquiry
} from '../../api/inquiryApi';

const CATEGORIES = ['', '예약문의', '상품문의', '결제문의', '기타'];
const STATUS_OPTIONS = [
    { value: '', label: '전체' },
    { value: 'NEW', label: '답변대기' },
    { value: 'COMPLETED', label: '답변완료' },
];
const STATUS_COLOR = { NEW: 'warning', COMPLETED: 'success' };
const STATUS_LABEL = { NEW: '답변대기', COMPLETED: '답변완료' };

export default function AdminInquiryPage() {
    const [list, setList]       = useState([]);
    const [total, setTotal]     = useState(0);
    const [page, setPage]       = useState(1);
    const [keyword, setKeyword] = useState('');
    const [status, setStatus]   = useState('');
    const [category, setCategory] = useState('');
    const [selected, setSelected] = useState(null);
    const [answer, setAnswer]   = useState('');
    const [loading, setLoading] = useState(false);
    const SIZE = 15;

    const fetch = useCallback(() => {
        getAdminInquiries({ page, size: SIZE, keyword, status, category })
            .then(r => { setList(r.list ?? []); setTotal(r.totalCount ?? 0); })
            .catch(() => {});
    }, [page, keyword, status, category]);

    useEffect(() => { fetch(); }, [fetch]);

    const handleSearch = () => { setPage(1); fetch(); };

    const openDetail = (inq) => {
        setSelected(inq);
        setAnswer(inq.answer ?? '');
    };

    const handleAnswer = async () => {
        if (!answer.trim()) return;
        setLoading(true);
        try {
            await updateInquiryAnswer(selected.inquiryId, answer);
            fetch();
            setSelected(prev => ({ ...prev, answer, status: 'COMPLETED' }));
            window.dispatchEvent(new CustomEvent('inquiry-status-changed'));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('삭제하시겠습니까?')) return;
        await deleteInquiry(id);
        fetch();
        setSelected(null);
        window.dispatchEvent(new CustomEvent('inquiry-status-changed'));
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="h5" fontWeight={700}>문의 관리</Typography>
                <Alert severity="info" sx={{ py: 0.3, fontSize: '0.78rem', flex: 1, minWidth: 0 }}>
                    <div>1. <strong>로그인 회원 즉 사용자가</strong> 문의 등록 시 <strong>관리자</strong>가 문의 관리의 <strong>상세</strong>에서 답변 등록해 주면 <strong>문의하기 페이지</strong> 하단 "내 문의 내역"에서 확인 가능합니다.</div>
                    <div>2. <strong>비로그인</strong> 고객은 <strong>유선·문자·이메일</strong>로 직접 안내해주세요.</div>
                </Alert>
            </Box>

            {/* 검색 필터 */}
            <Paper variant="outlined" sx={{ p: 2, mb: 2.5, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, flexWrap: 'wrap', alignItems: { xs: 'stretch', sm: 'center' } }}>
                <TextField
                    label="검색 (이름/제목/이메일)" value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    size="small" sx={{ minWidth: { xs: '100%', sm: 240 } }} />
                <TextField select label="유형" value={category} onChange={e => { setCategory(e.target.value); setPage(1); }} size="small" sx={{ minWidth: { xs: '100%', sm: 120 } }}>
                    {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c || '전체'}</MenuItem>)}
                </TextField>
                <TextField select label="상태" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} size="small" sx={{ minWidth: { xs: '100%', sm: 120 } }}>
                    {STATUS_OPTIONS.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
                </TextField>
                <Button variant="contained" onClick={handleSearch} sx={{ fontWeight: 700 }}>검색</Button>
            </Paper>

            {/* 목록 */}
            <Paper variant="outlined" sx={{ mb: 2, overflowX: 'auto' }}>
                <Table size="small" sx={{ minWidth: 680 }}>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                            <TableCell>회원구분</TableCell>
                            <TableCell>유형</TableCell>
                            <TableCell>제목</TableCell>
                            <TableCell>작성자</TableCell>
                            <TableCell>연락처</TableCell>
                            <TableCell>상태</TableCell>
                            <TableCell>등록일</TableCell>
                            <TableCell align="center">관리</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {list.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 5, color: 'text.disabled' }}>
                                    문의 내역이 없습니다.
                                </TableCell>
                            </TableRow>
                        ) : list.map(inq => (
                            <TableRow key={inq.inquiryId} hover>
                                <TableCell>
                                    <Chip
                                        label={inq.userId ? '로그인 회원' : '비회원'}
                                        size="small"
                                        color={inq.userId ? 'primary' : 'default'}
                                        variant={inq.userId ? 'filled' : 'outlined'}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip label={inq.category} size="small" variant="outlined" />
                                </TableCell>
                                <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {inq.title}
                                </TableCell>
                                <TableCell>{inq.name}</TableCell>
                                <TableCell>{inq.phone}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={STATUS_LABEL[inq.status] ?? inq.status}
                                        size="small"
                                        color={STATUS_COLOR[inq.status] ?? 'default'}
                                    />
                                </TableCell>
                                <TableCell>{inq.createdAt}</TableCell>
                                <TableCell align="center">
                                    <Button size="small" onClick={() => openDetail(inq)}>상세</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>

            {total > SIZE && (
                <CommonPagination
                    page={page} count={Math.ceil(total / SIZE) || 1}
                    onChange={(_, v) => setPage(v)} />
            )}

            {/* 상세 다이얼로그 */}
            <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="sm" fullWidth>
                {selected && (
                    <>
                        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <Chip label={selected.category} size="small" variant="outlined" />
                                <Chip label={STATUS_LABEL[selected.status]} size="small" color={STATUS_COLOR[selected.status]} />
                                <Chip
                                    label={selected.userId ? '로그인 회원' : '비회원'}
                                    size="small"
                                    color={selected.userId ? 'primary' : 'default'}
                                    variant={selected.userId ? 'filled' : 'outlined'}
                                />
                            </Box>
                            <IconButton onClick={() => setSelected(null)}><CloseIcon /></IconButton>
                        </DialogTitle>
                        <DialogContent dividers>
                            <Stack spacing={2}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">제목</Typography>
                                    <Typography variant="body1" fontWeight={700}>{selected.title}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1.5, sm: 3 } }}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">작성자</Typography>
                                        <Typography variant="body2">{selected.name}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">연락처</Typography>
                                        <Typography variant="body2">{selected.phone}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">이메일</Typography>
                                        <Typography variant="body2">{selected.email}</Typography>
                                    </Box>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">문의 내용</Typography>
                                    <Paper variant="outlined" sx={{ p: 2, mt: 0.5, borderRadius: 2, whiteSpace: 'pre-line' }}>
                                        <Typography variant="body2">{selected.content}</Typography>
                                    </Paper>
                                </Box>
                                {selected.userId ? (
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>답변</Typography>
                                        <TextField
                                            value={answer} onChange={e => setAnswer(e.target.value)}
                                            multiline rows={5} fullWidth size="small"
                                            placeholder="답변을 입력하세요."
                                        />
                                    </Box>
                                ) : (
                                    <Box>
                                        <Typography sx={{ color: '#FFD700', fontSize: '1.4rem', mb: 0.5 }}>★★★★★</Typography>
                                        <Alert severity="warning" sx={{ py: 0.5 }}>
                                            <strong>비회원</strong> 고객입니다. 비회원 고객은 <strong>홈페이지 내</strong>에서 <strong>관리자</strong>가 등록한 글을 볼 수 없어 <strong>유선·문자·이메일</strong>로 직접 안내해주세요.
                                        </Alert>
                                    </Box>
                                )}
                                {selected.status === 'COMPLETED' && (
                                    <Alert severity="success" sx={{ py: 0.5 }}>답변이 완료된 문의입니다.</Alert>
                                )}
                            </Stack>
                        </DialogContent>
                        <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
                            <Button color="error" onClick={() => handleDelete(selected.inquiryId)}>삭제</Button>
                            <Button
                                variant="contained" onClick={handleAnswer}
                                disabled={loading || !answer.trim()}
                                sx={{ fontWeight: 700 }}>
                                답변 저장
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
}
