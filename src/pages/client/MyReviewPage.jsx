import React, { useEffect, useState, useRef } from 'react';
import {
    Box, Container, Typography, Stack, Button, Divider,
    Card, CardContent, Chip, Rating, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions,
    FormControl, InputLabel, Select, MenuItem, TextField,
    CircularProgress, Alert, Snackbar,
} from '@mui/material';
import CommonPagination from '../../components/CommonPagination';
import EditIcon   from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon    from '@mui/icons-material/Add';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CloseIcon  from '@mui/icons-material/Close';
import HomeIcon   from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';
import * as reviewApi from '../../api/reviewApi';
import { getProductsByCategory } from '../../api/clientApi';
import { useAuth } from '../../auth/AuthProvider';

const IMG_BASE = 'http://localhost:8080';
const WRITER_LABEL = { GENERAL: '일반회원', STUDENT: '학생', TEACHER: '선생님' };
const WRITER_ICON  = { GENERAL: '👤', STUDENT: '👨‍🎓', TEACHER: '👨‍🏫' };
const CATEGORIES = [
    { value: '국내여행',        label: '국내여행' },
    { value: '항공 해외여행',   label: '항공 해외여행' },
    { value: '크루즈 해외여행', label: '크루즈 해외여행' },
    { value: '수학여행',        label: '수학여행' },
];
const EMPTY_FORM = { writerType: 'GENERAL', rating: 5, content: '' };
const maskName = (name) => {
    if (!name) return '?';
    if (name.length === 1) return name;
    if (name.length === 2) return name[0] + '*';
    return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
};

export default function MyReviewPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [reviews,   setReviews]   = useState([]);
    const [page,      setPage]      = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const [total,     setTotal]     = useState(0);
    const [loading,   setLoading]   = useState(true);

    const [writeOpen,  setWriteOpen]  = useState(false);
    const [editTarget, setEditTarget] = useState(null);

    /* 2단계 셀렉트 */
    const [selectedCategory, setSelectedCategory] = useState('');
    const [products,         setProducts]         = useState([]);
    const [selectedProduct,  setSelectedProduct]  = useState('');
    const [productsLoading,  setProductsLoading]  = useState(false);

    const [form,         setForm]         = useState(EMPTY_FORM);
    const [pendingImages, setPendingImages] = useState([]);
    const [saving,       setSaving]       = useState(false);
    const imageInputRef = useRef(null);

    const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
    const showSnack = (msg, severity = 'success') => setSnack({ open: true, msg, severity });

    useEffect(() => { loadMyReviews(); }, [page]);

    const loadMyReviews = async () => {
        setLoading(true);
        try {
            const res = await reviewApi.getMyReviews(page, 10);
            setReviews(res.list);
            setTotalPage(res.totalPage);
            setTotal(res.totalCount);
        } finally { setLoading(false); }
    };

    const handleCategoryChange = async (cat) => {
        setSelectedCategory(cat);
        setSelectedProduct('');
        setProducts([]);
        if (!cat) return;
        setProductsLoading(true);
        try { setProducts(await getProductsByCategory(cat)); }
        finally { setProductsLoading(false); }
    };

    const openWrite = () => {
        setEditTarget(null);
        setForm(EMPTY_FORM);
        setSelectedCategory('');
        setSelectedProduct('');
        setProducts([]);
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
        if (!editTarget && !selectedProduct) {
            showSnack('상품을 선택해주세요.', 'error');
            return;
        }
        setSaving(true);
        try {
            if (editTarget) {
                const updated = await reviewApi.updateReview(editTarget.productId, editTarget.id, form);
                setReviews(rs => rs.map(r => r.id === editTarget.id
                    ? { ...updated, images: r.images, productName: r.productName } : r));
                showSnack('후기가 수정되었습니다.');
            } else {
                const created = await reviewApi.createReview(selectedProduct, form);
                for (const pf of pendingImages) {
                    const fd = new FormData();
                    fd.append('file', pf.file);
                    await reviewApi.uploadReviewImage(selectedProduct, created.id, fd);
                    URL.revokeObjectURL(pf.previewUrl);
                }
                setPendingImages([]);
                setTotal(t => t + 1);
                if (page === 1) loadMyReviews();
                showSnack('후기가 등록되었습니다.');
            }
            setWriteOpen(false);
        } catch { showSnack('저장 중 오류가 발생했습니다.', 'error'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (review) => {
        if (!window.confirm('이 후기를 삭제하시겠습니까?')) return;
        try {
            await reviewApi.deleteReview(review.productId, review.id);
            setReviews(rs => rs.filter(r => r.id !== review.id));
            setTotal(t => Math.max(0, t - 1));
            showSnack('후기가 삭제되었습니다.');
        } catch { showSnack('삭제 중 오류가 발생했습니다.', 'error'); }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                <Box>
                    <Button
                        size="small"
                        startIcon={<HomeIcon />}
                        onClick={() => { navigate('/'); window.scrollTo(0, 0); }}
                        sx={{ mb: 0.5, color: 'text.secondary', fontWeight: 500 }}
                    >
                        홈으로
                    </Button>
                    <Typography variant="h5" fontWeight={800}>내 후기 관리</Typography>
                    <Typography variant="body2" color="text.secondary">총 {total}개의 후기</Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={openWrite}
                    sx={{ borderRadius: 2 }}>
                    후기 작성
                </Button>
            </Stack>

            {loading ? (
                <Box sx={{ py: 8, textAlign: 'center' }}><CircularProgress /></Box>
            ) : reviews.length === 0 ? (
                <Box sx={{ py: 8, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
                    <Typography color="text.disabled" sx={{ mb: 2 }}>아직 작성한 후기가 없습니다.</Typography>
                    <Button variant="outlined" startIcon={<AddIcon />} onClick={openWrite}>첫 후기 작성하기</Button>
                </Box>
            ) : (
                <Stack spacing={2}>
                    {reviews.map(review => (
                        <Card key={review.id} variant="outlined" sx={{ borderRadius: 2 }}>
                            <CardContent>
                                <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                                    <Box sx={{ flex: 1 }}>
                                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.75 }}>
                                            <Chip label={review.productName} size="small"
                                                sx={{ bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 600 }} />
                                            <Chip
                                                label={`${WRITER_ICON[review.writerType]} ${WRITER_LABEL[review.writerType]}`}
                                                size="small" variant="outlined" />
                                            <Chip
                                                label={maskName(review.userName)}
                                                size="small"
                                                sx={{ bgcolor: '#f3e5f5', color: '#6a1b9a', fontWeight: 600 }}
                                            />
                                        </Stack>
                                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                                            <Rating value={review.rating} readOnly size="small" />
                                            <Typography variant="caption" color="text.secondary">
                                                {review.createdAt?.slice(0, 10)}
                                            </Typography>
                                        </Stack>
                                        <Typography variant="body2" color="text.primary"
                                            sx={{ lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                                            {review.content}
                                        </Typography>
                                        {(review.images || []).length > 0 && (
                                            <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1.5 }}>
                                                {review.images.map(img => (
                                                    <Box key={img.id} component="img"
                                                        src={`${IMG_BASE}${img.imagePath}`}
                                                        sx={{ width: 72, height: 56, objectFit: 'cover', borderRadius: 1 }} />
                                                ))}
                                            </Stack>
                                        )}
                                    </Box>
                                    <Stack direction="row" spacing={0.5} sx={{ ml: 1, flexShrink: 0 }}>
                                        <IconButton size="small" onClick={() => openEdit(review)}>
                                            <EditIcon sx={{ fontSize: 17 }} />
                                        </IconButton>
                                        <IconButton size="small" color="error" onClick={() => handleDelete(review)}>
                                            <DeleteIcon sx={{ fontSize: 17 }} />
                                        </IconButton>
                                    </Stack>
                                </Stack>
                            </CardContent>
                        </Card>
                    ))}

                    {totalPage > 1 && (
                        <CommonPagination count={totalPage} page={page}
                            onChange={(_, v) => setPage(v)} />
                    )}
                </Stack>
            )}

            {/* 작성/수정 다이얼로그 */}
            <Dialog open={writeOpen} onClose={closeWrite} maxWidth="sm" fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle fontWeight={800}>{editTarget ? '후기 수정' : '후기 작성'}</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2.5}>
                        {/* 신규 작성: 2단계 상품 선택 */}
                        {!editTarget && (
                            <>
                                <FormControl size="small" fullWidth>
                                    <InputLabel>카테고리 선택</InputLabel>
                                    <Select value={selectedCategory} label="카테고리 선택"
                                        onChange={e => handleCategoryChange(e.target.value)}>
                                        {CATEGORIES.map(c => (
                                            <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl size="small" fullWidth disabled={!selectedCategory || productsLoading}>
                                    <InputLabel>상품 선택</InputLabel>
                                    <Select value={selectedProduct} label="상품 선택"
                                        onChange={e => setSelectedProduct(e.target.value)}>
                                        {productsLoading ? (
                                            <MenuItem disabled>불러오는 중...</MenuItem>
                                        ) : products.map(p => (
                                            <MenuItem key={p.productId} value={p.productId}>
                                                {p.productName}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <Divider />
                            </>
                        )}

                        {/* 작성자 */}
                        <Alert severity="info" sx={{ py: 0.5 }}>
                            작성자 이름은 등록 후 화면에 <strong>{maskName(user?.name)}</strong> 형식으로 표시됩니다.
                        </Alert>
                        <TextField
                            label="작성자"
                            size="small"
                            fullWidth
                            value={user?.name ?? ''}
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
                            <Rating value={form.rating} size="large"
                                onChange={(_, v) => setForm(f => ({ ...f, rating: v ?? 1 }))} />
                        </Box>

                        {/* 내용 */}
                        <TextField label="후기 내용 *" multiline rows={4} fullWidth
                            value={form.content}
                            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                            placeholder="예) 가이드분이 정말 친절하셨고 일정도 알차게 구성되어 있었어요. 숙박 시설도 깨끗하고 음식도 맛있었습니다. 다음에 또 이용하고 싶어요!" />

                        {/* 이미지 (신규만) */}
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
                                        onChange={e => { if (e.target.files?.length) handleAddPendingImages(e.target.files); e.target.value = ''; }} />
                                </Stack>
                                {pendingImages.length > 0 && (
                                    <Stack direction="row" flexWrap="wrap" gap={1}>
                                        {pendingImages.map(f => (
                                            <Box key={f.tempId} sx={{ position: 'relative' }}>
                                                <Box component="img" src={f.previewUrl}
                                                    sx={{ width: 80, height: 64, objectFit: 'cover', borderRadius: 1 }} />
                                                <IconButton size="small" color="error"
                                                    sx={{ position: 'absolute', top: 1, right: 1, bgcolor: 'rgba(255,255,255,0.85)', p: '2px' }}
                                                    onClick={() => {
                                                        setPendingImages(ps => {
                                                            const t = ps.find(x => x.tempId === f.tempId);
                                                            if (t) URL.revokeObjectURL(t.previewUrl);
                                                            return ps.filter(x => x.tempId !== f.tempId);
                                                        });
                                                    }}>
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
                    <Button onClick={closeWrite}>취소</Button>
                    <Button variant="contained" onClick={handleSave}
                        disabled={saving || !form.content.trim()}>
                        {saving ? '저장 중...' : editTarget ? '수정' : '등록'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snack.open} autoHideDuration={2500}
                onClose={() => setSnack(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity={snack.severity} variant="filled">{snack.msg}</Alert>
            </Snackbar>
        </Container>
    );
}
