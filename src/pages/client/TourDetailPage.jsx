import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Container, Typography, Chip, Button, Skeleton,
    Stack, Divider, Tab, Tabs, IconButton,
} from '@mui/material';
import ArrowBackIcon       from '@mui/icons-material/ArrowBack';
import PeopleIcon          from '@mui/icons-material/People';
import GroupsIcon          from '@mui/icons-material/Groups';
import AttachMoneyIcon     from '@mui/icons-material/AttachMoney';
import PhoneIcon           from '@mui/icons-material/Phone';
import EmailIcon           from '@mui/icons-material/Email';
import AssignmentIcon      from '@mui/icons-material/Assignment';
import ImageIcon           from '@mui/icons-material/Image';
import PlayCircleIcon      from '@mui/icons-material/PlayCircle';
import DownloadIcon        from '@mui/icons-material/Download';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { getProductById, getProductImages, getProductFiles } from '../../api/clientApi';

const IMG_BASE = 'http://localhost:8080';

const CATEGORY_MAP = {
    school:   '수학여행',
    domestic: '국내여행',
    air:      '항공 해외여행',
    cruise:   '크루즈 해외여행',
};

const CONTACT_ITEMS = [
    { icon: <PhoneIcon fontSize="small" />,  label: '전화 문의하기',  value: '031-466-9600' },
    { icon: <EmailIcon fontSize="small" />,  label: '이메일 문의하기', value: 'with@rohitour.com' },
];

const INQUIRY_ACTION_BUTTONS = {
    school:  { icon: <AssignmentIcon fontSize="small" />, label: '입찰 견적 요청하기' },
    default: { icon: <AssignmentIcon fontSize="small" />, label: '상담 신청하기' },
};

const TRAVEL_TYPE_LABEL = {
    INDIVIDUAL: '개인/가족',
    GROUP:      '단체',
    BOTH:       '개인·단체',
};

const FILE_TYPE_COLOR = {
    PDF:   '#e53935',
    EXCEL: '#2e7d32',
    WORD:  '#1565c0',
    IMAGE: '#f57c00',
    ETC:   '#757575',
};

const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
};

const getYoutubeEmbedUrl = (url, autoplay = false) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (!match) return null;
    return `https://www.youtube.com/embed/${match[1]}${autoplay ? '?autoplay=1' : ''}`;
};

export default function TourDetailPage() {
    const { category, id } = useParams();
    const navigate = useNavigate();

    const [product,     setProduct]     = useState(null);
    const [images,      setImages]      = useState([]);
    const [files,       setFiles]       = useState([]);
    const [selectedImg, setSelectedImg] = useState(null);
    const [loading,     setLoading]     = useState(true);
    const [mediaTab,    setMediaTab]    = useState(0);

    useEffect(() => {
        Promise.all([getProductById(id), getProductImages(id), getProductFiles(id)])
            .then(([prod, imgs, fls]) => {
                setProduct(prod);
                setImages(imgs);
                setFiles(fls);
                const thumb = imgs.find(i => i.imageType === 'THUMBNAIL');
                setSelectedImg(thumb?.imagePath ?? prod?.thumbnailPath ?? null);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <Box sx={{ bgcolor: '#f7f8fc', minHeight: '100vh', py: 5 }}>
                <Container maxWidth="lg">
                    <Skeleton width={160} height={36} sx={{ mb: 3 }} />
                    <Skeleton variant="rectangular" width="100%" height={540} sx={{ borderRadius: 2.5 }} />
                </Container>
            </Box>
        );
    }

    if (!product) {
        return (
            <Box sx={{ bgcolor: '#f7f8fc', minHeight: '100vh', py: 5 }}>
                <Container maxWidth="lg">
                    <Typography color="text.secondary">상품을 찾을 수 없습니다.</Typography>
                    <Button onClick={() => navigate(`/tour/${category}`)} sx={{ mt: 2 }}>목록으로 돌아가기</Button>
                </Container>
            </Box>
        );
    }

    const hasVideo = !!(product.videoUrl || product.videoPath);
    const embedUrl = getYoutubeEmbedUrl(product.videoUrl, mediaTab === 1);
    const inquiryActionButton = INQUIRY_ACTION_BUTTONS[category] ?? INQUIRY_ACTION_BUTTONS.default;

    return (
        <Box sx={{ bgcolor: '#f7f8fc', minHeight: '100vh' }}>
            <Container maxWidth="lg" sx={{ py: 4 }}>

                {/* 뒤로가기 */}
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(`/tour/${category}`)}
                    sx={{ mb: 3, color: 'text.secondary' }}
                >
                    {CATEGORY_MAP[category] ?? '목록'} 목록으로
                </Button>

                {/* ── 흰 박스 ── */}
                <Box sx={{
                    bgcolor: '#fff',
                    borderRadius: 3,
                    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                    overflow: 'hidden',
                }}>

                    {/* 탭 */}
                    <Tabs
                        value={mediaTab}
                        onChange={(_, v) => setMediaTab(v)}
                        sx={{
                            borderBottom: '1px solid #f0f0f0',
                            px: 2,
                            '& .MuiTab-root': { fontWeight: 600, minHeight: 48 },
                            '& .Mui-selected': { color: '#1976d2' },
                            '& .MuiTabs-indicator': { bgcolor: '#1976d2' },
                        }}
                    >
                        <Tab icon={<ImageIcon fontSize="small" />} iconPosition="start" label="이미지" />
                        <Tab
                            icon={<PlayCircleIcon fontSize="small" />}
                            iconPosition="start"
                            label={hasVideo ? '동영상 ✓' : '동영상'}
                            disabled={!hasVideo}
                        />
                    </Tabs>

                    {/* ── 좌우 분할 ── */}
                    <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        minHeight: { md: 820 },
                    }}>

                        {/* ── 왼쪽: 미디어 ── */}
                        <Box sx={{
                            width: { xs: '100%', md: '55%' },
                            borderRight: { md: '1px solid #f0f0f0' },
                            borderBottom: { xs: '1px solid #f0f0f0', md: 'none' },
                            bgcolor: '#fafafa',
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1.5,
                        }}>

                            {/* 이미지 탭 */}
                            {mediaTab === 0 && (
                                <>
                                    {/* 메인 이미지 */}
                                    <Box sx={{
                                        width: '100%',
                                        height: { xs: 280, sm: 400, md: 580 },
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        bgcolor: '#efefef',
                                        flexShrink: 0,
                                    }}>
                                        {selectedImg ? (
                                            <img
                                                src={`${IMG_BASE}${selectedImg}`}
                                                alt={product.productName}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                            />
                                        ) : (
                                            <Box sx={{
                                                width: '100%', height: '100%',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: '#ccc', fontSize: 64,
                                            }}>
                                                🏞
                                            </Box>
                                        )}
                                    </Box>

                                    {/* 이미지 리스트 */}
                                    <Box>
                                        <Typography variant="caption" color="text.disabled"
                                            sx={{ display: 'block', mb: 1, fontWeight: 600, letterSpacing: 0.5 }}
                                        >
                                            이미지 목록 ({images.length})
                                        </Typography>

                                        {images.length > 0 ? (
                                            <Box sx={{
                                                display: 'flex',
                                                gap: 1,
                                                overflowX: 'auto',
                                                pb: 0.5,
                                                '&::-webkit-scrollbar': { height: 4 },
                                                '&::-webkit-scrollbar-thumb': { bgcolor: '#ddd', borderRadius: 2 },
                                            }}>
                                                {images.map(img => (
                                                    <Box
                                                        key={img.id}
                                                        onClick={() => setSelectedImg(img.imagePath)}
                                                        sx={{
                                                            width: 90, height: 90,
                                                            borderRadius: 1.5,
                                                            overflow: 'hidden',
                                                            cursor: 'pointer',
                                                            flexShrink: 0,
                                                            border: selectedImg === img.imagePath
                                                                ? '2.5px solid #1976d2'
                                                                : '2.5px solid #e0e0e0',
                                                            transition: 'border-color 0.15s, opacity 0.15s',
                                                            opacity: selectedImg === img.imagePath ? 1 : 0.75,
                                                            '&:hover': { border: '2.5px solid #1976d2', opacity: 1 },
                                                        }}
                                                    >
                                                        <img
                                                            src={`${IMG_BASE}${img.imagePath}`}
                                                            alt=""
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                                        />
                                                    </Box>
                                                ))}
                                            </Box>
                                        ) : (
                                            <Box sx={{
                                                display: 'flex', alignItems: 'center', gap: 1.5,
                                                px: 2, py: 1.5,
                                                borderRadius: 1.5,
                                                border: '1px dashed #e0e0e0',
                                                bgcolor: '#f9f9f9',
                                            }}>
                                                <Box sx={{
                                                    width: 32, height: 32, borderRadius: 1,
                                                    bgcolor: '#efefef',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: 16,
                                                }}>
                                                    🖼
                                                </Box>
                                                <Typography variant="caption" color="text.disabled">
                                                    등록된 이미지가 없습니다
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>

                                    {/* 문의 정보 — 이미지 탭 */}
                                    <Stack spacing={1.5} sx={{ mt: 1.5 }}>
                                        {CONTACT_ITEMS.map(item => (
                                            <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 0.5 }}>
                                                <Box sx={{ color: '#1976d2', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                                                    {item.icon}
                                                </Box>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1.3 }}>
                                                        {item.label}
                                                    </Typography>
                                                    <Typography fontWeight={700} variant="body2">
                                                        {item.value}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        ))}
                                        <Button
                                            variant="contained"
                                            fullWidth
                                            sx={{
                                                bgcolor: '#1976d2',
                                                '&:hover': { bgcolor: '#1565c0' },
                                                py: 1.2, borderRadius: 2,
                                                fontWeight: 700,
                                                boxShadow: '0 3px 10px rgba(25,118,210,0.25)',
                                                mt: 0.5,
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {inquiryActionButton.icon}
                                                <span>{inquiryActionButton.label}</span>
                                            </Box>
                                        </Button>
                                    </Stack>
                                </>
                            )}

                            {/* 동영상 탭 */}
                            {mediaTab === 1 && hasVideo && (
                                <>
                                    <Box sx={{
                                        width: '100%',
                                        height: { xs: 300, sm: 420, md: 640 },
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        flexShrink: 0,
                                    }}>
                                        {embedUrl ? (
                                            <iframe
                                                key="yt-player"
                                                width="100%"
                                                height="100%"
                                                src={embedUrl}
                                                title="동영상"
                                                frameBorder="0"
                                                allow="autoplay; encrypted-media"
                                                allowFullScreen
                                                style={{ display: 'block' }}
                                            />
                                        ) : product.videoPath ? (
                                            <video
                                                key="local-player"
                                                width="100%"
                                                height="100%"
                                                controls
                                                autoPlay
                                                src={`${IMG_BASE}${product.videoPath}`}
                                                style={{ display: 'block', objectFit: 'cover' }}
                                            />
                                        ) : null}
                                    </Box>

                                    {/* 문의 정보 — 동영상 탭 */}
                                    <Stack spacing={1.5} sx={{ mt: 1.5 }}>
                                        {CONTACT_ITEMS.map(item => (
                                            <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 0.5 }}>
                                                <Box sx={{ color: '#1976d2', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                                                    {item.icon}
                                                </Box>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1.3 }}>
                                                        {item.label}
                                                    </Typography>
                                                    <Typography fontWeight={700} variant="body2">
                                                        {item.value}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        ))}
                                        <Button
                                            variant="contained"
                                            fullWidth
                                            sx={{
                                                bgcolor: '#1976d2',
                                                '&:hover': { bgcolor: '#1565c0' },
                                                py: 1.2, borderRadius: 2,
                                                fontWeight: 700,
                                                boxShadow: '0 3px 10px rgba(25,118,210,0.25)',
                                                mt: 0.5,
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {inquiryActionButton.icon}
                                                <span>{inquiryActionButton.label}</span>
                                            </Box>
                                        </Button>
                                    </Stack>
                                </>
                            )}
                        </Box>

                        {/* ── 오른쪽: 정보 ── */}
                        <Box sx={{
                            width: { xs: '100%', md: '45%' },
                            p: { xs: 2.5, md: 3.5 },
                            display: 'flex',
                            flexDirection: 'column',
                            overflowY: 'auto',
                            maxHeight: { md: 860 },
                        }}>
                            {/* 카테고리 뱃지 */}
                            <Chip
                                label={CATEGORY_MAP[category] ?? ''}
                                size="small"
                                sx={{ mb: 1.5, alignSelf: 'flex-start', bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 600 }}
                            />

                            {/* 상품명 */}
                            <Typography variant="h5" fontWeight={800}
                                sx={{ lineHeight: 1.35, fontSize: { xs: '1.2rem', md: '1.4rem' }, mb: 0.5 }}
                            >
                                {product.productName}
                            </Typography>

                            {/* 부제목 */}
                            {product.productSubname && (
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                                    {product.productSubname}
                                </Typography>
                            )}

                            <Divider sx={{ my: 2 }} />

                            {/* 가격 */}
                            {product.pricePerPerson && (
                                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                                    <AttachMoneyIcon sx={{ color: '#1976d2', fontSize: 20 }} />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" display="block">참고 가격</Typography>
                                        <Typography fontWeight={800} color="#1976d2"
                                            sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}
                                        >
                                            {Number(product.pricePerPerson).toLocaleString('ko-KR')}원~
                                        </Typography>
                                    </Box>
                                </Stack>
                            )}

                            {/* 인원 / 여행유형 */}
                            <Stack spacing={1} mb={2}>
                                {(product.minPeople || product.maxPeople) && (
                                    <Stack direction="row" alignItems="center" spacing={1.5}>
                                        <PeopleIcon sx={{ color: '#bbb', fontSize: 18 }} />
                                        <Typography variant="body2">
                                            {product.minPeople && `최소 ${product.minPeople}인`}
                                            {product.minPeople && product.maxPeople && ' · '}
                                            {product.maxPeople && `최대 ${product.maxPeople}인`}
                                        </Typography>
                                    </Stack>
                                )}
                                {product.travelType && (
                                    <Stack direction="row" alignItems="center" spacing={1.5}>
                                        <GroupsIcon sx={{ color: '#bbb', fontSize: 18 }} />
                                        <Typography variant="body2">{TRAVEL_TYPE_LABEL[product.travelType]}</Typography>
                                    </Stack>
                                )}
                            </Stack>

                            <Divider sx={{ my: 2 }} />

                            {/* 요약 */}
                            {product.summary && (
                                <Typography variant="body2" color="text.secondary"
                                    sx={{ lineHeight: 1.9, mb: 2 }}
                                >
                                    {product.summary}
                                </Typography>
                            )}

                            {/* 상세 설명 */}
                            {product.description && (
                                <>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>상세 내용</Typography>
                                    <Typography variant="body2" color="text.secondary"
                                        sx={{ lineHeight: 1.9, whiteSpace: 'pre-line' }}
                                    >
                                        {product.description}
                                    </Typography>
                                </>
                            )}

                            {/* 첨부파일 */}
                            {files.length > 0 && (
                                <>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="body2" fontWeight={700} sx={{ mb: 1.5 }}>
                                        첨부파일 ({files.length})
                                    </Typography>
                                    <Stack spacing={1}>
                                        {files.map(file => (
                                            <Box
                                                key={file.id}
                                                sx={{
                                                    display: 'flex', alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    p: 1.2, borderRadius: 1.5,
                                                    border: '1px solid #eee',
                                                    '&:hover': { bgcolor: '#f5f5f5' },
                                                }}
                                            >
                                                <Stack direction="row" alignItems="center" spacing={1} sx={{ overflow: 'hidden' }}>
                                                    <InsertDriveFileIcon sx={{ fontSize: 18, color: FILE_TYPE_COLOR[file.fileType] ?? '#757575', flexShrink: 0 }} />
                                                    <Typography variant="body2" noWrap>{file.fileName}</Typography>
                                                    {file.fileSize && (
                                                        <Typography variant="caption" color="text.disabled" sx={{ flexShrink: 0 }}>
                                                            {formatSize(file.fileSize)}
                                                        </Typography>
                                                    )}
                                                </Stack>
                                                <IconButton
                                                    size="small"
                                                    href={`${IMG_BASE}${file.filePath}`}
                                                    download={file.fileName}
                                                    target="_blank"
                                                    sx={{ flexShrink: 0, ml: 1 }}
                                                >
                                                    <DownloadIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        ))}
                                    </Stack>
                                </>
                            )}

                        </Box>
                    </Box>
                </Box>

            </Container>
        </Box>
    );
}
