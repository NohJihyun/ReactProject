import { useState, useEffect } from 'react';
import {
    Box, Button, Typography, Stack, Divider,
    IconButton, CircularProgress, Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import * as api from '../../../api/productApi';

import IMG_BASE from '../../../config/imageConfig';

/* ── 드래그 가능한 상세이미지 아이템 ── */
function SortableImage({ image, onDelete }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: image.id });

    return (
        <Box
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
                opacity: isDragging ? 0.5 : 1,
            }}
            sx={{ position: 'relative', width: 150, height: 150, flexShrink: 0 }}
        >
            {/* 드래그 핸들 */}
            <Box
                {...attributes}
                {...listeners}
                sx={{
                    position: 'absolute', top: 4, left: 4, zIndex: 1,
                    bgcolor: 'rgba(0,0,0,0.4)', borderRadius: 1,
                    cursor: 'grab', display: 'flex', p: '2px'
                }}
            >
                <DragIndicatorIcon sx={{ color: 'white', fontSize: 18 }} />
            </Box>

            <img
                src={`${IMG_BASE}${image.imagePath}`}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6, border: '1px solid #ddd' }}
            />

            <IconButton
                size="small" color="error"
                sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'white', '&:hover': { bgcolor: '#ffe0e0' } }}
                onClick={() => onDelete(image)}
            >
                <DeleteIcon fontSize="small" />
            </IconButton>
        </Box>
    );
}

/* ── 이미지 탭 메인 ── */
export default function ProductImageTab({ productId, onUpdate, onComplete }) {
    const [thumbnail,         setThumbnail]         = useState(null);
    const [details,           setDetails]           = useState([]);
    const [loading,           setLoading]           = useState(false);
    const [error,             setError]             = useState('');
    const [thumbSaved,        setThumbSaved]        = useState(false);  // 수정 모드
    const [detailSaved,       setDetailSaved]       = useState(false);  // 수정 모드
    const [registerThumbDone, setRegisterThumbDone] = useState(false);  // 등록 모드

    const loadImages = async () => {
        try {
            const images = await api.getProductImages(productId);
            setThumbnail(images.find(img => img.imageType === 'THUMBNAIL') ?? null);
            setDetails(images.filter(img => img.imageType === 'DETAIL'));
        } catch {
            setError('이미지 목록을 불러오지 못했습니다.');
        }
    };

    useEffect(() => { loadImages(); }, [productId]);

    /* 썸네일 업로드 */
    const handleThumbnailUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setLoading(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            fd.append('imageType', 'THUMBNAIL');
            await api.uploadProductImage(productId, fd);
            await loadImages();
            onUpdate?.();
            if (onComplete) setRegisterThumbDone(true);
            else            setThumbSaved(true);
        } catch {
            setError('썸네일 업로드에 실패했습니다.');
        } finally {
            setLoading(false);
            e.target.value = '';
        }
    };

    /* 상세이미지 업로드 (다중) */
    const handleDetailUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        setLoading(true);
        try {
            for (const file of files) {
                const fd = new FormData();
                fd.append('file', file);
                fd.append('imageType', 'DETAIL');
                await api.uploadProductImage(productId, fd);
            }
            await loadImages();
            onUpdate?.();
            if (onComplete) setTimeout(() => onComplete(), 1500);
            else            setDetailSaved(true);
        } catch {
            setError('이미지 업로드에 실패했습니다.');
        } finally {
            setLoading(false);
            e.target.value = '';
        }
    };

    /* 이미지 삭제 */
    const handleDelete = async (image) => {
        if (!window.confirm('이미지를 삭제하시겠습니까?')) return;
        try {
            await api.deleteProductImage(productId, image.id, image.imagePath);
            await loadImages();
            onUpdate?.();
        } catch {
            setError('이미지 삭제에 실패했습니다.');
        }
    };

    /* 드래그 종료 → 순서 저장 */
    const handleDragEnd = async (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIdx = details.findIndex(d => d.id === active.id);
        const newIdx = details.findIndex(d => d.id === over.id);
        const reordered = arrayMove(details, oldIdx, newIdx);
        setDetails(reordered);

        try {
            await api.updateImageOrder(productId, reordered.map((img, idx) => ({ id: img.id, sortOrder: idx })));
        } catch {
            setError('순서 변경 저장에 실패했습니다.');
        }
    };

    return (
        <Box>
            {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}

            {/* 등록 모드: 썸네일 완료 안내 */}
            {registerThumbDone && (
                <Alert severity="success" onClose={() => setRegisterThumbDone(false)} sx={{ mb: 2 }}>
                    썸네일 이미지가 업로드 되었습니다.&nbsp;
                    상세이미지를 추가 등록하려면 <strong>[이미지 추가 저장]</strong>을 클릭하세요.
                    추가 등록이 완료되면 자동으로 다음 탭으로 이동합니다.
                </Alert>
            )}

            {/* 수정 모드 알럿 */}
            {thumbSaved && (
                <Alert severity="success" onClose={() => setThumbSaved(false)} sx={{ mb: 2 }}>
                    썸네일 이미지를 저장하였습니다.&nbsp;
                    <strong>[기본정보]&nbsp;[일정 정보]&nbsp;[유튜브 동영상]&nbsp;[첨부파일]</strong>
                    &nbsp;더 이상 수정하실 게 없으면 <strong>수정완료</strong> 버튼을 클릭해주세요.
                </Alert>
            )}
            {detailSaved && (
                <Alert severity="success" onClose={() => setDetailSaved(false)} sx={{ mb: 2 }}>
                    이미지 추가 완료되었습니다.&nbsp;
                    <strong>[기본정보]&nbsp;[일정 정보]&nbsp;[유튜브 동영상]&nbsp;[첨부파일]</strong>
                    &nbsp;더 이상 수정하실 게 없으면 <strong>수정완료</strong> 버튼을 클릭해주세요.
                </Alert>
            )}
            {loading && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <CircularProgress size={18} />
                    <Typography variant="caption">처리 중...</Typography>
                </Box>
            )}

            {/* ── 썸네일 ── */}
            <Box mb={3}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight={600} mb={1.5}>
                    썸네일 (1장)
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
                    {thumbnail ? (
                        <Box sx={{ position: 'relative', width: 180, height: 180, flexShrink: 0 }}>
                            <img
                                src={`${IMG_BASE}${thumbnail.imagePath}`}
                                alt="썸네일"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8, border: '1px solid #ddd' }}
                            />
                            <IconButton
                                size="small" color="error"
                                sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'white', '&:hover': { bgcolor: '#ffe0e0' } }}
                                onClick={() => handleDelete(thumbnail)}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    ) : (
                        <Box sx={{
                            width: 180, height: 180, flexShrink: 0,
                            border: '2px dashed #ccc', borderRadius: 2,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb'
                        }}>
                            <Typography variant="caption">썸네일 없음</Typography>
                        </Box>
                    )}
                    <Box>
                        <Button variant="contained" component="label" disabled={loading}>
                            {thumbnail ? '썸네일 교체 저장' : '썸네일 업로드'}
                            <input type="file" hidden accept="image/*" onChange={handleThumbnailUpload} />
                        </Button>
                        <Typography variant="caption" display="block" color="text.secondary" mt={0.5}>
                            JPG, PNG, WEBP · 최대 5MB · 교체 시 기존 이미지 자동 삭제
                        </Typography>
                    </Box>
                </Stack>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* ── 상세이미지 ── */}
            <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                    <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                        상세이미지 ({details.length}장)
                        {details.length > 1 && (
                            <Typography component="span" variant="caption" color="text.disabled" ml={1}>
                                드래그로 순서 변경 가능
                            </Typography>
                        )}
                    </Typography>
                    <Button variant="contained" component="label" disabled={loading}>
                        이미지 추가 저장
                        <input type="file" hidden accept="image/*" multiple onChange={handleDetailUpload} />
                    </Button>
                </Stack>

                {details.length === 0 ? (
                    <Box sx={{
                        py: 5, textAlign: 'center', color: 'text.disabled',
                        border: '2px dashed #eee', borderRadius: 2
                    }}>
                        <Typography variant="body2">등록된 상세이미지가 없습니다.</Typography>
                    </Box>
                ) : (
                    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={details.map(d => d.id)} strategy={rectSortingStrategy}>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                                {details.map(image => (
                                    <SortableImage key={image.id} image={image} onDelete={handleDelete} />
                                ))}
                            </Box>
                        </SortableContext>
                    </DndContext>
                )}
            </Box>

            {/* 등록 모드: 다음 탭 이동 버튼 (항상 표시) */}
            {onComplete && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', pr: 9, mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Button variant="contained" onClick={onComplete}>
                        다음 (유튜브 동영상) →
                    </Button>
                </Box>
            )}
        </Box>
    );
}
