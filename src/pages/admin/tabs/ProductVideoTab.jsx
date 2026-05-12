import { useState, useEffect } from 'react';
import {
    Box, Button, Typography, Stack, Alert,
    TextField, CircularProgress, Divider
} from '@mui/material';
import * as api from '../../../api/productApi';

const getYoutubeEmbedUrl = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
};

export default function ProductVideoTab({ productId, onUpdate, isEdit, onComplete }) {
    const [youtubeUrl,   setYoutubeUrl]   = useState('');
    const [currentVideo, setCurrentVideo] = useState(null);
    const [loading,      setLoading]      = useState(false);
    const [error,        setError]        = useState('');
    const [success,      setSuccess]      = useState('');
    const [showChange,   setShowChange]   = useState(false);
    const [videoSaved,   setVideoSaved]   = useState(false);

    const loadVideo = async () => {
        try {
            const data = await api.getProduct(productId);
            setCurrentVideo({ videoUrl: data.videoUrl });
            if (data.videoUrl) setYoutubeUrl(data.videoUrl);
        } catch {
            setError('동영상 정보를 불러오지 못했습니다.');
        }
    };

    useEffect(() => { loadVideo(); }, [productId]);

    const handleSave = async () => {
        if (!youtubeUrl.trim()) { setError('유튜브 URL을 입력해주세요.'); return; }
        if (!getYoutubeEmbedUrl(youtubeUrl)) { setError('올바른 유튜브 URL을 입력해주세요.'); return; }
        setLoading(true);
        try {
            await api.updateProductVideoUrl(productId, youtubeUrl.trim());
            setShowChange(false);
            await loadVideo();
            onUpdate?.();
            setVideoSaved(true);
            if (onComplete) setTimeout(() => onComplete(), 1500);
        } catch {
            setError('저장에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('동영상을 삭제하시겠습니까?')) return;
        setLoading(true);
        try {
            await api.deleteProductVideo(productId);
            setCurrentVideo({ videoUrl: null });
            setYoutubeUrl('');
            setSuccess('동영상이 삭제되었습니다.');
            onUpdate?.();
        } catch {
            setError('삭제에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const embedUrl = getYoutubeEmbedUrl(currentVideo?.videoUrl);

    return (
        <Box>
            {error   && <Alert severity="error"   onClose={() => setError('')}   sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>{success}</Alert>}
            {videoSaved && (
                <Alert severity="success" onClose={() => setVideoSaved(false)} sx={{ mb: 2 }}>
                    {isEdit ? (
                        <>
                            유튜브 동영상을 저장하였습니다.&nbsp;
                            <strong>[기본정보]&nbsp;[일정 정보]&nbsp;[메인화면 썸네일 이미지]&nbsp;[첨부파일]</strong>
                            &nbsp;더 이상 수정하실 게 없으면 <strong>수정완료</strong> 버튼을 클릭해주세요.
                        </>
                    ) : (
                        '유튜브 URL이 저장되었습니다.'
                    )}
                </Alert>
            )}
            {loading && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <CircularProgress size={18} />
                    <Typography variant="caption">처리 중...</Typography>
                </Box>
            )}

            {/* 현재 등록된 동영상 */}
            {embedUrl && (
                <Box mb={3}>
                    <Typography variant="subtitle2" color="text.secondary" fontWeight={600} mb={1.5}>
                        현재 등록된 유튜브 동영상
                    </Typography>
                    <Box sx={{ width: '100%', maxWidth: 480, aspectRatio: '16/9' }}>
                        <iframe
                            width="100%" height="100%"
                            src={embedUrl}
                            title="유튜브 동영상 미리보기"
                            frameBorder="0"
                            allowFullScreen
                            style={{ borderRadius: 8, display: 'block' }}
                        />
                    </Box>
                    <Button variant="outlined" color="error" size="small" sx={{ mt: 1 }} onClick={handleDelete} disabled={loading}>
                        동영상 삭제
                    </Button>
                </Box>
            )}

            <Divider sx={{ my: 2 }} />

            {/* 유튜브 URL 입력 */}
            {embedUrl && !showChange ? (
                <Button variant="outlined" size="small" onClick={() => setShowChange(true)}>
                    URL 변경
                </Button>
            ) : (
                <Box>
                    <Typography variant="subtitle2" color="text.secondary" fontWeight={600} mb={2}>
                        유튜브 URL {embedUrl ? '변경' : '등록'} (선택)
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="flex-start">
                        <TextField
                            label="유튜브 URL"
                            value={youtubeUrl}
                            onChange={(e) => setYoutubeUrl(e.target.value)}
                            placeholder="예) https://www.youtube.com/watch?v=xxxxxxx"
                            fullWidth
                            size="small"
                            helperText="유튜브에 업로드한 영상의 URL을 붙여넣으세요. 등록하지 않아도 됩니다."
                        />
                        <Stack direction="row" spacing={1} sx={{ mt: 0.3 }}>
                            <Button variant="contained" onClick={handleSave} disabled={loading} sx={{ whiteSpace: 'nowrap' }}>
                                저장
                            </Button>
                            {embedUrl && (
                                <Button variant="outlined" onClick={() => setShowChange(false)} sx={{ whiteSpace: 'nowrap' }}>
                                    취소
                                </Button>
                            )}
                        </Stack>
                    </Stack>

                    {/* 입력 URL 미리보기 */}
                    {getYoutubeEmbedUrl(youtubeUrl) && youtubeUrl !== currentVideo?.videoUrl && (
                        <Box mt={2}>
                            <Typography variant="caption" color="text.secondary" mb={0.5} display="block">미리보기</Typography>
                            <Box sx={{ width: '100%', maxWidth: 480, aspectRatio: '16/9' }}>
                                <iframe
                                    width="100%" height="100%"
                                    src={getYoutubeEmbedUrl(youtubeUrl)}
                                    title="미리보기"
                                    frameBorder="0"
                                    allowFullScreen
                                    style={{ borderRadius: 8, display: 'block' }}
                                />
                            </Box>
                        </Box>
                    )}
                </Box>
            )}

            {/* 등록 모드: 건너뛰기 버튼 */}
            {onComplete && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', pr: 9, mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Button variant="contained" onClick={onComplete}>
                        다음 (첨부파일) →
                    </Button>
                </Box>
            )}
        </Box>
    );
}
