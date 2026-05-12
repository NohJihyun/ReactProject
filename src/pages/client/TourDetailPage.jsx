import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Container, Typography, Chip, Button, Skeleton,
    Stack, Divider, Tab, Tabs, IconButton, Alert,
    Table, TableHead, TableBody, TableRow, TableCell,
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
import SchoolIcon          from '@mui/icons-material/School';
import LandscapeIcon       from '@mui/icons-material/Landscape';
import FlightIcon          from '@mui/icons-material/Flight';
import DirectionsBoatIcon  from '@mui/icons-material/DirectionsBoat';
import AccessTimeIcon  from '@mui/icons-material/AccessTime';
import HotelIcon       from '@mui/icons-material/Hotel';
import { getProductById, getProductImages, getProductFiles, getCruiseItineraries, getCruiseDetail, getCruisePrices } from '../../api/clientApi';
import { getReviewStats } from '../../api/reviewApi';
import ReviewSection from '../../components/review/ReviewSection';

const IMG_BASE = 'http://localhost:8080';

const CATEGORY_MAP = {
    school:   '수학여행',
    domestic: '국내여행',
    air:      '항공 해외여행',
    cruise:   '크루즈 해외여행',
};

const CATEGORY_META = {
    domestic: { icon: <LandscapeIcon sx={{ fontSize: 18 }} />,      color: '#2e7d32' },
    air:      { icon: <FlightIcon sx={{ fontSize: 18 }} />,         color: '#e65100' },
    cruise:   { icon: <DirectionsBoatIcon sx={{ fontSize: 18 }} />, color: '#0277bd' },
    school:   { icon: <SchoolIcon sx={{ fontSize: 18 }} />,         color: '#3f51b5' },
};

const formatDt = (dt) => {
    if (!dt) return null;
    const d = new Date(dt);
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const wd = ['일','월','화','수','목','금','토'][d.getDay()];
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${m}.${day}(${wd}) ${h}:${min}`;
};

const CONTACT_ITEMS = [
    { icon: <PhoneIcon fontSize="small" />,  label: '전화 문의하기',  value: '031-466-9600' },
    { icon: <EmailIcon fontSize="small" />,  label: '이메일 문의하기', value: 'with@rohitour.com' },
];

const INQUIRY_ACTION_BUTTONS = {
    school:  { icon: <AssignmentIcon fontSize="small" />, label: '입찰 견적 요청하기' },
    default: { icon: <AssignmentIcon fontSize="small" />, label: '예약 및 결제 신청' },
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

    const [product,            setProduct]            = useState(null);
    const [images,             setImages]             = useState([]);
    const [files,              setFiles]              = useState([]);
    const [selectedImg,        setSelectedImg]        = useState(null);
    const [loading,            setLoading]            = useState(true);
    const [mediaTab,           setMediaTab]           = useState(0);
    const [cruiseItineraries,  setCruiseItineraries]  = useState([]);
    const [cruiseDetail,       setCruiseDetail]       = useState(null);
    const [cruisePrices,       setCruisePrices]       = useState([]);
    const [reviewStats,        setReviewStats]        = useState({ totalCount: 0, averageRating: 0 });
    const reviewSectionRef = useRef(null);

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
        getReviewStats(id).then(setReviewStats).catch(() => {});
    }, [id]);

    useEffect(() => {
        if (category !== 'cruise') return;
        Promise.all([getCruiseItineraries(id), getCruiseDetail(id), getCruisePrices(id)])
            .then(([its, det, prs]) => {
                setCruiseItineraries(its || []);
                setCruiseDetail(det || null);
                setCruisePrices(prs || []);
            })
            .catch(() => {});
    }, [id, category]);

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
    const categoryMeta = CATEGORY_META[category] ?? {};
    const depDt = formatDt(product.departureAt);
    const arrDt = formatDt(product.arrivalAt);
    const hasRoute = product.departureLocation || depDt;

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
                            label={hasVideo ? '유튜브 동영상 ✓' : '유튜브 동영상'}
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
                            {/* 카테고리 뱃지 + 후기/별점 */}
                            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                                <Chip
                                    label={CATEGORY_MAP[category] ?? ''}
                                    size="small"
                                    sx={{ bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 600 }}
                                />
                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                    <Stack direction="row" alignItems="center" spacing={0.5}
                                        component="a" href="#"
                                        sx={{ textDecoration: 'none', cursor: 'pointer', '&:hover': { opacity: 0.75 } }}
                                    >
                                        <Box component="svg" viewBox="0 0 24 24" sx={{ width: 18, height: 18, fill: 'url(#igGrad)', flexShrink: 0 }}>
                                            <defs>
                                                <linearGradient id="igGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                                                    <stop offset="0%" stopColor="#f09433" />
                                                    <stop offset="50%" stopColor="#dc2743" />
                                                    <stop offset="100%" stopColor="#bc1888" />
                                                </linearGradient>
                                            </defs>
                                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                        </Box>
                                        <Typography variant="caption" fontWeight={700} sx={{ color: '#111', fontSize: '0.75rem' }}>SNS</Typography>
                                    </Stack>
                                    <Stack direction="row" alignItems="center" spacing={0.4}
                                        onClick={() => reviewSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
                                        sx={{ cursor: 'pointer', '&:hover': { opacity: 0.7 } }}>
                                        <Typography sx={{ fontSize: '1rem' }}>💬</Typography>
                                        <Typography variant="caption" fontWeight={600} color="text.secondary">
                                            {reviewStats.totalCount}
                                        </Typography>
                                    </Stack>
                                    <Stack direction="row" alignItems="center" spacing={0.4}
                                        onClick={() => reviewSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
                                        sx={{ cursor: 'pointer', '&:hover': { opacity: 0.7 } }}>
                                        <Typography sx={{ fontSize: '1rem' }}>⭐</Typography>
                                        <Typography variant="caption" fontWeight={600} color="text.secondary">
                                            {Number(reviewStats.averageRating).toFixed(1)}
                                        </Typography>
                                    </Stack>
                                </Stack>
                            </Stack>

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

                            {/* 출발 / 도착 */}
                            {hasRoute && (
                                <>
                                    <Divider sx={{ my: 2 }} />
                                    <Stack spacing={1} mb={1}>
                                        <Stack direction="row" alignItems="center" spacing={1.5}>
                                            <Box sx={{ color: categoryMeta.color, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                                                {categoryMeta.icon}
                                            </Box>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="caption" color="text.secondary" display="block">출발</Typography>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {product.departureLocation}
                                                    {depDt && <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>{depDt}</Typography>}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                        <Stack direction="row" alignItems="center" spacing={1.5}>
                                            <Box sx={{ width: 18, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                                                <Typography variant="caption" color="text.disabled">↓</Typography>
                                            </Box>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="caption" color="text.secondary" display="block">도착</Typography>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {product.arrivalLocation}
                                                    {arrDt && <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>{arrDt}</Typography>}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Stack>
                                </>
                            )}

                            {/* 해시태그 */}
                            {product.hashtags && (
                                <>
                                    <Divider sx={{ my: 2 }} />
                                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                        {product.hashtags.split(' #').map((t, i) => i === 0 ? t : '#' + t).slice(0, 5).map(tag => (
                                            <Typography key={tag} variant="caption"
                                                sx={{ color: categoryMeta.color ?? '#1976d2', fontWeight: 500, fontSize: '0.8rem' }}
                                            >
                                                {tag}
                                            </Typography>
                                        ))}
                                    </Stack>
                                </>
                            )}

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

                            {/* 여행 특성 이모지 */}
                            {(product.transportType || product.hasShopping || product.hasGuideFee || product.hasEscort || product.hasOptionalTour) && (
                                <>
                                    <Divider sx={{ my: 2 }} />
                                    <Box sx={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(2, 1fr)',
                                        gap: 1.5,
                                    }}>
                                        {product.transportType && (
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <Typography sx={{ fontSize: '1.2rem' }}>
                                                    {{ CRUISE: '🚢', INTERNATIONAL_AIR: '✈️', DOMESTIC_AIR: '🛫', BUS: '🚌' }[product.transportType] ?? '🌐'}
                                                </Typography>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary" display="block">교통수단</Typography>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {{ CRUISE: '크루즈', INTERNATIONAL_AIR: '항공 (국제)', DOMESTIC_AIR: '항공 (국내선)', BUS: '버스' }[product.transportType] ?? product.transportType}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        )}
                                        {[
                                            { key: 'hasShopping',     emoji: '🛍️', label: '쇼핑' },
                                            { key: 'hasGuideFee',     emoji: '🪙', label: '가이드비용' },
                                            { key: 'hasEscort',       emoji: '🧑‍✈️', label: '인솔자' },
                                            { key: 'hasOptionalTour', emoji: '🎯', label: '선택관광' },
                                        ].map(({ key, emoji, label, gold }) => (
                                            <Stack key={key} direction="row" alignItems="center" spacing={1}>
                                                <Typography sx={{ fontSize: '1.2rem', ...(gold && { color: '#FFD700', textShadow: '0 0 2px #b8860b' }) }}>{emoji}</Typography>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
                                                    <Typography variant="body2" fontWeight={600}
                                                        sx={{ color: product[key] === 'Y' ? '#2e7d32' : '#e53935' }}
                                                    >
                                                        {product[key] === 'Y' ? '포함' : '미포함'}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        ))}
                                    </Box>
                                </>
                            )}

                            {/* 첨부파일 */}
                            {files.length > 0 && (
                                <>
                                    <Divider sx={{ my: 2 }} />
                                    <Alert severity="info" sx={{ mb: 1.5, fontSize: '0.8rem', lineHeight: 1.6 }}>
                                        홈페이지에 담지 못한 자세한 내용은 첨부파일에 포함되어 있습니다.
                                        파일을 다운받아 확인하시고, 궁금한 사항은 전화 또는 이메일로 문의해 주세요.
                                    </Alert>
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
                {/* ── 크루즈 전용 섹션 ── */}
                {category === 'cruise' && (
                    <>
                        {/* 여행 일정 */}
                        <Box>
                            <Divider />
                            <Box sx={{ p: { xs: 2.5, md: 4 } }}>
                                <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '1rem', md: '1.15rem' }, mb: 2.5 }}>
                                    여행 일정
                                </Typography>
                                {cruiseItineraries.length === 0 ? (
                                    <Typography variant="body2" color="text.disabled" textAlign="center" py={3}>등록된 일정이 없습니다.</Typography>
                                ) : (
                                    <Stack spacing={3}>
                                        {cruiseItineraries.map(item => {
                                            const locImgs  = (item.images || []).filter(i => i.imageType === 'LOCATION');
                                            const hotelImgs = (item.images || []).filter(i => i.imageType === 'HOTEL');
                                            return (
                                                <Box key={item.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                                                    <Box sx={{ px: 2.5, py: 1.5, bgcolor: '#e3f2fd', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Chip label={`${item.dayNumber}일차`} size="small" color="primary" />
                                                        <Typography fontWeight={700} sx={{ fontSize: '1rem' }}>{item.title}</Typography>
                                                    </Box>
                                                    <Box sx={{ px: 2.5, py: 2 }}>
                                                        {item.description && (
                                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
                                                                {item.description}
                                                            </Typography>
                                                        )}
                                                        {(item.schedules || []).length > 0 && (
                                                            <Box sx={{ mb: 2 }}>
                                                                <Stack direction="row" alignItems="center" spacing={0.5} mb={1}>
                                                                    <AccessTimeIcon fontSize="small" color="action" />
                                                                    <Typography variant="caption" fontWeight={700} color="text.secondary">시간대별 일정</Typography>
                                                                </Stack>
                                                                <Stack spacing={0.75}>
                                                                    {item.schedules.map(s => (
                                                                        <Stack key={s.id} direction="row" spacing={2} alignItems="flex-start">
                                                                            <Typography variant="body2" fontWeight={700} color="primary.main" sx={{ minWidth: 48 }}>
                                                                                {s.time || ''}
                                                                            </Typography>
                                                                            <Typography variant="body2" color="text.secondary">{s.description}</Typography>
                                                                        </Stack>
                                                                    ))}
                                                                </Stack>
                                                            </Box>
                                                        )}
                                                        {locImgs.length > 0 && (
                                                            <Box sx={{ mb: 2 }}>
                                                                <Stack direction="row" alignItems="center" spacing={0.5} mb={1}>
                                                                    <LandscapeIcon fontSize="small" color="action" />
                                                                    <Typography variant="caption" fontWeight={700} color="text.secondary">관광지 이미지</Typography>
                                                                </Stack>
                                                                <Stack direction="row" flexWrap="wrap" gap={1}>
                                                                    {locImgs.map(img => (
                                                                        <Box key={img.id} component="img"
                                                                            src={`${IMG_BASE}${img.imagePath}`}
                                                                            sx={{ width: 140, height: 100, objectFit: 'cover', borderRadius: 1 }} />
                                                                    ))}
                                                                </Stack>
                                                            </Box>
                                                        )}
                                                        {item.hotelName && (
                                                            <Box sx={{ mt: 1 }}>
                                                                <Stack direction="row" alignItems="center" spacing={0.5} mb={1}>
                                                                    <HotelIcon fontSize="small" color="action" />
                                                                    <Typography variant="body2" fontWeight={700}>숙박: {item.hotelName}</Typography>
                                                                </Stack>
                                                                {hotelImgs.length > 0 && (
                                                                    <Stack direction="row" flexWrap="wrap" gap={1}>
                                                                        {hotelImgs.map(img => (
                                                                            <Box key={img.id} component="img"
                                                                                src={`${IMG_BASE}${img.imagePath}`}
                                                                                sx={{ width: 140, height: 100, objectFit: 'cover', borderRadius: 1 }} />
                                                                        ))}
                                                                    </Stack>
                                                                )}
                                                            </Box>
                                                        )}
                                                        {item.shoppingCenterName && (
                                                            <Box sx={{ mt: 2, p: 1.5, bgcolor: 'warning.50', borderRadius: 1 }}>
                                                                <Typography variant="caption" fontWeight={700} color="warning.dark">🛍 쇼핑</Typography>
                                                                <Typography variant="body2" fontWeight={600}>{item.shoppingCenterName}</Typography>
                                                                {item.shoppingInfo && <Typography variant="caption" color="text.secondary" display="block">{item.shoppingInfo}</Typography>}
                                                                {item.shoppingExchangeInfo && <Typography variant="caption" color="text.secondary" display="block">교환/환불: {item.shoppingExchangeInfo}</Typography>}
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </Box>
                                            );
                                        })}
                                    </Stack>
                                )}
                            </Box>
                        </Box>

                        {/* 포함 / 불포함 */}
                        {cruiseDetail && (cruiseDetail.includedItems || cruiseDetail.excludedItems) && (
                            <Box>
                                <Divider />
                                <Box sx={{ p: { xs: 2.5, md: 4 } }}>
                                    <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '1rem', md: '1.15rem' }, mb: 2.5 }}>
                                        포함 / 불포함 정보
                                    </Typography>
                                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                                        {cruiseDetail.includedItems && (
                                            <Box sx={{ flex: 1, p: 2, bgcolor: '#f1f8e9', borderRadius: 2, borderLeft: '4px solid #66bb6a' }}>
                                                <Typography variant="body2" fontWeight={700} color="#2e7d32" mb={1}>✅ 포함 사항</Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>{cruiseDetail.includedItems}</Typography>
                                            </Box>
                                        )}
                                        {cruiseDetail.excludedItems && (
                                            <Box sx={{ flex: 1, p: 2, bgcolor: '#fce4ec', borderRadius: 2, borderLeft: '4px solid #ef5350' }}>
                                                <Typography variant="body2" fontWeight={700} color="#c62828" mb={1}>❌ 불포함 사항</Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>{cruiseDetail.excludedItems}</Typography>
                                            </Box>
                                        )}
                                    </Stack>
                                </Box>
                            </Box>
                        )}

                        {/* 가이드 / 인솔자 미팅정보 */}
                        {cruiseDetail && (cruiseDetail.guideName || cruiseDetail.meetingLocation) && (
                            <Box>
                                <Divider />
                                <Box sx={{ p: { xs: 2.5, md: 4 } }}>
                                    <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '1rem', md: '1.15rem' }, mb: 2.5 }}>
                                        가이드 / 인솔자 미팅정보
                                    </Typography>
                                    <Stack spacing={1.5}>
                                        {cruiseDetail.guideName && (
                                            <Stack direction="row" spacing={2}>
                                                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>인솔자명</Typography>
                                                <Typography variant="body2" fontWeight={600}>{cruiseDetail.guideName}</Typography>
                                            </Stack>
                                        )}
                                        {cruiseDetail.guidePhone && (
                                            <Stack direction="row" spacing={2}>
                                                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>연락처</Typography>
                                                <Typography variant="body2" fontWeight={600}>{cruiseDetail.guidePhone}</Typography>
                                            </Stack>
                                        )}
                                        {cruiseDetail.meetingLocation && (
                                            <Stack direction="row" spacing={2}>
                                                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>미팅 장소</Typography>
                                                <Typography variant="body2" fontWeight={600}>{cruiseDetail.meetingLocation}</Typography>
                                            </Stack>
                                        )}
                                        {cruiseDetail.meetingTime && (
                                            <Stack direction="row" spacing={2}>
                                                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>미팅 시간</Typography>
                                                <Typography variant="body2" fontWeight={600}>{cruiseDetail.meetingTime}</Typography>
                                            </Stack>
                                        )}
                                        {cruiseDetail.notes && (
                                            <Box sx={{ mt: 1, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                                <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: '#111', fontWeight: 500 }}>{cruiseDetail.notes}</Typography>
                                            </Box>
                                        )}
                                    </Stack>
                                </Box>
                            </Box>
                        )}

                        {/* 상품 가격 */}
                        {cruisePrices.length > 0 && (
                            <Box>
                                <Divider />
                                <Box sx={{ p: { xs: 2.5, md: 4 } }}>
                                    <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '1rem', md: '1.15rem' }, mb: 2.5 }}>
                                        상품 가격
                                    </Typography>
                                    {(cruiseDetail?.ageAdult || cruiseDetail?.ageChild || cruiseDetail?.ageInfant) && (
                                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2.5, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                                            {cruiseDetail.ageAdult  && <Typography variant="caption" sx={{ color: '#111' }}>성인: <strong>{cruiseDetail.ageAdult}</strong></Typography>}
                                            {cruiseDetail.ageChild  && <Typography variant="caption" sx={{ color: '#111' }}>아동: <strong>{cruiseDetail.ageChild}</strong></Typography>}
                                            {cruiseDetail.ageInfant && <Typography variant="caption" sx={{ color: '#111' }}>유아: <strong>{cruiseDetail.ageInfant}</strong></Typography>}
                                        </Stack>
                                    )}
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: 'grey.50' }}>
                                                <TableCell align="center" sx={{ fontWeight: 700 }}>객실 타입</TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 700 }}>성인</TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 700 }}>아동</TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 700 }}>유아</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {cruisePrices.map(p => (
                                                <TableRow key={p.id}>
                                                    <TableCell align="center" sx={{ fontWeight: 600, color: '#111' }}>{p.cabinType}</TableCell>
                                                    <TableCell align="center" sx={{ color: '#111' }}>{p.priceAdult ? Number(p.priceAdult).toLocaleString() + '원' : '-'}</TableCell>
                                                    <TableCell align="center" sx={{ color: '#111' }}>{p.priceChild  ? Number(p.priceChild).toLocaleString()  + '원' : '-'}</TableCell>
                                                    <TableCell align="center" sx={{ color: '#111' }}>{p.priceInfant ? Number(p.priceInfant).toLocaleString() + '원' : '-'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    {cruiseDetail?.surchargeInfo && (
                                        <Box sx={{ mt: 3 }}>
                                            <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>유료할증료</Typography>
                                            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                                <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: '#111' }}>{cruiseDetail.surchargeInfo}</Typography>
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        )}

                        {/* 유의사항 */}
                        {cruiseDetail && (cruiseDetail.insuranceInfo || cruiseDetail.emergencyContact || cruiseDetail.passportVisaInfo || cruiseDetail.otherNotices) && (
                            <Box>
                                <Divider />
                                <Box sx={{ p: { xs: 2.5, md: 4 } }}>
                                    <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '1rem', md: '1.15rem' }, mb: 2.5 }}>
                                        유의사항
                                    </Typography>
                                    <Stack spacing={2}>
                                        {[
                                            { label: '여행자 보험',    value: cruiseDetail.insuranceInfo },
                                            { label: '비상 연락처',    value: cruiseDetail.emergencyContact },
                                            { label: '여권 / 비자 안내', value: cruiseDetail.passportVisaInfo },
                                            { label: '기타 유의사항',  value: cruiseDetail.otherNotices },
                                        ].filter(r => r.value).map(r => (
                                            <Box key={r.label}>
                                                <Typography variant="body2" fontWeight={700} sx={{ mb: 0.75 }}>{r.label}</Typography>
                                                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: '#111' }}>{r.value}</Typography>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Stack>
                                </Box>
                            </Box>
                        )}

                        {/* 상품약관 / 예약시유의사항 / 나라별입국규정 */}
                        {cruiseDetail && (cruiseDetail.terms || cruiseDetail.reservationNotes || cruiseDetail.entryRegulations) && (
                            <Box>
                                <Divider />
                                <Box sx={{ p: { xs: 2.5, md: 4 } }}>
                                    <Stack spacing={3}>
                                        {[
                                            { label: '상품 약관',       value: cruiseDetail.terms },
                                            { label: '예약시 유의사항', value: cruiseDetail.reservationNotes },
                                            { label: '나라별 입국규정', value: cruiseDetail.entryRegulations },
                                        ].filter(r => r.value).map(r => (
                                            <Box key={r.label}>
                                                <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '1rem', md: '1.15rem' }, mb: 1.5 }}>{r.label}</Typography>
                                                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: '#111' }}>{r.value}</Typography>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Stack>
                                </Box>
                            </Box>
                        )}
                    </>
                )}

                {/* ── 고객 후기 섹션 (모든 카테고리 공통) ── */}
                <ReviewSection ref={reviewSectionRef} productId={Number(id)} />

                </Box>

            </Container>
        </Box>
    );
}
