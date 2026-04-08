import { useState, useEffect } from 'react';
import {
    Box, Button, Typography, Stack, Alert,
    TextField, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel,
    CircularProgress, Divider
} from '@mui/material';
import * as api from '../../../api/productApi';

const getYoutubeEmbedUrl = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
};

export default function ProductVideoTab({ productId, onUpdate }) {
    const [videoType,    setVideoType]    = useState('youtube'); // 'youtube' | 'local'
    const [youtubeUrl,   setYoutubeUrl]   = useState('');
    const [currentVideo, setCurrentVideo] = useState(null); // { videoPath, videoUrl }
    const [loading,      setLoading]      = useState(false);
    const [error,        setError]        = useState('');
    const [success,      setSuccess]      = useState('');

    /* 현재 상품의 동영상 정보 로드 */
    const loadVideo = async () => {
        try {
            const data = await api.getProduct(productId);
            setCurrentVideo({ videoPath: data.videoPath, videoUrl: data.videoUrl });
            if (data.videoUrl) {
                setYoutubeUrl(data.videoUrl);
                setVideoType('youtube');
            } else if (data.videoPath) {
                setVideoType('local');
            }
        } catch {
            setError('동영상 정보를 불러오지 못했습니다.');
        }
    };

    useEffect(() => { loadVideo(); }, [productId]);

    /* 유튜브 URL 저장 */
    const handleSaveYoutube = async () => {
        if (!youtubeUrl.trim()) { setError('유튜브 URL을 입력해주세요.'); return; }
        if (!getYoutubeEmbedUrl(youtubeUrl)) { setError('올바른 유튜브 URL을 입력해주세요.'); return; }
        setLoading(true);
        try {
            await api.updateProductVideoUrl(productId, youtubeUrl.trim());
            setSuccess('유튜브 URL이 저장되었습니다.');
            await loadVideo();
            onUpdate?.();
        } catch {
            setError('저장에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    /* 로컬 동영상 업로드 */
    const handleLocalUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setLoading(true);
        try {
            await api.uploadProductVideo(productId, file);
            setSuccess('동영상이 업로드되었습니다.');
            await loadVideo();
            onUpdate?.();
        } catch {
            setError('동영상 업로드에 실패했습니다.');
        } finally {
            setLoading(false);
            e.target.value = '';
        }
    };

    /* 동영상 삭제 */
    const handleDelete = async () => {
        if (!window.confirm('동영상을 삭제하시겠습니까?')) return;
        setLoading(true);
        try {
            await api.deleteProductVideo(productId);
            setCurrentVideo({ videoPath: null, videoUrl: null });
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
            {loading && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <CircularProgress size={18} />
                    <Typography variant="caption">처리 중...</Typography>
                </Box>
            )}

            {/* ── 현재 동영상 미리보기 ── */}
            {(currentVideo?.videoUrl || currentVideo?.videoPath) && (
                <Box mb={3}>
                    <Typography variant="subtitle2" color="text.secondary" fontWeight={600} mb={1.5}>
                        현재 동영상
                    </Typography>
                    {embedUrl ? (
                        <Box>
                            <iframe
                                width="480" height="270"
                                src={embedUrl}
                                title="동영상 미리보기"
                                frameBorder="0"
                                allowFullScreen
                                style={{ borderRadius: 8 }}
                            />
                        </Box>
                    ) : currentVideo?.videoPath ? (
                        <Box>
                            <video
                                width="480" height="270" controls
                                src={`http://localhost:8080${currentVideo.videoPath}`}
                                style={{ borderRadius: 8 }}
                            />
                        </Box>
                    ) : null}
                    <Button variant="outlined" color="error" size="small" sx={{ mt: 1 }} onClick={handleDelete} disabled={loading}>
                        동영상 삭제
                    </Button>
                </Box>
            )}

            <Divider sx={{ my: 2 }} />

            {/* ── 동영상 등록 ── */}
            <Box>
                <Typography variant="subtitle2" color="text.secondary" fontWeight={600} mb={2}>
                    동영상 {currentVideo?.videoUrl || currentVideo?.videoPath ? '교체' : '등록'}
                </Typography>

                <FormControl>
                    <FormLabel>방식 선택</FormLabel>
                    <RadioGroup row value={videoType} onChange={(e) => setVideoType(e.target.value)}>
                        <FormControlLabel value="youtube" control={<Radio />} label="유튜브 URL (본인 채널)" />
                        <FormControlLabel value="local"   control={<Radio />} label="로컬 파일 업로드" />
                    </RadioGroup>
                </FormControl>

                {/* 유튜브 URL 입력 */}
                {videoType === 'youtube' && (
                    <Box mt={2}>
                        <Stack direction="row" spacing={1} alignItems="flex-start">
                            <TextField
                                label="유튜브 URL"
                                value={youtubeUrl}
                                onChange={(e) => setYoutubeUrl(e.target.value)}
                                placeholder="예) https://www.youtube.com/watch?v=xxxxxxx"
                                fullWidth
                                size="small"
                                helperText="본인 유튜브 채널에 업로드한 영상 URL을 입력하세요."
                            />
                            <Button variant="contained" onClick={handleSaveYoutube} disabled={loading} sx={{ mt: 0.3, whiteSpace: 'nowrap' }}>
                                저장
                            </Button>
                        </Stack>
                        {/* 입력한 URL 미리보기 */}
                        {getYoutubeEmbedUrl(youtubeUrl) && (
                            <Box mt={2}>
                                <Typography variant="caption" color="text.secondary" mb={0.5} display="block">미리보기</Typography>
                                <iframe
                                    width="480" height="270"
                                    src={getYoutubeEmbedUrl(youtubeUrl)}
                                    title="미리보기"
                                    frameBorder="0"
                                    allowFullScreen
                                    style={{ borderRadius: 8 }}
                                />
                            </Box>
                        )}
                    </Box>
                )}

                {/* 로컬 파일 업로드 */}
                {videoType === 'local' && (
                    <Box mt={2}>
                        <Button variant="contained" component="label" disabled={loading}>
                            동영상 파일 선택
                            <input type="file" hidden accept="video/*" onChange={handleLocalUpload} />
                        </Button>
                        <Typography variant="caption" display="block" color="text.secondary" mt={0.5}>
                            MP4, MOV 권장 · 최대 200MB
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
}
