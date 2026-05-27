import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Stack, TextField, Select, MenuItem, FormControl,
    InputLabel, Button, Table, TableHead, TableBody, TableRow, TableCell,
    IconButton, Chip, CircularProgress, Alert, Snackbar,
    Dialog, DialogTitle, DialogContent, DialogActions, Rating, Tooltip,
} from '@mui/material';
import DeleteIcon    from '@mui/icons-material/Delete';
import CommonPagination from '../../components/CommonPagination';
import EditIcon      from '@mui/icons-material/Edit';
import CheckIcon     from '@mui/icons-material/Check';
import CloseIcon     from '@mui/icons-material/Close';
import VisibilityIcon   from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SearchIcon    from '@mui/icons-material/Search';
import * as api from '../../api/reviewApi';

import IMG_BASE from '../../config/imageConfig';
const WRITER_LABEL = { GENERAL: '일반회원', STUDENT: '학생', TEACHER: '선생님' };
const WRITER_COLOR = { GENERAL: 'default', STUDENT: 'primary', TEACHER: 'success' };

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
    const [detailComments, setDetailComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingContent, setEditingContent] = useState('');
    const [newComment, setNewComment] = useState('');
    const [addingComment, setAddingComment] = useState(false);
    const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
    const showSnack = (msg, severity = 'success') => setSnack({ open: true, msg, severity });

    const openDetail = async (r) => {
        setDetailReview(r);
        setDetailComments([]);
        setNewComment('');
        setEditingCommentId(null);
        setCommentsLoading(true);
        try {
            const comments = await api.getComments(r.productId, r.id);
            setDetailComments(comments);
        } catch { /* 댓글 로드 실패 시 빈 배열 유지 */ }
        finally { setCommentsLoading(false); }
    };

    const handleDeleteComment = async (commentId) => {
        if (!detailReview) return;
        try {
            await api.deleteComment(detailReview.productId, detailReview.id, commentId);
            setDetailComments(cs => cs.filter(c => c.id !== commentId));
            showSnack('댓글이 삭제되었습니다.');
        } catch { showSnack('댓글 삭제 중 오류가 발생했습니다.', 'error'); }
    };

    const handleEditComment = (c) => {
        setEditingCommentId(c.id);
        setEditingContent(c.content);
    };

    const handleCancelEdit = () => {
        setEditingCommentId(null);
        setEditingContent('');
    };

    const handleAddComment = async () => {
        if (!detailReview || !newComment.trim()) return;
        setAddingComment(true);
        try {
            const added = await api.addComment(detailReview.productId, detailReview.id, newComment.trim());
            setDetailComments(cs => [...cs, added]);
            setNewComment('');
            showSnack('댓글이 등록되었습니다.');
        } catch { showSnack('댓글 등록 중 오류가 발생했습니다.', 'error'); }
        finally { setAddingComment(false); }
    };

    const handleSaveComment = async (commentId) => {
        if (!detailReview || !editingContent.trim()) return;
        try {
            await api.updateComment(detailReview.productId, detailReview.id, commentId, editingContent.trim());
            setDetailComments(cs => cs.map(c => c.id === commentId ? { ...c, content: editingContent.trim() } : c));
            setEditingCommentId(null);
            setEditingContent('');
            showSnack('댓글이 수정되었습니다.');
        } catch { showSnack('댓글 수정 중 오류가 발생했습니다.', 'error'); }
    };

    useEffect(() => { load(); }, [page]);

    const load = async () => {
        setLoading(true);
        try {
            const res = await api.adminGetReviews({ page, size: 10, keyword, status, writerType });
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
                    sx={{ minWidth: { xs: '100%', sm: 220 } }} />
                <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 120 } }}>
                    <InputLabel>상태</InputLabel>
                    <Select value={status} label="상태" onChange={e => setStatus(e.target.value)}>
                        <MenuItem value="">전체</MenuItem>
                        <MenuItem value="PUBLISHED">노출</MenuItem>
                        <MenuItem value="HIDDEN">숨김</MenuItem>
                    </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 130 } }}>
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

            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} spacing={1.5} sx={{ mb: 1.5 }}>
                <Typography variant="body2" color="text.secondary">
                    전체 {total}건
                </Typography>
                <Alert severity="info" sx={{ py: 0, '& .MuiAlert-message': { py: '6px' } }}>
                    내용을 클릭하면 후기 상세 정보를 확인할 수 있습니다.
                </Alert>
            </Stack>

            {loading ? (
                <Box sx={{ py: 8, textAlign: 'center' }}><CircularProgress /></Box>
            ) : (
                <>
                    <Box sx={{ overflowX: 'auto' }}>
                    <Table size="small" sx={{ minWidth: 700 }}>
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
                                            size="small"
                                            color={WRITER_COLOR[r.writerType] ?? 'default'}
                                            sx={{ fontSize: '0.7rem' }} />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Rating value={r.rating} readOnly size="small" />
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title="클릭하면 상세 내용을 볼 수 있습니다" placement="top" arrow>
                                            <Typography variant="body2" noWrap sx={{ maxWidth: 220, cursor: 'pointer', '&:hover': { color: 'primary.main', textDecoration: 'underline' } }}
                                                onClick={() => openDetail(r)}>
                                                {r.content}
                                            </Typography>
                                        </Tooltip>
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
                    </Box>

                    <CommonPagination
                        count={totalPage}
                        page={page}
                        onChange={(_, v) => setPage(v)}
                    />
                </>
            )}

            {/* 후기 상세 다이얼로그 */}
            <Dialog open={!!detailReview} onClose={() => setDetailReview(null)} maxWidth="sm" fullWidth
                PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
                {detailReview && (
                    <>
                        {/* 헤더 */}
                        <Box sx={{ bgcolor: '#1a237e', px: 3, pt: 3, pb: 2.5 }}>
                            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', letterSpacing: 1 }}>
                                        REVIEW DETAIL
                                    </Typography>
                                    <Typography variant="h6" fontWeight={700} sx={{ color: '#fff', mt: 0.3, lineHeight: 1.3 }} noWrap>
                                        {detailReview.productName}
                                    </Typography>
                                </Box>
                                <Chip
                                    label={detailReview.status === 'PUBLISHED' ? '노출' : '숨김'}
                                    size="small"
                                    sx={{
                                        mt: 0.5, flexShrink: 0,
                                        bgcolor: detailReview.status === 'PUBLISHED' ? '#43a047' : '#757575',
                                        color: '#fff', fontWeight: 700,
                                    }}
                                />
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mt: 2 }}>
                                <Box sx={{
                                    width: 36, height: 36, borderRadius: '50%',
                                    bgcolor: 'rgba(255,255,255,0.15)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>
                                        {detailReview.userName?.charAt(0)}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" fontWeight={600} sx={{ color: '#fff', lineHeight: 1.2 }}>
                                        {detailReview.userName}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                                        {WRITER_LABEL[detailReview.writerType]} · {detailReview.createdAt?.slice(0, 10)}
                                    </Typography>
                                </Box>
                                <Box sx={{ ml: 'auto !important' }}>
                                    <Rating value={detailReview.rating} readOnly size="small"
                                        sx={{ '& .MuiRating-iconFilled': { color: '#ffd740' } }} />
                                </Box>
                            </Stack>
                        </Box>

                        <DialogContent sx={{ p: 3 }}>
                            <Stack spacing={2.5}>
                                {/* 내용 */}
                                <Box>
                                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ letterSpacing: 0.5 }}>
                                        후기 내용
                                    </Typography>
                                    <Box sx={{
                                        mt: 1, p: 2, bgcolor: '#f8f9fa',
                                        borderRadius: 2, border: '1px solid #e9ecef',
                                        minHeight: 80,
                                    }}>
                                        <Typography variant="body2" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                                            {detailReview.content}
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* 이미지 */}
                                {(detailReview.images || []).length > 0 && (
                                    <Box>
                                        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ letterSpacing: 0.5 }}>
                                            첨부 이미지 ({detailReview.images.length}장)
                                        </Typography>
                                        <Box sx={{
                                            mt: 1, display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                                            gap: 1,
                                        }}>
                                            {detailReview.images.map(img => (
                                                <Box key={img.imageId ?? img.id} component="img"
                                                    src={`${IMG_BASE}${img.imagePath}`}
                                                    sx={{
                                                        width: '100%', aspectRatio: '1',
                                                        objectFit: 'cover', borderRadius: 1.5,
                                                        border: '1px solid #e9ecef',
                                                        cursor: 'pointer',
                                                        '&:hover': { opacity: 0.85 },
                                                    }}
                                                    onClick={() => window.open(`${IMG_BASE}${img.imagePath}`, '_blank')}
                                                />
                                            ))}
                                        </Box>
                                    </Box>
                                )}

                                {/* 댓글 */}
                                <Box>
                                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                                        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ letterSpacing: 0.5 }}>
                                            댓글 {commentsLoading ? '' : `(${detailComments.length})`}
                                        </Typography>
                                    </Stack>
                                    {commentsLoading ? (
                                        <Box sx={{ py: 2, textAlign: 'center' }}><CircularProgress size={20} /></Box>
                                    ) : detailComments.length === 0 ? (
                                        <Box sx={{ mt: 1, p: 2, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #e9ecef', textAlign: 'center' }}>
                                            <Typography variant="body2" color="text.disabled">등록된 댓글이 없습니다.</Typography>
                                        </Box>
                                    ) : (
                                        <Stack spacing={1} sx={{ mt: 1 }}>
                                            {detailComments.map(c => (
                                                <Box key={c.id} sx={{
                                                    p: 1.5, bgcolor: '#f8f9fa',
                                                    borderRadius: 1.5, border: '1px solid #e9ecef',
                                                }}>
                                                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                                                        <Stack direction="row" alignItems="center" spacing={1}>
                                                            <Box sx={{
                                                                width: 26, height: 26, borderRadius: '50%',
                                                                bgcolor: '#1a237e', display: 'flex',
                                                                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                                            }}>
                                                                <Typography sx={{ color: '#fff', fontSize: '0.7rem', fontWeight: 700 }}>
                                                                    {c.userName?.charAt(0)}
                                                                </Typography>
                                                            </Box>
                                                            <Box>
                                                                <Typography variant="caption" fontWeight={700}>{c.userName}</Typography>
                                                                <Typography variant="caption" color="text.disabled" sx={{ ml: 1 }}>
                                                                    {c.createdAt?.slice(0, 10)}
                                                                </Typography>
                                                            </Box>
                                                        </Stack>
                                                        {editingCommentId === c.id ? (
                                                            <Stack direction="row" spacing={0.3}>
                                                                <Tooltip title="저장">
                                                                    <IconButton size="small" color="primary"
                                                                        onClick={() => handleSaveComment(c.id)}>
                                                                        <CheckIcon sx={{ fontSize: 15 }} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="취소">
                                                                    <IconButton size="small" onClick={handleCancelEdit}>
                                                                        <CloseIcon sx={{ fontSize: 15 }} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </Stack>
                                                        ) : (
                                                            <Stack direction="row" spacing={0.3}>
                                                                <Tooltip title="댓글 수정">
                                                                    <IconButton size="small" color="primary"
                                                                        onClick={() => handleEditComment(c)}>
                                                                        <EditIcon sx={{ fontSize: 15 }} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="댓글 삭제">
                                                                    <IconButton size="small" color="error"
                                                                        onClick={() => handleDeleteComment(c.id)}>
                                                                        <DeleteIcon sx={{ fontSize: 15 }} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </Stack>
                                                        )}
                                                    </Stack>
                                                    {editingCommentId === c.id ? (
                                                        <TextField
                                                            fullWidth multiline minRows={2}
                                                            size="small"
                                                            value={editingContent}
                                                            onChange={e => setEditingContent(e.target.value)}
                                                            sx={{ mt: 1, bgcolor: '#fff', borderRadius: 1 }}
                                                            autoFocus
                                                        />
                                                    ) : (
                                                        <Typography variant="body2" sx={{ mt: 0.8, pl: 0.5, lineHeight: 1.7 }}>
                                                            {c.content}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            ))}
                                        </Stack>
                                    )}
                                </Box>

                                {/* 댓글 입력 */}
                                <Box sx={{ pt: 1 }}>
                                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ letterSpacing: 0.5 }}>
                                        댓글 등록
                                    </Typography>
                                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                        <TextField
                                            fullWidth multiline minRows={2}
                                            size="small"
                                            placeholder="댓글을 입력하세요"
                                            value={newComment}
                                            onChange={e => setNewComment(e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter' && e.ctrlKey) handleAddComment();
                                            }}
                                            sx={{ bgcolor: '#fff' }}
                                        />
                                        <Button
                                            variant="contained"
                                            onClick={handleAddComment}
                                            disabled={!newComment.trim() || addingComment}
                                            sx={{ minWidth: 64, alignSelf: 'flex-end', mb: '1px' }}
                                        >
                                            {addingComment ? <CircularProgress size={18} color="inherit" /> : '등록'}
                                        </Button>
                                    </Stack>
                                    <Typography variant="caption" color="text.disabled">Ctrl+Enter로 빠르게 등록</Typography>
                                </Box>
                            </Stack>
                        </DialogContent>

                        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                            <Button
                                variant="outlined"
                                color={detailReview.status === 'PUBLISHED' ? 'warning' : 'success'}
                                startIcon={detailReview.status === 'PUBLISHED' ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                onClick={() => { handleStatusToggle(detailReview); setDetailReview(null); }}
                            >
                                {detailReview.status === 'PUBLISHED' ? '숨김 처리' : '노출 처리'}
                            </Button>
                            <Button
                                variant="outlined" color="error" startIcon={<DeleteIcon />}
                                onClick={() => { handleDelete(detailReview.id); setDetailReview(null); }}
                            >
                                삭제
                            </Button>
                            <Box sx={{ flex: 1 }} />
                            <Button variant="contained" onClick={() => setDetailReview(null)}>닫기</Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            <Snackbar open={snack.open} autoHideDuration={2500}
                onClose={() => setSnack(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity={snack.severity} variant="filled">{snack.msg}</Alert>
            </Snackbar>
        </Box>
    );
}
