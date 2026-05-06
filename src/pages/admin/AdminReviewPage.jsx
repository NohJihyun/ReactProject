import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Stack, TextField, Select, MenuItem, FormControl,
    InputLabel, Button, Table, TableHead, TableBody, TableRow, TableCell,
    IconButton, Chip, Pagination, CircularProgress, Alert, Snackbar,
    Dialog, DialogTitle, DialogContent, DialogActions, Rating,
} from '@mui/material';
import DeleteIcon    from '@mui/icons-material/Delete';
import VisibilityIcon   from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SearchIcon    from '@mui/icons-material/Search';
import * as api from '../../api/reviewApi';

const IMG_BASE = 'http://localhost:8080';
const WRITER_LABEL = { GENERAL: '일반회원', STUDENT: '학생', TEACHER: '선생님' };

export default function AdminReviewPage() {
    const [reviews,  setReviews]  = useState([]);
    const [total,    setTotal]    = useState(0);
    const [totalPage, setTotalPage] = useState(1);
    const [loading,  setLoading]  = useState(true);

    const [keyword,    setKeyword]    = useState('');
    const [status,     setStatus]     = useState('');
    const [writerType, setWriterType] = useState('');
    const [page,       setPage]       = useState(1);

    const [detailReview, setDetailReview] = useState(null);
    const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
    const showSnack = (msg, severity = 'success') => setSnack({ open: true, msg, severity });

    useEffect(() => { load(); }, [page]);

    const load = async () => {
        setLoading(true);
        try {
            const res = await api.adminGetReviews({ page, size: 15, keyword, status, writerType });
            setReviews(res.list);
            setTotal(res.totalCount);
            setTotalPage(res.totalPage);
        } finally { setLoading(false); }
    };

    const handleSearch = () => { setPage(1); load(); };

    const handleStatusToggle = async (review) => {
        const next = review.status === 'PUBLISHED' ? 'HIDDEN' : 'PUBLISHED';
        try {
            await api.adminUpdateStatus(review.id, next);
            setReviews(rs => rs.map(r => r.id === review.id ? { ...r, status: next } : r));
            showSnack(next === 'HIDDEN' ? '숨김 처리되었습니다.' : '노출 처리되었습니다.');
        } catch { showSnack('처리 중 오류가 발생했습니다.', 'error'); }
    };

    const handleDelete = async (reviewId) => {
        if (!window.confirm('이 후기를 삭제하시겠습니까?')) return;
        try {
            await api.adminDeleteReview(reviewId);
            setReviews(rs => rs.filter(r => r.id !== reviewId));
            setTotal(t => t - 1);
            showSnack('삭제되었습니다.');
        } catch { showSnack('삭제 중 오류가 발생했습니다.', 'error'); }
    };

    return (
        <Box>
            <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>고객 리뷰 관리</Typography>

            {/* 검색 필터 */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2.5 }} flexWrap="wrap">
                <TextField
                    size="small" placeholder="상품명 / 작성자 / 내용"
                    value={keyword} onChange={e => setKeyword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    sx={{ minWidth: 220 }} />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>상태</InputLabel>
                    <Select value={status} label="상태" onChange={e => setStatus(e.target.value)}>
                        <MenuItem value="">전체</MenuItem>
                        <MenuItem value="PUBLISHED">노출</MenuItem>
                        <MenuItem value="HIDDEN">숨김</MenuItem>
                    </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 130 }}>
                    <InputLabel>작성자 유형</InputLabel>
                    <Select value={writerType} label="작성자 유형" onChange={e => setWriterType(e.target.value)}>
                        <MenuItem value="">전체</MenuItem>
                        <MenuItem value="GENERAL">일반회원</MenuItem>
                        <MenuItem value="STUDENT">학생</MenuItem>
                        <MenuItem value="TEACHER">선생님</MenuItem>
                    </Select>
                </FormControl>
                <Button variant="contained" startIcon={<SearchIcon />} onClick={handleSearch}>검색</Button>
            </Stack>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                전체 {total}건
            </Typography>

            {loading ? (
                <Box sx={{ py: 8, textAlign: 'center' }}><CircularProgress /></Box>
            ) : (
                <>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'grey.50' }}>
                                <TableCell sx={{ fontWeight: 700, width: '18%' }}>상품명</TableCell>
                                <TableCell sx={{ fontWeight: 700, width: '10%' }} align="center">작성자</TableCell>
                                <TableCell sx={{ fontWeight: 700, width: '9%' }} align="center">유형</TableCell>
                                <TableCell sx={{ fontWeight: 700, width: '8%' }} align="center">별점</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>내용</TableCell>
                                <TableCell sx={{ fontWeight: 700, width: '7%' }} align="center">상태</TableCell>
                                <TableCell sx={{ fontWeight: 700, width: '10%' }} align="center">등록일</TableCell>
                                <TableCell sx={{ fontWeight: 700, width: '8%' }} align="center">관리</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reviews.map(r => (
                                <TableRow key={r.id} hover
                                    sx={{ opacity: r.status === 'HIDDEN' ? 0.55 : 1 }}>
                                    <TableCell>
                                        <Typography variant="body2" noWrap sx={{ maxWidth: 140 }}>
                                            {r.productName}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography variant="body2">{r.userName}</Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip label={WRITER_LABEL[r.writerType] ?? r.writerType}
                                            size="small" variant="outlined"
                                            sx={{ fontSize: '0.7rem' }} />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Rating value={r.rating} readOnly size="small" />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" noWrap sx={{ maxWidth: 220, cursor: 'pointer' }}
                                            onClick={() => setDetailReview(r)}>
                                            {r.content}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={r.status === 'PUBLISHED' ? '노출' : '숨김'}
                                            size="small"
                                            color={r.status === 'PUBLISHED' ? 'success' : 'default'}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography variant="caption">{r.createdAt?.slice(0, 10)}</Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Stack direction="row" justifyContent="center" spacing={0.3}>
                                            <IconButton size="small"
                                                title={r.status === 'PUBLISHED' ? '숨김' : '노출'}
                                                onClick={() => handleStatusToggle(r)}>
                                                {r.status === 'PUBLISHED'
                                                    ? <VisibilityOffIcon sx={{ fontSize: 16 }} />
                                                    : <VisibilityIcon sx={{ fontSize: 16 }} />}
                                            </IconButton>
                                            <IconButton size="small" color="error" onClick={() => handleDelete(r.id)}>
                                                <DeleteIcon sx={{ fontSize: 16 }} />
                                            </IconButton>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {reviews.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 5, color: 'text.disabled' }}>
                                        검색된 후기가 없습니다.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {totalPage > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                            <Pagination count={totalPage} page={page}
                                onChange={(_, v) => setPage(v)} color="primary" />
                        </Box>
                    )}
                </>
            )}

            {/* 후기 상세 다이얼로그 */}
            <Dialog open={!!detailReview} onClose={() => setDetailReview(null)} maxWidth="sm" fullWidth>
                <DialogTitle fontWeight={700}>후기 상세</DialogTitle>
                {detailReview && (
                    <DialogContent dividers>
                        <Stack spacing={1.5}>
                            <Typography variant="body2"><strong>상품:</strong> {detailReview.productName}</Typography>
                            <Typography variant="body2"><strong>작성자:</strong> {detailReview.userName} ({WRITER_LABEL[detailReview.writerType]})</Typography>
                            <Box>
                                <Typography variant="body2" component="span"><strong>별점: </strong></Typography>
                                <Rating value={detailReview.rating} readOnly size="small" />
                            </Box>
                            <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{detailReview.content}</Typography>
                            </Box>
                            {(detailReview.images || []).length > 0 && (
                                <Stack direction="row" flexWrap="wrap" gap={1}>
                                    {detailReview.images.map(img => (
                                        <Box key={img.id} component="img"
                                            src={`${IMG_BASE}${img.imagePath}`}
                                            sx={{ width: 100, height: 80, objectFit: 'cover', borderRadius: 1 }} />
                                    ))}
                                </Stack>
                            )}
                        </Stack>
                    </DialogContent>
                )}
                <DialogActions>
                    <Button onClick={() => setDetailReview(null)}>닫기</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snack.open} autoHideDuration={2500}
                onClose={() => setSnack(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity={snack.severity} variant="filled">{snack.msg}</Alert>
            </Snackbar>
        </Box>
    );
}
