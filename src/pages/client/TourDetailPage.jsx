import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Container, Typography, Chip, Button, Skeleton,
    Stack, Divider, Tab, Tabs, IconButton, Alert,
    Table, TableHead, TableBody, TableRow, TableCell,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem, Select, FormControl, InputLabel, CircularProgress,
} from '@mui/material';
import AddIcon    from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import EventIcon  from '@mui/icons-material/Event';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useAuthStore } from '../../auth/authStore';
import { useUiStore } from '../store/uiStore';
import { createBooking } from '../../api/bookingApi';
import ArrowBackIcon       from '@mui/icons-material/ArrowBack';
import PeopleIcon          from '@mui/icons-material/People';
import GroupsIcon          from '@mui/icons-material/Groups';
import AttachMoneyIcon     from '@mui/icons-material/AttachMoney';
import PhoneIcon           from '@mui/icons-material/Phone';
import EmailIcon           from '@mui/icons-material/Email';
import AssignmentIcon      from '@mui/icons-material/Assignment';
import ImageIcon           from '@mui/icons-material/Image';
import DownloadIcon        from '@mui/icons-material/Download';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import SchoolIcon          from '@mui/icons-material/School';
import LandscapeIcon       from '@mui/icons-material/Landscape';
import FlightIcon          from '@mui/icons-material/Flight';
import DirectionsBoatIcon  from '@mui/icons-material/DirectionsBoat';
import HotelIcon       from '@mui/icons-material/Hotel';
import { getProductById, getProductImages, getProductFiles, getCruiseItineraries, getCruiseDetail, getCruisePrices, getAirItineraries, getAirDetail, getDomesticItineraries, getDomesticDetail, getSchoolTripItineraries, getSchoolTripDetail } from '../../api/clientApi';
import { getReviewStats } from '../../api/reviewApi';
import ReviewSection from '../../components/review/ReviewSection';

import IMG_BASE from '../../config/imageConfig';

const CATEGORY_MAP = {
    school:   '수학여행',
    domestic: '국내여행',
    air:      '국외여행',
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

const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const parts = timeStr.trim().split(' ');
    if (parts.length >= 2 && (parts[1] === 'AM' || parts[1] === 'PM')) {
        return `${parts[1]} ${parts[0]}`;
    }
    return timeStr;
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

const BOOKING_INIT = { name: '', phone: '', email: '', adultCount: 1, childCount: 0, infantCount: 0, desiredDepartureAt: '', requestMemo: '' };

export default function TourDetailPage() {
    const { category, id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { openLoginModal } = useUiStore();

    const [product,            setProduct]            = useState(null);
    const [images,             setImages]             = useState([]);
    const [files,              setFiles]              = useState([]);
    const [selectedImg,        setSelectedImg]        = useState(null);
    const [loading,            setLoading]            = useState(true);
    const [mediaTab,           setMediaTab]           = useState(0);
    const [cruiseItineraries,  setCruiseItineraries]  = useState([]);
    const [cruiseDetail,       setCruiseDetail]       = useState(null);
    const [cruisePrices,       setCruisePrices]       = useState([]);
    const [airItineraries,      setAirItineraries]      = useState([]);
    const [airDetail,           setAirDetail]           = useState(null);
    const [domesticItineraries,   setDomesticItineraries]   = useState([]);
    const [domesticDetail,        setDomesticDetail]        = useState(null);
    const [schoolTripItineraries, setSchoolTripItineraries] = useState([]);
    const [schoolTripDetail,      setSchoolTripDetail]      = useState(null);
    const [reviewStats,           setReviewStats]           = useState({ totalCount: 0, averageRating: 0 });
    const reviewSectionRef = useRef(null);

    const [bookingOpen,       setBookingOpen]       = useState(false);
    const [bookingSuccess,    setBookingSuccess]    = useState(false);
    const [bookingSubmitting, setBookingSubmitting] = useState(false);
    const [bookingForm,       setBookingForm]       = useState(BOOKING_INIT);
    const [bookingNumber,     setBookingNumber]     = useState('');
    const [bookingCabinType,  setBookingCabinType]  = useState('');

    const priceInfo = category === 'air'      ? { adult: airDetail?.priceAdult,       child: airDetail?.priceChild,       infant: airDetail?.priceInfant }
                    : category === 'domestic' ? { adult: domesticDetail?.priceAdult,   child: domesticDetail?.priceChild,   infant: domesticDetail?.priceInfant }
                    : category === 'school'   ? { adult: schoolTripDetail?.priceAdult, child: schoolTripDetail?.priceChild, infant: schoolTripDetail?.priceInfant }
                    : category === 'cruise'   ? (() => { const p = cruisePrices.find(p => p.cabinType === bookingCabinType) || cruisePrices[0]; return p ? { adult: p.priceAdult, child: p.priceChild, infant: p.priceInfant } : null; })()
                    : null;
    const bookingTotalPrice = priceInfo
        ? (Number(priceInfo.adult)  || 0) * bookingForm.adultCount
        + (Number(priceInfo.child)  || 0) * bookingForm.childCount
        + (Number(priceInfo.infant) || 0) * bookingForm.infantCount
        : 0;

    const handleBookingOpen = () => {
        if (!user) { openLoginModal(); return; }
        setBookingForm({ ...BOOKING_INIT, name: user.name ?? '', email: user.email ?? '' });
        setBookingCabinType(cruisePrices[0]?.cabinType || '');
        setBookingOpen(true);
    };

    const handleBookingSubmit = async () => {
        if (!bookingForm.name.trim() || !bookingForm.phone.trim()) return;
        setBookingSubmitting(true);
        try {
            const payload = {
                ...bookingForm,
                productId: Number(id),
                desiredDepartureAt: product?.departureAt || bookingForm.desiredDepartureAt || null,
                totalPrice: bookingTotalPrice > 0 ? bookingTotalPrice : null,
            };
            const res = await createBooking(payload);
            setBookingNumber(res?.bookingNumber ?? '');
            setBookingOpen(false);
            setBookingSuccess(true);
        } finally {
            setBookingSubmitting(false);
        }
    };

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

    useEffect(() => {
        if (category !== 'air') return;
        Promise.all([getAirItineraries(id), getAirDetail(id)])
            .then(([its, det]) => {
                setAirItineraries(its || []);
                setAirDetail(det || null);
            })
            .catch(() => {});
    }, [id, category]);

    useEffect(() => {
        if (category !== 'domestic') return;
        Promise.all([getDomesticItineraries(id), getDomesticDetail(id)])
            .then(([its, det]) => {
                setDomesticItineraries(its || []);
                setDomesticDetail(det || null);
            })
            .catch(() => {});
    }, [id, category]);

    useEffect(() => {
        if (category !== 'school') return;
        Promise.all([getSchoolTripItineraries(id), getSchoolTripDetail(id)])
            .then(([its, det]) => {
                setSchoolTripItineraries(its || []);
                setSchoolTripDetail(det || null);
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
    const isSchool = category === 'school';
    const maskSchoolName = (name) => {
        if (!name) return name;
        const suffixes = ['초등학교', '중학교', '고등학교', '대학교', '대학원', '초교', '중교', '고교'];
        for (const suffix of suffixes) {
            if (name.includes(suffix)) return '○○' + suffix;
        }
        return '○○학교';
    };
    const maskSchoolText = (text) => {
        if (!text) return text;
        // 1차: 완전한 학교명 (예: 안양서중학교, 부산고등학교)
        let result = text.replace(
            /[가-힣a-zA-Z0-9]+(?:초등학교|중학교|고등학교|대학교|대학원|초교|중교|고교)/g,
            (m) => {
                const suffix = ['초등학교','중학교','고등학교','대학교','대학원','초교','중교','고교'].find(s => m.endsWith(s));
                return '○○' + suffix;
            }
        );
        return result;
    };

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
                            icon={
                                <Box component="svg" viewBox="0 0 24 24" sx={{ width: 20, height: 20, flexShrink: 0 }}>
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" fill="#FF0000"/>
                                    <path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#ffffff"/>
                                </Box>
                            }
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
                                        {category === 'school' ? (
                                            CONTACT_ITEMS.map(item => (
                                                <Box
                                                    key={item.label}
                                                    sx={{
                                                        display: 'flex', alignItems: 'center', gap: 1.5,
                                                        py: 1.2, px: 2.5, borderRadius: 2,
                                                        bgcolor: '#1565c0',
                                                        boxShadow: '0 3px 10px rgba(21,101,192,0.3)',
                                                        color: '#fff',
                                                    }}
                                                >
                                                    {item.icon}
                                                    <Box>
                                                        <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', lineHeight: 1.3 }}>{item.label}</Typography>
                                                        <Typography variant="body2" fontWeight={700}>{item.value}</Typography>
                                                    </Box>
                                                </Box>
                                            ))
                                        ) : (
                                            <>
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
                                                    onClick={handleBookingOpen}
                                                    sx={{
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
                                            </>
                                        )}
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
                                        {category === 'school' ? (
                                            CONTACT_ITEMS.map(item => (
                                                <Box
                                                    key={item.label}
                                                    sx={{
                                                        display: 'flex', alignItems: 'center', gap: 1.5,
                                                        py: 1.2, px: 2.5, borderRadius: 2,
                                                        bgcolor: '#1565c0',
                                                        boxShadow: '0 3px 10px rgba(21,101,192,0.3)',
                                                        color: '#fff',
                                                    }}
                                                >
                                                    {item.icon}
                                                    <Box>
                                                        <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', lineHeight: 1.3 }}>{item.label}</Typography>
                                                        <Typography variant="body2" fontWeight={700}>{item.value}</Typography>
                                                    </Box>
                                                </Box>
                                            ))
                                        ) : (
                                            <>
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
                                                    onClick={handleBookingOpen}
                                                    sx={{
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
                                            </>
                                        )}
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
                                    <Stack component="a" href="https://www.youtube.com/@rohitour_travel" target="_blank" rel="noopener noreferrer"
                                        direction="row" alignItems="center" spacing={0.5}
                                        sx={{ textDecoration: 'none', cursor: 'pointer', '&:hover': { opacity: 0.75 } }}
                                    >
                                        <Box component="svg" viewBox="0 0 24 24" sx={{ width: 18, height: 18, flexShrink: 0 }}>
                                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" fill="#FF0000"/>
                                            <path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#ffffff"/>
                                        </Box>
                                        <Typography variant="caption" fontWeight={700} sx={{ color: '#111', fontSize: '0.75rem' }}>YouTube</Typography>
                                    </Stack>
                                    <Stack direction="row" alignItems="center" spacing={0.5}
                                        component="a" href="https://www.instagram.com/rohitour_travel/" target="_blank" rel="noopener noreferrer"
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
                                    {isSchool ? maskSchoolName(product.productSubname) : product.productSubname}
                                </Typography>
                            )}

                            <Divider sx={{ my: 2 }} />

                            {/* 가격 */}
                            {!isSchool && product.pricePerPerson && (
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
                                            {isSchool ? (
                                                product.minPeople && product.maxPeople
                                                    ? `함께 진행한 학생 ${product.minPeople}~${product.maxPeople}명`
                                                    : product.minPeople
                                                    ? `함께 진행한 학생 ${product.minPeople}명`
                                                    : `함께 진행한 학생 ${product.maxPeople}명`
                                            ) : (
                                                <>
                                                    {product.minPeople && `최소 ${product.minPeople}인`}
                                                    {product.minPeople && product.maxPeople && ' · '}
                                                    {product.maxPeople && `최대 ${product.maxPeople}인`}
                                                </>
                                            )}
                                        </Typography>
                                    </Stack>
                                )}
                                {!isSchool && product.travelType && (
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
                                                    {isSchool ? maskSchoolName(product.departureLocation) : product.departureLocation}
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
                                                    {isSchool ? maskSchoolName(product.arrivalLocation) : product.arrivalLocation}
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
                                            { key: 'hasShopping',     emoji: '🛍️', label: '쇼핑',     hideForSchool: true },
                                            { key: 'hasGuideFee',     emoji: '🪙', label: '가이드비용', hideForSchool: false },
                                            { key: 'hasEscort',       emoji: '🧑‍✈️', label: '인솔자',   hideForSchool: false },
                                            { key: 'hasOptionalTour', emoji: '🎯', label: '선택관광',  hideForSchool: true },
                                        ].filter(({ hideForSchool }) => !(isSchool && hideForSchool))
                                        .map(({ key, emoji, label, gold }) => (
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
                                                        {/* 타임라인 */}
                                                        {(item.schedules || []).length > 0 && (
                                                            <Box sx={{ mb: 1 }}>
                                                                {item.schedules.map((s, idx) => (
                                                                    <Box key={s.id}>
                                                                        <Box sx={{ display: 'flex', gap: 1.5 }}>
                                                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                                                                                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'primary.main', mt: '3px', flexShrink: 0 }} />
                                                                                {(idx < item.schedules.length - 1 || (s.images || []).length > 0) && (
                                                                                    <Box sx={{ width: 2, flex: 1, minHeight: 16, bgcolor: 'primary.light', my: 0.5 }} />
                                                                                )}
                                                                            </Box>
                                                                            <Box sx={{ flex: 1, pb: 0.5 }}>
                                                                                <Stack direction="row" spacing={1} alignItems="baseline" mb={0.5}>
                                                                                    {s.time && (
                                                                                        <Typography variant="caption" fontWeight={700} color="primary.main" sx={{ flexShrink: 0, minWidth: 58 }}>
                                                                                            {formatTime(s.time)}
                                                                                        </Typography>
                                                                                    )}
                                                                                    <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>{s.description}</Typography>
                                                                                </Stack>
                                                                                {(s.images || []).length > 0 && (
                                                                                    <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 1 }}>
                                                                                        {s.images.map(img => (
                                                                                            <Box key={img.id} component="img"
                                                                                                src={`${IMG_BASE}${img.imagePath}`}
                                                                                                sx={{ width: 140, height: 100, objectFit: 'cover', borderRadius: 1 }} />
                                                                                        ))}
                                                                                    </Stack>
                                                                                )}
                                                                            </Box>
                                                                        </Box>
                                                                    </Box>
                                                                ))}
                                                            </Box>
                                                        )}
                                                        {item.hotelName && (
                                                            <Box sx={{ mt: 1, mb: 1 }}>
                                                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                                                    <HotelIcon fontSize="small" color="action" />
                                                                    <Typography variant="body2" fontWeight={700}>숙박: {item.hotelName}</Typography>
                                                                </Stack>
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

                {/* ── 항공 해외여행 전용 섹션 ── */}
                {category === 'air' && (
                    <>
                        {/* 여행 일정 */}
                        <Box>
                            <Divider />
                            <Box sx={{ p: { xs: 2.5, md: 4 } }}>
                                <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '1rem', md: '1.15rem' }, mb: 2.5 }}>
                                    여행 일정
                                </Typography>
                                {airItineraries.length === 0 ? (
                                    <Typography variant="body2" color="text.disabled" textAlign="center" py={3}>등록된 일정이 없습니다.</Typography>
                                ) : (
                                    <Stack spacing={3}>
                                        {airItineraries.map(item => {
                                            return (
                                                <Box key={item.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                                                    <Box sx={{ px: 2.5, py: 1.5, bgcolor: '#fff3e0', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Chip label={`${item.dayNumber}일차`} size="small" sx={{ bgcolor: '#e65100', color: '#fff', fontWeight: 700 }} />
                                                        <Typography fontWeight={700} sx={{ fontSize: '1rem' }}>{item.title}</Typography>
                                                    </Box>
                                                    <Box sx={{ px: 2.5, py: 2 }}>
                                                        {item.description && (
                                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
                                                                {item.description}
                                                            </Typography>
                                                        )}
                                                        {/* 타임라인 */}
                                                        {(item.schedules || []).length > 0 && (
                                                            <Box sx={{ mb: 1 }}>
                                                                {item.schedules.map((s, idx) => (
                                                                    <Box key={s.id}>
                                                                        <Box sx={{ display: 'flex', gap: 1.5 }}>
                                                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                                                                                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'primary.main', mt: '3px', flexShrink: 0 }} />
                                                                                {(idx < item.schedules.length - 1 || (s.images || []).length > 0) && (
                                                                                    <Box sx={{ width: 2, flex: 1, minHeight: 16, bgcolor: 'primary.light', my: 0.5 }} />
                                                                                )}
                                                                            </Box>
                                                                            <Box sx={{ flex: 1, pb: 0.5 }}>
                                                                                <Stack direction="row" spacing={1} alignItems="baseline" mb={0.5}>
                                                                                    {s.time && (
                                                                                        <Typography variant="caption" fontWeight={700} color="primary.main" sx={{ flexShrink: 0, minWidth: 58 }}>
                                                                                            {formatTime(s.time)}
                                                                                        </Typography>
                                                                                    )}
                                                                                    <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>{s.description}</Typography>
                                                                                </Stack>
                                                                                {(s.images || []).length > 0 && (
                                                                                    <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 1 }}>
                                                                                        {s.images.map(img => (
                                                                                            <Box key={img.id} component="img"
                                                                                                src={`${IMG_BASE}${img.imagePath}`}
                                                                                                sx={{ width: 140, height: 100, objectFit: 'cover', borderRadius: 1 }} />
                                                                                        ))}
                                                                                    </Stack>
                                                                                )}
                                                                            </Box>
                                                                        </Box>
                                                                    </Box>
                                                                ))}
                                                            </Box>
                                                        )}
                                                        {item.hotelName && (
                                                            <Box sx={{ mt: 1, mb: 1 }}>
                                                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                                                    <HotelIcon fontSize="small" color="action" />
                                                                    <Typography variant="body2" fontWeight={700}>숙박: {item.hotelName}</Typography>
                                                                </Stack>
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
                        {airDetail && (airDetail.includedItems || airDetail.excludedItems) && (
                            <Box>
                                <Divider />
                                <Box sx={{ p: { xs: 2.5, md: 4 } }}>
                                    <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '1rem', md: '1.15rem' }, mb: 2.5 }}>
                                        포함 / 불포함 정보
                                    </Typography>
                                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                                        {airDetail.includedItems && (
                                            <Box sx={{ flex: 1, p: 2, bgcolor: '#f1f8e9', borderRadius: 2, borderLeft: '4px solid #66bb6a' }}>
                                                <Typography variant="body2" fontWeight={700} color="#2e7d32" mb={1}>✅ 포함 사항</Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>{airDetail.includedItems}</Typography>
                                            </Box>
                                        )}
                                        {airDetail.excludedItems && (
                                            <Box sx={{ flex: 1, p: 2, bgcolor: '#fce4ec', borderRadius: 2, borderLeft: '4px solid #ef5350' }}>
                                                <Typography variant="body2" fontWeight={700} color="#c62828" mb={1}>❌ 불포함 사항</Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>{airDetail.excludedItems}</Typography>
                                            </Box>
                                        )}
                                    </Stack>
                                </Box>
                            </Box>
                        )}

                        {/* 가이드 / 인솔자 미팅정보 */}
                        {airDetail && (airDetail.guideName || airDetail.meetingLocation) && (
                            <Box>
                                <Divider />
                                <Box sx={{ p: { xs: 2.5, md: 4 } }}>
                                    <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '1rem', md: '1.15rem' }, mb: 2.5 }}>
                                        가이드 / 인솔자 미팅정보
                                    </Typography>
                                    <Stack spacing={1.5}>
                                        {airDetail.guideName && (
                                            <Stack direction="row" spacing={2}>
                                                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>인솔자명</Typography>
                                                <Typography variant="body2" fontWeight={600}>{airDetail.guideName}</Typography>
                                            </Stack>
                                        )}
                                        {airDetail.guidePhone && (
                                            <Stack direction="row" spacing={2}>
                                                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>연락처</Typography>
                                                <Typography variant="body2" fontWeight={600}>{airDetail.guidePhone}</Typography>
                                            </Stack>
                                        )}
                                        {airDetail.meetingLocation && (
                                            <Stack direction="row" spacing={2}>
                                                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>미팅 장소</Typography>
                                                <Typography variant="body2" fontWeight={600}>{airDetail.meetingLocation}</Typography>
                                            </Stack>
                                        )}
                                        {airDetail.meetingTime && (
                                            <Stack direction="row" spacing={2}>
                                                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>미팅 시간</Typography>
                                                <Typography variant="body2" fontWeight={600}>{airDetail.meetingTime}</Typography>
                                            </Stack>
                                        )}
                                        {airDetail.notes && (
                                            <Box sx={{ mt: 1, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                                <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: '#111', fontWeight: 500 }}>{airDetail.notes}</Typography>
                                            </Box>
                                        )}
                                    </Stack>
                                </Box>
                            </Box>
                        )}

                        {/* 상품 가격 */}
                        {airDetail && (airDetail.priceAdult || airDetail.priceChild || airDetail.priceInfant || airDetail.flightInfo) && (
                            <Box>
                                <Divider />
                                <Box sx={{ p: { xs: 2.5, md: 4 } }}>
                                    <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '1rem', md: '1.15rem' }, mb: 2.5 }}>
                                        상품 가격
                                    </Typography>
                                    {(airDetail.ageAdult || airDetail.ageChild || airDetail.ageInfant) && (
                                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2.5, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                                            {airDetail.ageAdult  && <Typography variant="caption" sx={{ color: '#111' }}>성인: <strong>{airDetail.ageAdult}</strong></Typography>}
                                            {airDetail.ageChild  && <Typography variant="caption" sx={{ color: '#111' }}>아동: <strong>{airDetail.ageChild}</strong></Typography>}
                                            {airDetail.ageInfant && <Typography variant="caption" sx={{ color: '#111' }}>유아: <strong>{airDetail.ageInfant}</strong></Typography>}
                                        </Stack>
                                    )}
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: 'grey.50' }}>
                                                <TableCell align="center" sx={{ fontWeight: 700 }}>성인</TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 700 }}>아동</TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 700 }}>유아</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell align="center" sx={{ color: '#111', fontWeight: 600 }}>{airDetail.priceAdult ? Number(airDetail.priceAdult).toLocaleString() + '원' : '-'}</TableCell>
                                                <TableCell align="center" sx={{ color: '#111' }}>{airDetail.priceChild  ? Number(airDetail.priceChild).toLocaleString()  + '원' : '-'}</TableCell>
                                                <TableCell align="center" sx={{ color: '#111' }}>{airDetail.priceInfant ? Number(airDetail.priceInfant).toLocaleString() + '원' : '-'}</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                    {airDetail.flightInfo && (
                                        <Box sx={{ mt: 3 }}>
                                            <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
                                                <FlightIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle', color: '#e65100' }} />
                                                항공편 정보
                                            </Typography>
                                            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                                <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: '#111' }}>{airDetail.flightInfo}</Typography>
                                            </Box>
                                        </Box>
                                    )}
                                    {airDetail.surchargeInfo && (
                                        <Box sx={{ mt: 3 }}>
                                            <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>유료할증료</Typography>
                                            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                                <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: '#111' }}>{airDetail.surchargeInfo}</Typography>
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        )}

                        {/* 유의사항 */}
                        {airDetail && (airDetail.insuranceInfo || airDetail.emergencyContact || airDetail.passportVisaInfo || airDetail.otherNotices) && (
                            <Box>
                                <Divider />
                                <Box sx={{ p: { xs: 2.5, md: 4 } }}>
                                    <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '1rem', md: '1.15rem' }, mb: 2.5 }}>
                                        유의사항
                                    </Typography>
                                    <Stack spacing={2}>
                                        {[
                                            { label: '여행자 보험',      value: airDetail.insuranceInfo },
                                            { label: '비상 연락처',      value: airDetail.emergencyContact },
                                            { label: '여권 / 비자 안내', value: airDetail.passportVisaInfo },
                                            { label: '기타 유의사항',    value: airDetail.otherNotices },
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
                        {airDetail && (airDetail.terms || airDetail.reservationNotes || airDetail.entryRegulations) && (
                            <Box>
                                <Divider />
                                <Box sx={{ p: { xs: 2.5, md: 4 } }}>
                                    <Stack spacing={3}>
                                        {[
                                            { label: '상품 약관',       value: airDetail.terms },
                                            { label: '예약시 유의사항', value: airDetail.reservationNotes },
                                            { label: '나라별 입국규정', value: airDetail.entryRegulations },
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

                {/* ── 국내여행 전용 섹션 ── */}
                {category === 'domestic' && (
                    <>
                        {/* 여행 일정 */}
                        <Box>
                            <Divider />
                            <Box sx={{ p: { xs: 2.5, md: 4 } }}>
                                <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '1rem', md: '1.15rem' }, mb: 2.5 }}>
                                    여행 일정
                                </Typography>
                                {domesticItineraries.length === 0 ? (
                                    <Typography variant="body2" color="text.disabled" textAlign="center" py={3}>등록된 일정이 없습니다.</Typography>
                                ) : (
                                    <Stack spacing={3}>
                                        {domesticItineraries.map(item => {
                                            return (
                                                <Box key={item.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                                                    <Box sx={{ px: 2.5, py: 1.5, bgcolor: '#e8f5e9', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Chip label={`${item.dayNumber}일차`} size="small" sx={{ bgcolor: '#2e7d32', color: '#fff', fontWeight: 700 }} />
                                                        <Typography fontWeight={700} sx={{ fontSize: '1rem' }}>{item.title}</Typography>
                                                    </Box>
                                                    <Box sx={{ px: 2.5, py: 2 }}>
                                                        {item.description && (
                                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
                                                                {item.description}
                                                            </Typography>
                                                        )}
                                                        {/* 타임라인 */}
                                                        {(item.schedules || []).length > 0 && (
                                                            <Box sx={{ mb: 1 }}>
                                                                {item.schedules.map((s, idx) => (
                                                                    <Box key={s.id}>
                                                                        <Box sx={{ display: 'flex', gap: 1.5 }}>
                                                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                                                                                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'primary.main', mt: '3px', flexShrink: 0 }} />
                                                                                {(idx < item.schedules.length - 1 || (s.images || []).length > 0) && (
                                                                                    <Box sx={{ width: 2, flex: 1, minHeight: 16, bgcolor: 'primary.light', my: 0.5 }} />
                                                                                )}
                                                                            </Box>
                                                                            <Box sx={{ flex: 1, pb: 0.5 }}>
                                                                                <Stack direction="row" spacing={1} alignItems="baseline" mb={0.5}>
                                                                                    {s.time && (
                                                                                        <Typography variant="caption" fontWeight={700} color="primary.main" sx={{ flexShrink: 0, minWidth: 58 }}>
                                                                                            {formatTime(s.time)}
                                                                                        </Typography>
                                                                                    )}
                                                                                    <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>{s.description}</Typography>
                                                                                </Stack>
                                                                                {(s.images || []).length > 0 && (
                                                                                    <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 1 }}>
                                                                                        {s.images.map(img => (
                                                                                            <Box key={img.id} component="img"
                                                                                                src={`${IMG_BASE}${img.imagePath}`}
                                                                                                sx={{ width: 140, height: 100, objectFit: 'cover', borderRadius: 1 }} />
                                                                                        ))}
                                                                                    </Stack>
                                                                                )}
                                                                            </Box>
                                                                        </Box>
                                                                    </Box>
                                                                ))}
                                                            </Box>
                                                        )}
                                                        {item.hotelName && (
                                                            <Box sx={{ mt: 1, mb: 1 }}>
                                                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                                                    <HotelIcon fontSize="small" color="action" />
                                                                    <Typography variant="body2" fontWeight={700}>숙박: {item.hotelName}</Typography>
                                                                </Stack>
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
                        {domesticDetail && (domesticDetail.includedItems || domesticDetail.excludedItems) && (
                            <Box>
                                <Divider />
                                <Box sx={{ p: { xs: 2.5, md: 4 } }}>
                                    <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '1rem', md: '1.15rem' }, mb: 2.5 }}>
                                        포함 / 불포함 정보
                                    </Typography>
                                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                                        {domesticDetail.includedItems && (
                                            <Box sx={{ flex: 1, p: 2, bgcolor: '#f1f8e9', borderRadius: 2, borderLeft: '4px solid #66bb6a' }}>
                                                <Typography variant="body2" fontWeight={700} color="#2e7d32" mb={1}>✅ 포함 사항</Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>{domesticDetail.includedItems}</Typography>
                                            </Box>
                                        )}
                                        {domesticDetail.excludedItems && (
                                            <Box sx={{ flex: 1, p: 2, bgcolor: '#fce4ec', borderRadius: 2, borderLeft: '4px solid #ef5350' }}>
                                                <Typography variant="body2" fontWeight={700} color="#c62828" mb={1}>❌ 불포함 사항</Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>{domesticDetail.excludedItems}</Typography>
                                            </Box>
                                        )}
                                    </Stack>
                                </Box>
                            </Box>
                        )}

                        {/* 가이드 / 인솔자 미팅정보 */}
                        {domesticDetail && (domesticDetail.guideName || domesticDetail.meetingLocation) && (
                            <Box>
                                <Divider />
                                <Box sx={{ p: { xs: 2.5, md: 4 } }}>
                                    <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '1rem', md: '1.15rem' }, mb: 2.5 }}>
                                        가이드 / 인솔자 미팅정보
                                    </Typography>
                                    <Stack spacing={1.5}>
                                        {domesticDetail.guideName && (
                                            <Stack direction="row" spacing={2}>
                                                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>인솔자명</Typography>
                                                <Typography variant="body2" fontWeight={600}>{domesticDetail.guideName}</Typography>
                                            </Stack>
                                        )}
                                        {domesticDetail.guidePhone && (
                                            <Stack direction="row" spacing={2}>
                                                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>연락처</Typography>
                                                <Typography variant="body2" fontWeight={600}>{domesticDetail.guidePhone}</Typography>
                                            </Stack>
                                        )}
                                        {domesticDetail.meetingLocation && (
                                            <Stack direction="row" spacing={2}>
                                                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>미팅 장소</Typography>
                                                <Typography variant="body2" fontWeight={600}>{domesticDetail.meetingLocation}</Typography>
                                            </Stack>
                                        )}
                                        {domesticDetail.meetingTime && (
                                            <Stack direction="row" spacing={2}>
                                                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>미팅 시간</Typography>
                                                <Typography variant="body2" fontWeight={600}>{domesticDetail.meetingTime}</Typography>
                                            </Stack>
                                        )}
                                        {domesticDetail.notes && (
                                            <Box sx={{ mt: 1, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                                <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: '#111', fontWeight: 500 }}>{domesticDetail.notes}</Typography>
                                            </Box>
                                        )}
                                    </Stack>
                                </Box>
                            </Box>
                        )}

                        {/* 상품 가격 */}
                        {domesticDetail && (domesticDetail.priceAdult || domesticDetail.priceChild || domesticDetail.priceInfant) && (
                            <Box>
                                <Divider />
                                <Box sx={{ p: { xs: 2.5, md: 4 } }}>
                                    <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '1rem', md: '1.15rem' }, mb: 2.5 }}>
                                        상품 가격
                                    </Typography>
                                    {(domesticDetail.ageAdult || domesticDetail.ageChild || domesticDetail.ageInfant) && (
                                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2.5, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                                            {domesticDetail.ageAdult  && <Typography variant="caption" sx={{ color: '#111' }}>성인: <strong>{domesticDetail.ageAdult}</strong></Typography>}
                                            {domesticDetail.ageChild  && <Typography variant="caption" sx={{ color: '#111' }}>아동: <strong>{domesticDetail.ageChild}</strong></Typography>}
                                            {domesticDetail.ageInfant && <Typography variant="caption" sx={{ color: '#111' }}>유아: <strong>{domesticDetail.ageInfant}</strong></Typography>}
                                        </Stack>
                                    )}
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: 'grey.50' }}>
                                                <TableCell align="center" sx={{ fontWeight: 700 }}>성인</TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 700 }}>아동</TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 700 }}>유아</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell align="center" sx={{ color: '#111', fontWeight: 600 }}>{domesticDetail.priceAdult ? Number(domesticDetail.priceAdult).toLocaleString() + '원' : '-'}</TableCell>
                                                <TableCell align="center" sx={{ color: '#111' }}>{domesticDetail.priceChild  ? Number(domesticDetail.priceChild).toLocaleString()  + '원' : '-'}</TableCell>
                                                <TableCell align="center" sx={{ color: '#111' }}>{domesticDetail.priceInfant ? Number(domesticDetail.priceInfant).toLocaleString() + '원' : '-'}</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                    {domesticDetail.surchargeInfo && (
                                        <Box sx={{ mt: 3 }}>
                                            <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>추가비용 안내</Typography>
                                            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                                <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: '#111' }}>{domesticDetail.surchargeInfo}</Typography>
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        )}

                        {/* 유의사항 */}
                        {domesticDetail && (domesticDetail.insuranceInfo || domesticDetail.emergencyContact || domesticDetail.otherNotices) && (
                            <Box>
                                <Divider />
                                <Box sx={{ p: { xs: 2.5, md: 4 } }}>
                                    <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '1rem', md: '1.15rem' }, mb: 2.5 }}>
                                        유의사항
                                    </Typography>
                                    <Stack spacing={2}>
                                        {[
                                            { label: '여행자 보험',   value: domesticDetail.insuranceInfo },
                                            { label: '비상 연락처',   value: domesticDetail.emergencyContact },
                                            { label: '기타 유의사항', value: domesticDetail.otherNotices },
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

                        {/* 상품약관 / 예약시유의사항 */}
                        {domesticDetail && (domesticDetail.terms || domesticDetail.reservationNotes) && (
                            <Box>
                                <Divider />
                                <Box sx={{ p: { xs: 2.5, md: 4 } }}>
                                    <Stack spacing={3}>
                                        {[
                                            { label: '상품 약관',       value: domesticDetail.terms },
                                            { label: '예약시 유의사항', value: domesticDetail.reservationNotes },
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

                {/* ── 수학여행 전용 섹션 ── */}
                {category === 'school' && (
                    <>
                        {/* 여행 일정 */}
                        <Box>
                            <Divider />
                            <Box sx={{ p: { xs: 2.5, md: 4 } }}>
                                <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '1rem', md: '1.15rem' }, mb: 2.5 }}>
                                    여행 일정
                                </Typography>
                                {schoolTripItineraries.length === 0 ? (
                                    <Typography variant="body2" color="text.disabled" textAlign="center" py={3}>등록된 일정이 없습니다.</Typography>
                                ) : (
                                    <Stack spacing={3}>
                                        {schoolTripItineraries.map(item => {
                                            return (
                                                <Box key={item.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                                                    <Box sx={{ px: 2.5, py: 1.5, bgcolor: '#e8eaf6', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Chip label={`${item.dayNumber}일차`} size="small" sx={{ bgcolor: '#3f51b5', color: '#fff', fontWeight: 700 }} />
                                                        <Typography fontWeight={700} sx={{ fontSize: '1rem' }}>{maskSchoolText(item.title)}</Typography>
                                                    </Box>
                                                    <Box sx={{ px: 2.5, py: 2 }}>
                                                        {item.description && (
                                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
                                                                {maskSchoolText(item.description)}
                                                            </Typography>
                                                        )}
                                                        {/* 타임라인 */}
                                                        {(item.schedules || []).length > 0 && (
                                                            <Box sx={{ mb: 1 }}>
                                                                {item.schedules.map((s, idx) => (
                                                                    <Box key={s.id}>
                                                                        <Box sx={{ display: 'flex', gap: 1.5 }}>
                                                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                                                                                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'primary.main', mt: '3px', flexShrink: 0 }} />
                                                                                {(idx < item.schedules.length - 1 || (s.images || []).length > 0) && (
                                                                                    <Box sx={{ width: 2, flex: 1, minHeight: 16, bgcolor: 'primary.light', my: 0.5 }} />
                                                                                )}
                                                                            </Box>
                                                                            <Box sx={{ flex: 1, pb: 0.5 }}>
                                                                                <Stack direction="row" spacing={1} alignItems="baseline" mb={0.5}>
                                                                                    {s.time && (
                                                                                        <Typography variant="caption" fontWeight={700} color="primary.main" sx={{ flexShrink: 0, minWidth: 58 }}>
                                                                                            {formatTime(s.time)}
                                                                                        </Typography>
                                                                                    )}
                                                                                    <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>{maskSchoolText(s.description)}</Typography>
                                                                                </Stack>
                                                                                {(s.images || []).length > 0 && (
                                                                                    <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 1 }}>
                                                                                        {s.images.map(img => (
                                                                                            <Box key={img.id} component="img"
                                                                                                src={`${IMG_BASE}${img.imagePath}`}
                                                                                                sx={{ width: 140, height: 100, objectFit: 'cover', borderRadius: 1 }} />
                                                                                        ))}
                                                                                    </Stack>
                                                                                )}
                                                                            </Box>
                                                                        </Box>
                                                                    </Box>
                                                                ))}
                                                            </Box>
                                                        )}
                                                        {item.hotelName && (
                                                            <Box sx={{ mt: 1, mb: 1 }}>
                                                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                                                    <HotelIcon fontSize="small" color="action" />
                                                                    <Typography variant="body2" fontWeight={700}>숙박: {maskSchoolText(item.hotelName)}</Typography>
                                                                </Stack>
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

                        {/* 교통편 안내 */}
                        {schoolTripDetail?.transportInfo && (
                            <Box>
                                <Divider />
                                <Box sx={{ p: { xs: 2.5, md: 4 } }}>
                                    <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '1rem', md: '1.15rem' }, mb: 2.5 }}>
                                        교통편 안내
                                    </Typography>
                                    <Box sx={{ p: 2, bgcolor: '#e8eaf6', borderRadius: 2, borderLeft: '4px solid #3f51b5' }}>
                                        <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: '#111' }}>{maskSchoolText(schoolTripDetail.transportInfo)}</Typography>
                                    </Box>
                                </Box>
                            </Box>
                        )}

                        {/* 포함 / 불포함 */}
                        {schoolTripDetail && (schoolTripDetail.includedItems || schoolTripDetail.excludedItems) && (
                            <Box>
                                <Divider />
                                <Box sx={{ p: { xs: 2.5, md: 4 } }}>
                                    <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '1rem', md: '1.15rem' }, mb: 2.5 }}>
                                        포함 / 불포함 정보
                                    </Typography>
                                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                                        {schoolTripDetail.includedItems && (
                                            <Box sx={{ flex: 1, p: 2, bgcolor: '#f1f8e9', borderRadius: 2, borderLeft: '4px solid #66bb6a' }}>
                                                <Typography variant="body2" fontWeight={700} color="#2e7d32" mb={1}>✅ 포함 사항</Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>{maskSchoolText(schoolTripDetail.includedItems)}</Typography>
                                            </Box>
                                        )}
                                        {schoolTripDetail.excludedItems && (
                                            <Box sx={{ flex: 1, p: 2, bgcolor: '#fce4ec', borderRadius: 2, borderLeft: '4px solid #ef5350' }}>
                                                <Typography variant="body2" fontWeight={700} color="#c62828" mb={1}>❌ 불포함 사항</Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>{maskSchoolText(schoolTripDetail.excludedItems)}</Typography>
                                            </Box>
                                        )}
                                    </Stack>
                                </Box>
                            </Box>
                        )}

                        {/* 가이드 / 인솔자 미팅정보 */}
                        {schoolTripDetail && (schoolTripDetail.guideName || schoolTripDetail.meetingLocation) && (
                            <Box>
                                <Divider />
                                <Box sx={{ p: { xs: 2.5, md: 4 } }}>
                                    <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '1rem', md: '1.15rem' }, mb: 2.5 }}>
                                        가이드 / 인솔자 미팅정보
                                    </Typography>
                                    <Stack spacing={1.5}>
                                        {schoolTripDetail.guideName && (
                                            <Stack direction="row" spacing={2}>
                                                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>인솔자명</Typography>
                                                <Typography variant="body2" fontWeight={600}>{schoolTripDetail.guideName}</Typography>
                                            </Stack>
                                        )}
                                        {schoolTripDetail.guidePhone && (
                                            <Stack direction="row" spacing={2}>
                                                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>연락처</Typography>
                                                <Typography variant="body2" fontWeight={600}>{schoolTripDetail.guidePhone}</Typography>
                                            </Stack>
                                        )}
                                        {schoolTripDetail.meetingLocation && (
                                            <Stack direction="row" spacing={2}>
                                                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>미팅 장소</Typography>
                                                <Typography variant="body2" fontWeight={600}>{maskSchoolText(schoolTripDetail.meetingLocation)}</Typography>
                                            </Stack>
                                        )}
                                        {schoolTripDetail.meetingTime && (
                                            <Stack direction="row" spacing={2}>
                                                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>미팅 시간</Typography>
                                                <Typography variant="body2" fontWeight={600}>{schoolTripDetail.meetingTime}</Typography>
                                            </Stack>
                                        )}
                                        {schoolTripDetail.notes && (
                                            <Box sx={{ mt: 1, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                                <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: '#111', fontWeight: 500 }}>{maskSchoolText(schoolTripDetail.notes)}</Typography>
                                            </Box>
                                        )}
                                    </Stack>
                                </Box>
                            </Box>
                        )}

                        {/* 상품 가격 — 수학여행은 입찰·상담 플로우로 진행되어 클라이언트 화면에 미표시 */}
                        {false && schoolTripDetail && (schoolTripDetail.priceAdult || schoolTripDetail.priceChild || schoolTripDetail.priceInfant) && (
                            <Box>
                                <Divider />
                                <Box sx={{ p: { xs: 2.5, md: 4 } }}>
                                    <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '1rem', md: '1.15rem' }, mb: 2.5 }}>
                                        상품 가격
                                    </Typography>
                                    {(schoolTripDetail.ageAdult || schoolTripDetail.ageChild || schoolTripDetail.ageInfant) && (
                                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2.5, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                                            {schoolTripDetail.ageAdult  && <Typography variant="caption" sx={{ color: '#111' }}>교사: <strong>{schoolTripDetail.ageAdult}</strong></Typography>}
                                            {schoolTripDetail.ageChild  && <Typography variant="caption" sx={{ color: '#111' }}>학생: <strong>{schoolTripDetail.ageChild}</strong></Typography>}
                                            {schoolTripDetail.ageInfant && <Typography variant="caption" sx={{ color: '#111' }}>유아: <strong>{schoolTripDetail.ageInfant}</strong></Typography>}
                                        </Stack>
                                    )}
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: 'grey.50' }}>
                                                <TableCell align="center" sx={{ fontWeight: 700 }}>교사 (성인)</TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 700 }}>학생 (아동)</TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 700 }}>유아</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell align="center" sx={{ color: '#111', fontWeight: 600 }}>{schoolTripDetail.priceAdult ? Number(schoolTripDetail.priceAdult).toLocaleString() + '원' : '-'}</TableCell>
                                                <TableCell align="center" sx={{ color: '#111' }}>{schoolTripDetail.priceChild  ? Number(schoolTripDetail.priceChild).toLocaleString()  + '원' : '-'}</TableCell>
                                                <TableCell align="center" sx={{ color: '#111' }}>{schoolTripDetail.priceInfant ? Number(schoolTripDetail.priceInfant).toLocaleString() + '원' : '-'}</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                    {schoolTripDetail.surchargeInfo && (
                                        <Box sx={{ mt: 3 }}>
                                            <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>추가비용 안내</Typography>
                                            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                                <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: '#111' }}>{schoolTripDetail.surchargeInfo}</Typography>
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        )}

                        {/* 유의사항 */}
                        {schoolTripDetail && (schoolTripDetail.insuranceInfo || schoolTripDetail.emergencyContact || schoolTripDetail.otherNotices) && (
                            <Box>
                                <Divider />
                                <Box sx={{ p: { xs: 2.5, md: 4 } }}>
                                    <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '1rem', md: '1.15rem' }, mb: 2.5 }}>
                                        유의사항
                                    </Typography>
                                    <Stack spacing={2}>
                                        {[
                                            { label: '여행자 보험',   value: schoolTripDetail.insuranceInfo },
                                            { label: '비상 연락처',   value: schoolTripDetail.emergencyContact },
                                            { label: '기타 유의사항', value: schoolTripDetail.otherNotices },
                                        ].filter(r => r.value).map(r => (
                                            <Box key={r.label}>
                                                <Typography variant="body2" fontWeight={700} sx={{ mb: 0.75 }}>{r.label}</Typography>
                                                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: '#111' }}>{maskSchoolText(r.value)}</Typography>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Stack>
                                </Box>
                            </Box>
                        )}

                        {/* 상품약관 / 예약시유의사항 */}
                        {schoolTripDetail && (schoolTripDetail.terms || schoolTripDetail.reservationNotes) && (
                            <Box>
                                <Divider />
                                <Box sx={{ p: { xs: 2.5, md: 4 } }}>
                                    <Stack spacing={3}>
                                        {[
                                            { label: '상품 약관',       value: schoolTripDetail.terms },
                                            { label: '예약시 유의사항', value: schoolTripDetail.reservationNotes },
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

            {/* ── 예약 신청 다이얼로그 ── */}
            <Dialog
                open={bookingOpen}
                onClose={() => !bookingSubmitting && setBookingOpen(false)}
                maxWidth="sm" fullWidth
                PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
            >
                {/* 헤더 */}
                <Box sx={{
                    background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                    px: 3, pt: 3, pb: 2.5,
                }}>
                    <Typography variant="h6" fontWeight={700} color="white" sx={{ letterSpacing: -0.3 }}>
                        예약 신청
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.78)', mt: 0.3, fontSize: '0.82rem' }}>
                        담당자 확인 후 연락드립니다
                    </Typography>
                    {product?.productName && (
                        <Chip
                            label={product.productName}
                            size="small"
                            sx={{
                                mt: 1.5,
                                backgroundColor: 'rgba(255,255,255,0.18)',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.78rem',
                                maxWidth: '100%',
                                height: 26,
                                '& .MuiChip-label': { px: 1.5 },
                            }}
                        />
                    )}
                </Box>

                <DialogContent sx={{ px: 3, pt: 2.5, pb: 1 }}>
                    <Stack spacing={2.5}>

                        {/* 예약자 정보 */}
                        <Box>
                            <Typography variant="caption" color="text.disabled" fontWeight={700}
                                sx={{ textTransform: 'uppercase', letterSpacing: 0.8, fontSize: '0.7rem' }}>
                                예약자 정보
                            </Typography>
                            <Stack spacing={1.5} sx={{ mt: 1.2 }}>
                                <TextField
                                    label="이름 *" size="small" fullWidth
                                    value={bookingForm.name}
                                    onChange={e => setBookingForm(f => ({ ...f, name: e.target.value }))}
                                />
                                <TextField
                                    label="연락처 *" size="small" fullWidth
                                    placeholder="010-0000-0000"
                                    value={bookingForm.phone}
                                    onChange={e => setBookingForm(f => ({ ...f, phone: e.target.value }))}
                                />
                                <TextField
                                    label="이메일" size="small" fullWidth
                                    value={bookingForm.email}
                                    onChange={e => setBookingForm(f => ({ ...f, email: e.target.value }))}
                                />
                            </Stack>
                        </Box>

                        <Divider />

                        {/* 여행 정보 */}
                        <Box>
                            <Typography variant="caption" color="text.disabled" fontWeight={700}
                                sx={{ textTransform: 'uppercase', letterSpacing: 0.8, fontSize: '0.7rem' }}>
                                여행 정보
                            </Typography>
                            <Stack spacing={1.5} sx={{ mt: 1.2 }}>

                                {/* 크루즈 객실 타입 선택 */}
                                {category === 'cruise' && cruisePrices.length > 0 && (
                                    <FormControl size="small" fullWidth>
                                        <InputLabel>객실 타입</InputLabel>
                                        <Select
                                            value={bookingCabinType}
                                            label="객실 타입"
                                            onChange={e => setBookingCabinType(e.target.value)}
                                        >
                                            {cruisePrices.map(p => (
                                                <MenuItem key={p.id} value={p.cabinType}>
                                                    {p.cabinType}
                                                    {p.priceAdult ? ` — 성인 ${Number(p.priceAdult).toLocaleString()}원` : ''}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                )}

                                {/* 인원수 */}
                                <Stack direction="row" spacing={1}>
                                    {[
                                        { key: 'adultCount',  label: '성인', min: 1, required: true,  price: priceInfo?.adult  },
                                        { key: 'childCount',  label: '아동', min: 0, required: false, price: priceInfo?.child  },
                                        { key: 'infantCount', label: '유아', min: 0, required: false, price: priceInfo?.infant },
                                    ].map(({ key, label, min, required, price }) => (
                                        <Box key={key} sx={{
                                            flex: 1,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            borderRadius: 2,
                                            p: 1.2,
                                            textAlign: 'center',
                                            bgcolor: 'grey.50',
                                        }}>
                                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                                {label}{required && ' *'}
                                            </Typography>
                                            <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5} sx={{ mt: 0.5 }}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => setBookingForm(f => ({ ...f, [key]: Math.max(min, f[key] - 1) }))}
                                                    disabled={bookingForm[key] <= min}
                                                    sx={{ p: 0.3, color: 'primary.main' }}
                                                >
                                                    <RemoveIcon sx={{ fontSize: 16 }} />
                                                </IconButton>
                                                <Typography fontWeight={700} sx={{ minWidth: 24, fontSize: '1rem' }}>
                                                    {bookingForm[key]}
                                                </Typography>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => setBookingForm(f => ({ ...f, [key]: f[key] + 1 }))}
                                                    sx={{ p: 0.3, color: 'primary.main' }}
                                                >
                                                    <AddIcon sx={{ fontSize: 16 }} />
                                                </IconButton>
                                            </Stack>
                                            {price ? (
                                                <Typography variant="caption" color="text.disabled" sx={{ mt: 0.4, display: 'block', fontSize: '0.68rem' }}>
                                                    {Number(price).toLocaleString()}원/인
                                                </Typography>
                                            ) : null}
                                        </Box>
                                    ))}
                                </Stack>

                                {/* 예상 금액 */}
                                {bookingTotalPrice > 0 && (
                                    <Box sx={{ p: 1.5, bgcolor: '#e8f5e9', borderRadius: 2, border: '1px solid #a5d6a7' }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Typography variant="body2" color="text.secondary" fontWeight={600}>예상 금액</Typography>
                                            <Typography fontWeight={800} color="#2e7d32" sx={{ fontSize: '1.05rem' }}>
                                                {bookingTotalPrice.toLocaleString()}원
                                            </Typography>
                                        </Stack>
                                        <Typography variant="caption" color="text.disabled" sx={{ mt: 0.3, display: 'block' }}>
                                            * 최종 금액은 담당자 확인 후 안내드립니다.
                                        </Typography>
                                    </Box>
                                )}

                                {/* 출발일 */}
                                {product?.departureAt ? (
                                    <Box sx={{ px: 1.5, py: 1.2, bgcolor: 'grey.50', borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
                                        <Typography variant="caption" color="text.disabled" fontWeight={600} display="block" mb={0.3}>출발일</Typography>
                                        <Typography variant="body2" fontWeight={700}>
                                            {new Date(product.departureAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </Typography>
                                    </Box>
                                ) : (
                                    <TextField
                                        label="희망 출발일" size="small" fullWidth type="date"
                                        InputLabelProps={{ shrink: true }}
                                        value={bookingForm.desiredDepartureAt}
                                        onChange={e => setBookingForm(f => ({ ...f, desiredDepartureAt: e.target.value }))}
                                    />
                                )}
                            </Stack>
                        </Box>

                        <Divider />

                        {/* 요청사항 */}
                        <TextField
                            label="요청사항" size="small" fullWidth multiline rows={3}
                            placeholder="특별한 요청사항이 있으시면 입력해 주세요."
                            value={bookingForm.requestMemo}
                            onChange={e => setBookingForm(f => ({ ...f, requestMemo: e.target.value }))}
                        />

                    </Stack>
                </DialogContent>

                <DialogActions sx={{ px: 3, pt: 1.5, pb: 3, gap: 1 }}>
                    <Button
                        variant="contained"
                        onClick={() => setBookingOpen(false)}
                        disabled={bookingSubmitting}
                        sx={{ flex: 1, borderRadius: 2 }}
                    >
                        취소
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleBookingSubmit}
                        disabled={bookingSubmitting || !bookingForm.name.trim() || !bookingForm.phone.trim()}
                        sx={{ flex: 2, borderRadius: 2, py: 1, fontWeight: 700 }}
                    >
                        {bookingSubmitting
                            ? <CircularProgress size={20} color="inherit" />
                            : '예약하기'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── 예약 완료 다이얼로그 ── */}
            <Dialog open={bookingSuccess} onClose={() => setBookingSuccess(false)} maxWidth="xs" fullWidth
                PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
                <Box sx={{ textAlign: 'center', pt: 4, pb: 1, px: 3 }}>
                    <Box sx={{
                        width: 64, height: 64, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #43a047, #1b5e20)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        mx: 'auto', mb: 2,
                    }}>
                        <Typography sx={{ fontSize: 28, lineHeight: 1 }}>✓</Typography>
                    </Box>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                        예약 신청 완료!
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        담당자 확인 후 연락드리겠습니다
                    </Typography>
                </Box>
                <DialogContent sx={{ px: 3, pt: 1.5 }}>
                    <Stack spacing={1.5}>
                        {bookingNumber && (
                            <Box sx={{
                                border: '1px solid',
                                borderColor: 'primary.light',
                                borderRadius: 2,
                                px: 2, py: 1.5,
                                bgcolor: 'primary.50',
                                textAlign: 'center',
                            }}>
                                <Typography variant="caption" color="primary.main" fontWeight={600}
                                    sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                    예약번호
                                </Typography>
                                <Typography variant="body1" fontWeight={700} color="primary.main" sx={{ mt: 0.3 }}>
                                    {bookingNumber}
                                </Typography>
                            </Box>
                        )}
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={() => {
                                const w = 540, h = 660;
                                const left = Math.round((window.screen.width - w) / 2);
                                const top = Math.round((window.screen.height - h) / 2);
                                window.open(`/payment/${bookingNumber}`, '_blank', `width=${w},height=${h},left=${left},top=${top},noopener,noreferrer`);
                            }}
                            sx={{
                                bgcolor: '#1976d2', color: '#fff', fontWeight: 700,
                                borderRadius: 2, py: 1.2, fontSize: '1rem',
                                '&:hover': { bgcolor: '#1565c0' },
                            }}>
                            결제하기
                        </Button>
                        <Typography variant="caption" color="text.disabled" sx={{ textAlign: 'center', display: 'block' }}>
                            문의: 031-466-9600 · with@rohitour.com
                        </Typography>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1 }}>
                    <Button variant="contained" onClick={() => setBookingSuccess(false)}
                        sx={{ flex: 1, borderRadius: 2 }}>확인</Button>
                    <Button variant="contained" onClick={() => { setBookingSuccess(false); navigate('/client/bookings'); }}
                        sx={{ flex: 2, borderRadius: 2, fontWeight: 700 }}>
                        이용내역 보기
                    </Button>
                </DialogActions>
            </Dialog>


        </Box>
    );
}
