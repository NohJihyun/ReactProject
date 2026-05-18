import React, { useEffect, useState, useRef, forwardRef } from 'react';
import {
    Box, Typography, Stack, Button, Divider, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Select, MenuItem, FormControl, InputLabel,
    Chip, Avatar, CircularProgress, Alert, Snackbar,
    Collapse, Rating,
} from '@mui/material';
import EditIcon    from '@mui/icons-material/Edit';
import DeleteIcon  from '@mui/icons-material/Delete';
import AddIcon     from '@mui/icons-material/Add';
import SendIcon    from '@mui/icons-material/Send';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CommentIcon from '@mui/icons-material/Comment';
import CloseIcon   from '@mui/icons-material/Close';
import { useAuth } from '../../auth/AuthProvider';
import * as api from '../../api/reviewApi';

import IMG_BASE from '../../config/imageConfig';

const WRITER_TYPE_LABEL = { GENERAL: '일반회원', STUDENT: '학생', TEACHER: '선생님' };
const WRITER_TYPE_COLOR = { GENERAL: 'default', STUDENT: 'primary', TEACHER: 'success' };
const WRITER_TYPE_ICON  = { GENERAL: '👤', STUDENT: '👨‍🎓', TEACHER: '👨‍🏫' };

const maskName = (name) => {
    if (!name) return '?';
    if (name.length === 1) return name;
    if (name.length === 2) return name[0] + '*';
    return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
};

const EMPTY_FORM = { writerType: 'GENERAL', rating: 5, content: '' };

/* ═══════════════════════════════════════════════
   메인 컴포넌트
═══════════════════════════════════════════════ */
const ReviewSection = forwardRef(function ReviewSection({ productId }, ref) {
    const { user, isAuthenticated } = useAuth();
    const isAdmin = user?.role === 'ADMIN';

    const [reviews,     setReviews]     = useState([]);
    const [stats,       setStats]       = useState({ totalCount: 0, averageRating: 0 });
    const [page,        setPage]        = useState(1);
    const [totalPage,   setTotalPage]   = useState(1);
    const [loading,     setLoading]     = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const [writeOpen,   setWriteOpen]   = useState(false);
    const [editTarget,  setEditTarget]  = useState(null);
    const [form,        setForm]        = useState(EMPTY_FORM);
    const [saving,      setSaving]      = useState(false);
    const [pendingImages, setPendingImages] = useState([]);
    const imageInputRef = useRef(null);

    const [expandedComments, setExpandedComments] = useState(new Set());
    const [commentTexts,     setCommentTexts]     = useState({});
    const [comments,         setComments]         = useState({});
    const [commentSaving,    setCommentSaving]    = useState({});
    const [editingComment,   setEditingComment]   = useState(null);
    const [editCommentText,  setEditCommentText]  = useState('');

    const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
    const showSnack = (msg, severity = 'success') => setSnack({ open: true, msg, severity });

    useEffect(() => { loadStats(); loadReviews(1, true); }, [productId]);

    const loadStats = async () => {
        try { setStats(await api.getReviewStats(productId)); } catch {}
    };

    const loadReviews = async (p, reset = false) => {
        reset ? setLoading(true) : setLoadingMore(true);
        try {
            const res = await api.getReviews(productId, p, 5);
            setReviews(prev => reset ? res.list : [...prev, ...res.list]);
            setPage(res.page);
            setTotalPage(res.totalPage);
        } finally {
            reset ? setLoading(false) : setLoadingMore(false);
        }
    };

    const openWrite = () => {
        setEditTarget(null);
        setForm(EMPTY_FORM);
        setPendingImages([]);
        setWriteOpen(true);
    };

    const openEdit = (review) => {
        setEditTarget(review);
        setForm({ writerType: review.writerType, rating: review.rating, content: review.content });
        setPendingImages([]);
        setWriteOpen(true);
    };

    const closeWrite = () => {
        pendingImages.forEach(f => URL.revokeObjectURL(f.previewUrl));
        setPendingImages([]);
        setWriteOpen(false);
    };

    const handleAddPendingImages = (files) => {
        const entries = Array.from(files).map(file => ({
            tempId: `${Date.now()}_${Math.random()}`,
            file,
            previewUrl: URL.createObjectURL(file),
        }));
        setPendingImages(ps => [...ps, ...entries]);
    };

    const handleSave = async () => {
        if (!form.content.trim()) return;
        setSaving(true);
        try {
            if (editTarget) {
                const updated = await api.updateReview(productId, editTarget.id, form);
                setReviews(rs => rs.map(r => r.id === editTarget.id
                    ? { ...updated, images: r.images, commentCount: r.commentCount }
                    : r));
                showSnack('후기가 수정되었습니다.');
                setWriteOpen(false);
            } else {
                const created = await api.createReview(productId, form);
                for (const pf of pendingImages) {
                    const fd = new FormData();
                    fd.append('file', pf.file);
                    const img = await api.uploadReviewImage(productId, created.id, fd);
                    created.images = [...(created.images || []), img];
                    URL.revokeObjectURL(pf.previewUrl);
                }
                setPendingImages([]);
                setReviews(rs => [created, ...rs]);
                setStats(s => ({ totalCount: s.totalCount + 1, averageRating: s.averageRating }));
                loadStats();
                showSnack('후기가 등록되었습니다.');
                setWriteOpen(false);
            }
        } catch { showSnack('저장 중 오류가 발생했습니다.', 'error'); }
        finally { setSaving(false); }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('이 후기를 삭제하시겠습니까?')) return;
        try {
            await api.deleteReview(productId, reviewId);
            setReviews(rs => rs.filter(r => r.id !== reviewId));
            setStats(s => ({ ...s, totalCount: Math.max(0, s.totalCount - 1) }));
            loadStats();
            showSnack('후기가 삭제되었습니다.');
        } catch { showSnack('삭제 중 오류가 발생했습니다.', 'error'); }
    };

    const toggleComments = async (reviewId) => {
        const next = new Set(expandedComments);
        if (next.has(reviewId)) {
            next.delete(reviewId);
        } else {
            next.add(reviewId);
            if (!comments[reviewId]) {
                try {
                    const list = await api.getComments(productId, reviewId);
                    setComments(c => ({ ...c, [reviewId]: list }));
                } catch {}
            }
        }
        setExpandedComments(next);
    };

    const handleAddComment = async (reviewId) => {
        const text = commentTexts[reviewId]?.trim();
        if (!text) return;
        setCommentSaving(s => ({ ...s, [reviewId]: true }));
        try {
            const added = await api.addComment(productId, reviewId, text);
            setComments(c => ({ ...c, [reviewId]: [...(c[reviewId] || []), added] }));
            setCommentTexts(t => ({ ...t, [reviewId]: '' }));
            setReviews(rs => rs.map(r => r.id === reviewId
                ? { ...r, commentCount: r.commentCount + 1 } : r));
        } catch { showSnack('댓글 등록 중 오류가 발생했습니다.', 'error'); }
        finally { setCommentSaving(s => ({ ...s, [reviewId]: false })); }
    };

    const handleUpdateComment = async (reviewId, commentId) => {
        if (!editCommentText.trim()) return;
        try {
            const updated = await api.updateComment(productId, reviewId, commentId, editCommentText);
            setComments(c => ({ ...c, [reviewId]: c[reviewId].map(cm => cm.id === commentId ? updated : cm) }));
            setEditingComment(null);
        } catch { showSnack('댓글 수정 중 오류가 발생했습니다.', 'error'); }
    };

    const handleDeleteComment = async (reviewId, commentId) => {
        if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
        try {
            await api.deleteComment(productId, reviewId, commentId);
            setComments(c => ({ ...c, [reviewId]: c[reviewId].filter(cm => cm.id !== commentId) }));
            setReviews(rs => rs.map(r => r.id === reviewId
                ? { ...r, commentCount: Math.max(0, r.commentCount - 1) } : r));
        } catch { showSnack('댓글 삭제 중 오류가 발생했습니다.', 'error'); }
    };

    return (
        <Box ref={ref}>
            <Divider />
            <Box sx={{ p: { xs: 2.5, md: 4 } }}>

                {/* 헤더 */}
                <Stack direction={{ xs: 'column', sm: 'row' }}
                    alignItems={{ sm: 'center' }} justifyContent="space-between"
                    spacing={1.5} sx={{ mb: 3 }}>
                    <Box>
                        <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '1rem', md: '1.15rem' } }}>
                            고객 후기
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mt: 0.5 }}>
                            <Rating value={Number(stats.averageRating)} readOnly precision={0.1} size="small" />
                            <Typography variant="body2" fontWeight={700} color="warning.main">
                                {Number(stats.averageRating).toFixed(1)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                ({stats.totalCount}개의 후기)
                            </Typography>
                        </Stack>
                    </Box>
                    {isAuthenticated && !isAdmin && (
                        <Button variant="contained" startIcon={<AddIcon />} onClick={openWrite}
                            sx={{ borderRadius: 2, flexShrink: 0 }}>
                            후기 작성
                        </Button>
                    )}
                </Stack>

                {/* 후기 목록 */}
                {loading ? (
                    <Box sx={{ py: 6, textAlign: 'center' }}><CircularProgress /></Box>
                ) : reviews.length === 0 ? (
                    <Box sx={{ py: 6, textAlign: 'center', color: 'text.disabled',
                        border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
                        <Typography variant="body2">아직 등록된 후기가 없습니다.</Typography>
                        {isAuthenticated && !isAdmin && (
                            <Button size="small" onClick={openWrite} sx={{ mt: 1 }}>첫 번째 후기 작성하기</Button>
                        )}
                    </Box>
                ) : (
                    <Stack spacing={2}>
                        {reviews.map(review => (
                            <ReviewCard
                                key={review.id}
                                review={review}
                                productId={productId}
                                isAuthenticated={isAuthenticated}
                                isAdmin={isAdmin}
                                currentUserId={user?.id}
                                currentUserLoginId={user?.loginId}
                                onEdit={openEdit}
                                onDelete={handleDeleteReview}
                                expanded={expandedComments.has(review.id)}
                                onToggleComments={toggleComments}
                                comments={comments[review.id]}
                                commentText={commentTexts[review.id] || ''}
                                onCommentTextChange={(v) => setCommentTexts(t => ({ ...t, [review.id]: v }))}
                                onAddComment={handleAddComment}
                                commentSaving={!!commentSaving[review.id]}
                                editingComment={editingComment}
                                editCommentText={editCommentText}
                                onStartEditComment={(cm) => { setEditingComment(cm.id); setEditCommentText(cm.content); }}
                                onEditCommentTextChange={setEditCommentText}
                                onUpdateComment={handleUpdateComment}
                                onCancelEditComment={() => setEditingComment(null)}
                                onDeleteComment={handleDeleteComment}
                            />
                        ))}

                        {page < totalPage && (
                            <Box sx={{ textAlign: 'center', mt: 1 }}>
                                <Button onClick={() => loadReviews(page + 1)} disabled={loadingMore}
                                    variant="outlined" sx={{ borderRadius: 2, px: 4 }}>
                                    {loadingMore ? <CircularProgress size={18} /> : `후기 더 보기`}
                                </Button>
                            </Box>
                        )}
                    </Stack>
                )}
            </Box>

            {/* 후기 작성/수정 다이얼로그 */}
            <ReviewWriteDialog
                open={writeOpen}
                onClose={closeWrite}
                editTarget={editTarget}
                form={form}
                setForm={setForm}
                pendingImages={pendingImages}
                imageInputRef={imageInputRef}
                onAddImages={handleAddPendingImages}
                onRemoveImage={(tempId) => {
                    setPendingImages(ps => {
                        const t = ps.find(f => f.tempId === tempId);
                        if (t) URL.revokeObjectURL(t.previewUrl);
                        return ps.filter(f => f.tempId !== tempId);
                    });
                }}
                onSave={handleSave}
                saving={saving}
                userName={user?.name}
            />

            <Snackbar open={snack.open} autoHideDuration={2500}
                onClose={() => setSnack(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity={snack.severity} variant="filled">{snack.msg}</Alert>
            </Snackbar>
        </Box>
    );
});

export default ReviewSection;

/* ═══════════════════════════════════════════════
   후기 카드
═══════════════════════════════════════════════ */
function ReviewCard({
    review, productId, isAuthenticated, isAdmin, currentUserLoginId,
    onEdit, onDelete, expanded, onToggleComments,
    comments, commentText, onCommentTextChange,
    onAddComment, commentSaving,
    editingComment, editCommentText,
    onStartEditComment, onEditCommentTextChange,
    onUpdateComment, onCancelEditComment, onDeleteComment,
}) {
    const isOwner = isAuthenticated && review.userName && currentUserLoginId;
    const canManage = isAdmin || isOwner;
    const [imgOpen, setImgOpen] = useState(null);

    return (
        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
            {/* 카드 헤더 */}
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between"
                sx={{ px: 2.5, pt: 2, pb: 1 }}>
                <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap" useFlexGap>
                    <Avatar sx={{ width: 34, height: 34, bgcolor: '#e3f2fd', color: '#1565c0', fontSize: '0.9rem', fontWeight: 700 }}>
                        {review.userName?.[0] ?? '?'}
                    </Avatar>
                    <Box>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="body2" fontWeight={700}>{maskName(review.userName)}</Typography>
                            <Chip
                                label={`${WRITER_TYPE_ICON[review.writerType] ?? ''} ${WRITER_TYPE_LABEL[review.writerType] ?? review.writerType}`}
                                size="small"
                                color={WRITER_TYPE_COLOR[review.writerType] ?? 'default'}
                                sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.3 }}>
                            <Rating value={review.rating} readOnly size="small" />
                            <Typography variant="caption" color="text.secondary">
                                {review.createdAt?.slice(0, 10)}
                            </Typography>
                        </Stack>
                    </Box>
                </Stack>
                {canManage && (
                    <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                        {(isAdmin || isOwner) && (
                            <IconButton size="small" onClick={() => onEdit(review)}>
                                <EditIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                        )}
                        <IconButton size="small" color="error" onClick={() => onDelete(review.id)}>
                            <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Stack>
                )}
            </Stack>

            {/* 후기 내용 */}
            <Box sx={{ px: 2.5, pb: 1.5 }}>
                <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                    {review.content}
                </Typography>
            </Box>

            {/* 이미지 */}
            {(review.images || []).length > 0 && (
                <Box sx={{ px: 2.5, pb: 2 }}>
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                        {review.images.map(img => (
                            <Box key={img.id} component="img"
                                src={`${IMG_BASE}${img.imagePath}`}
                                onClick={() => setImgOpen(`${IMG_BASE}${img.imagePath}`)}
                                sx={{ width: 90, height: 70, objectFit: 'cover', borderRadius: 1.5,
                                    cursor: 'pointer', transition: 'opacity 0.15s',
                                    '&:hover': { opacity: 0.85 } }} />
                        ))}
                    </Stack>
                </Box>
            )}

            {/* 댓글 토글 버튼 */}
            <Box sx={{ px: 2, pb: 1.5, borderTop: '1px solid', borderColor: 'divider', pt: 1 }}>
                <Button size="small" startIcon={<CommentIcon sx={{ fontSize: 15 }} />}
                    onClick={() => onToggleComments(review.id)}
                    sx={{ color: 'text.secondary', fontSize: '0.78rem' }}>
                    댓글 {review.commentCount}개 {expanded ? '▲' : '▼'}
                </Button>
            </Box>

            {/* 댓글 영역 */}
            <Collapse in={expanded}>
                <Box sx={{ px: 2.5, pb: 2, bgcolor: 'grey.50' }}>
                    {(comments || []).map(cm => (
                        <CommentItem
                            key={cm.id}
                            comment={cm}
                            reviewId={review.id}
                            isAdmin={isAdmin}
                            currentUserLoginId={currentUserLoginId}
                            isAuthenticated={isAuthenticated}
                            editingComment={editingComment}
                            editCommentText={editCommentText}
                            onStartEdit={onStartEditComment}
                            onEditTextChange={onEditCommentTextChange}
                            onUpdate={onUpdateComment}
                            onCancelEdit={onCancelEditComment}
                            onDelete={onDeleteComment}
                        />
                    ))}
                    {!comments && (
                        <Box sx={{ py: 2, textAlign: 'center' }}><CircularProgress size={18} /></Box>
                    )}
                    {isAuthenticated && (
                        <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                            <TextField
                                size="small" fullWidth
                                placeholder="댓글을 입력하세요"
                                value={commentText}
                                onChange={e => onCommentTextChange(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onAddComment(review.id); } }}
                                sx={{ bgcolor: '#fff', borderRadius: 1 }}
                            />
                            <Button variant="contained" size="small" endIcon={<SendIcon />}
                                disabled={commentSaving || !commentText?.trim()}
                                onClick={() => onAddComment(review.id)}
                                sx={{ flexShrink: 0, borderRadius: 1.5 }}>
                                등록
                            </Button>
                        </Stack>
                    )}
                </Box>
            </Collapse>

            {/* 이미지 확대 다이얼로그 */}
            <Dialog open={!!imgOpen} onClose={() => setImgOpen(null)} maxWidth="md">
                <DialogContent sx={{ p: 0, position: 'relative' }}>
                    <IconButton size="small" onClick={() => setImgOpen(null)}
                        sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.5)', color: '#fff', zIndex: 1 }}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                    {imgOpen && <Box component="img" src={imgOpen} sx={{ maxWidth: '90vw', maxHeight: '80vh', display: 'block' }} />}
                </DialogContent>
            </Dialog>
        </Box>
    );
}

/* ═══════════════════════════════════════════════
   댓글 아이템
═══════════════════════════════════════════════ */
function CommentItem({
    comment, reviewId, isAdmin, isAuthenticated,
    editingComment, editCommentText,
    onStartEdit, onEditTextChange, onUpdate, onCancelEdit, onDelete,
}) {
    const isCommentAdmin = comment.userRole === 'ADMIN';

    if (editingComment === comment.id) {
        return (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ py: 1 }}>
                <TextField size="small" fullWidth value={editCommentText}
                    onChange={e => onEditTextChange(e.target.value)}
                    sx={{ bgcolor: '#fff' }} />
                <Button size="small" variant="contained" onClick={() => onUpdate(reviewId, comment.id)}
                    sx={{ flexShrink: 0 }}>수정</Button>
                <Button size="small" onClick={onCancelEdit} sx={{ flexShrink: 0 }}>취소</Button>
            </Stack>
        );
    }

    return (
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between"
            sx={{ py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" spacing={1} alignItems="flex-start">
                <Avatar sx={{ width: 26, height: 26, fontSize: '0.7rem', flexShrink: 0,
                    bgcolor: isCommentAdmin ? '#1976d2' : '#e0e0e0',
                    color: isCommentAdmin ? '#fff' : '#555' }}>
                    {isCommentAdmin ? '관' : comment.userName?.[0] ?? '?'}
                </Avatar>
                <Box>
                    <Stack direction="row" alignItems="center" spacing={0.75}>
                        <Typography variant="caption" fontWeight={700}>{comment.userName}</Typography>
                        {isCommentAdmin && (
                            <Chip label="관리자" size="small" color="primary"
                                sx={{ height: 16, fontSize: '0.65rem', '& .MuiChip-label': { px: 0.5 } }} />
                        )}
                        <Typography variant="caption" color="text.disabled">
                            {comment.createdAt?.slice(0, 10)}
                        </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.primary" sx={{ mt: 0.3, lineHeight: 1.6 }}>
                        {comment.content}
                    </Typography>
                </Box>
            </Stack>
            {isAuthenticated && (isAdmin || comment.userRole !== 'ADMIN') && (
                <Stack direction="row" spacing={0.3} sx={{ flexShrink: 0 }}>
                    <IconButton size="small" onClick={() => onStartEdit(comment)} sx={{ p: '2px' }}>
                        <EditIcon sx={{ fontSize: 13 }} />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => onDelete(reviewId, comment.id)} sx={{ p: '2px' }}>
                        <DeleteIcon sx={{ fontSize: 13 }} />
                    </IconButton>
                </Stack>
            )}
        </Stack>
    );
}

/* ═══════════════════════════════════════════════
   후기 작성/수정 다이얼로그
═══════════════════════════════════════════════ */
function ReviewWriteDialog({ open, onClose, editTarget, form, setForm, pendingImages, imageInputRef, onAddImages, onRemoveImage, onSave, saving, userName }) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
            PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ fontWeight: 800 }}>
                {editTarget ? '후기 수정' : '후기 작성'}
            </DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2.5}>
                    {/* 작성자 */}
                    <Alert severity="info" sx={{ py: 0.5 }}>
                        작성자 이름은 등록 후 화면에 <strong>{maskName(userName)}</strong> 형식으로 표시됩니다.
                    </Alert>
                    <TextField
                        label="작성자"
                        size="small"
                        fullWidth
                        value={userName ?? ''}
                        InputProps={{ readOnly: true }}
                        helperText="로그인 정보에서 자동으로 불러옵니다."
                        sx={{ bgcolor: '#f8f9fa' }}
                    />
                    {/* 작성자 유형 */}
                    <FormControl size="small" fullWidth>
                        <InputLabel>작성자 유형</InputLabel>
                        <Select value={form.writerType} label="작성자 유형"
                            onChange={e => setForm(f => ({ ...f, writerType: e.target.value }))}>
                            <MenuItem value="GENERAL">👤 일반회원</MenuItem>
                            <MenuItem value="STUDENT">👨‍🎓 학생</MenuItem>
                            <MenuItem value="TEACHER">👨‍🏫 선생님</MenuItem>
                        </Select>
                    </FormControl>

                    {/* 별점 */}
                    <Box>
                        <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>별점</Typography>
                        <Rating
                            value={form.rating}
                            onChange={(_, v) => setForm(f => ({ ...f, rating: v ?? 1 }))}
                            size="large"
                        />
                    </Box>

                    {/* 내용 */}
                    <TextField label="후기 내용 *" multiline rows={4} fullWidth
                        value={form.content}
                        onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                        placeholder="여행 경험을 자유롭게 공유해주세요." />

                    {/* 이미지 (신규 작성시만) */}
                    {!editTarget && (
                        <Box>
                            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                                <Typography variant="body2" fontWeight={600}>
                                    이미지 ({pendingImages.length})
                                </Typography>
                                <Button size="small" startIcon={<PhotoCameraIcon />}
                                    onClick={() => imageInputRef.current?.click()}>
                                    사진 추가
                                </Button>
                                <input type="file" accept="image/*" multiple hidden
                                    ref={imageInputRef}
                                    onChange={e => { if (e.target.files?.length) onAddImages(e.target.files); e.target.value = ''; }} />
                            </Stack>
                            {pendingImages.length > 0 && (
                                <Stack direction="row" flexWrap="wrap" gap={1}>
                                    {pendingImages.map(f => (
                                        <Box key={f.tempId} sx={{ position: 'relative' }}>
                                            <Box component="img" src={f.previewUrl}
                                                sx={{ width: 80, height: 64, objectFit: 'cover', borderRadius: 1 }} />
                                            <IconButton size="small" color="error"
                                                sx={{ position: 'absolute', top: 1, right: 1, bgcolor: 'rgba(255,255,255,0.85)', p: '2px' }}
                                                onClick={() => onRemoveImage(f.tempId)}>
                                                <CloseIcon sx={{ fontSize: 12 }} />
                                            </IconButton>
                                        </Box>
                                    ))}
                                </Stack>
                            )}
                        </Box>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose}>취소</Button>
                <Button variant="contained" onClick={onSave} disabled={saving || !form.content.trim()}>
                    {saving ? '저장 중...' : editTarget ? '수정' : '등록'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
