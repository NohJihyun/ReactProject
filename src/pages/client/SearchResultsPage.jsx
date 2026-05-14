import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    Box, Container, Typography, Chip, Skeleton, Stack,
} from '@mui/material';
import SearchIcon         from '@mui/icons-material/Search';
import PeopleIcon         from '@mui/icons-material/People';
import AttachMoneyIcon    from '@mui/icons-material/AttachMoney';
import SchoolIcon         from '@mui/icons-material/School';
import LandscapeIcon      from '@mui/icons-material/Landscape';
import FlightIcon         from '@mui/icons-material/Flight';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import { searchProducts } from '../../api/clientApi';

const IMG_BASE = 'http://localhost:8080';

const CATEGORY_PATH = {
    '국내여행':     'domestic',
    '항공 해외여행': 'air',
    '크루즈 해외여행':'cruise',
    '수학여행':     'school',
};

const CATEGORY_META = {
    domestic: { icon: <LandscapeIcon sx={{ fontSize: 14 }} />,      color: '#2e7d32', label: '국내여행' },
    air:      { icon: <FlightIcon sx={{ fontSize: 14 }} />,         color: '#e65100', label: '항공 해외여행' },
    cruise:   { icon: <DirectionsBoatIcon sx={{ fontSize: 14 }} />, color: '#0277bd', label: '크루즈 해외여행' },
    school:   { icon: <SchoolIcon sx={{ fontSize: 14 }} />,         color: '#3f51b5', label: '수학여행' },
};

const formatPrice = (price) =>
    price ? Number(price).toLocaleString('ko-KR') + '원~' : null;

const getStatusChip = (exposureEndAt) => {
    if (!exposureEndAt) return { label: '상시운영', color: '#2e7d32', bg: '#e8f5e9' };
    const days = Math.ceil((new Date(exposureEndAt) - new Date()) / 86400000);
    if (days <= 0)  return { label: '마감',               color: '#757575', bg: '#f5f5f5' };
    if (days <= 7)  return { label: `마감임박 D-${days}`, color: '#e65100', bg: '#fff3e0' };
    return               { label: '진행중',               color: '#1565c0', bg: '#e3f2fd' };
};

function ProductCard({ product, categorySlug, onClick }) {
    const price      = formatPrice(product.pricePerPerson);
    const meta       = CATEGORY_META[categorySlug] ?? {};
    const statusChip = getStatusChip(product.exposureEndAt);
    const peopleLabel = product.minPeople && product.maxPeople
        ? `${product.minPeople}~${product.maxPeople}인`
        : product.minPeople ? `${product.minPeople}인 이상`
        : product.maxPeople ? `최대 ${product.maxPeople}인` : null;

    return (
        <Box
            onClick={onClick}
            sx={{
                borderRadius: 3, overflow: 'hidden', bgcolor: 'white',
                boxShadow: '0 2px 12px rgba(0,0,0,0.10)', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', height: 400,
                transition: 'transform 0.25s, box-shadow 0.25s',
                '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 8px 28px rgba(0,0,0,0.16)' },
            }}
        >
            {/* 썸네일 */}
            <Box sx={{ position: 'relative', width: '100%', height: 190, flexShrink: 0, bgcolor: '#f0f0f0' }}>
                {product.thumbnailPath ? (
                    <img
                        src={`${IMG_BASE}${product.thumbnailPath}`}
                        alt={product.productName}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                ) : (
                    <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: 40 }}>
                        🏞
                    </Box>
                )}
                {/* 카테고리 뱃지 */}
                {meta.color && (
                    <Box sx={{
                        position: 'absolute', top: 8, left: 8,
                        display: 'flex', alignItems: 'center', gap: 0.4,
                        px: 1, py: 0.4, borderRadius: 1,
                        bgcolor: meta.color, color: 'white', fontSize: '0.7rem', fontWeight: 700,
                    }}>
                        {meta.icon}
                        <span>{meta.label}</span>
                    </Box>
                )}
            </Box>

            {/* 내용 */}
            <Box sx={{ p: 2, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <Stack direction="row" spacing={0.75} sx={{ mb: 0.75 }}>
                    <Chip label={statusChip.label} size="small"
                        sx={{ bgcolor: statusChip.bg, color: statusChip.color, fontWeight: 700, fontSize: '0.7rem' }} />
                    {product.isFeatured === 'Y' && (
                        <Chip label="추천" size="small"
                            sx={{ bgcolor: '#ff6f00', color: 'white', fontWeight: 700, fontSize: '0.7rem' }} />
                    )}
                </Stack>

                <Typography variant="subtitle1" fontWeight={700}
                    sx={{ overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', mb: 0.5 }}>
                    {product.productName}
                </Typography>

                <Typography variant="body2" color="text.secondary"
                    sx={{ overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.6, mb: 1 }}>
                    {product.summary || ''}
                </Typography>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {peopleLabel && (
                        <Chip icon={<PeopleIcon sx={{ fontSize: '14px !important' }} />} label={peopleLabel}
                            size="small" variant="outlined" sx={{ fontSize: '0.72rem' }} />
                    )}
                    {price && (
                        <Chip icon={<AttachMoneyIcon sx={{ fontSize: '14px !important' }} />} label={price}
                            size="small" variant="outlined" color="primary" sx={{ fontSize: '0.72rem' }} />
                    )}
                </Stack>

                {(product.departureLocation || product.arrivalLocation) && (
                    <Box sx={{ mt: 'auto', pt: 1, display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                        <Box sx={{ color: meta.color, display: 'flex', alignItems: 'center' }}>{meta.icon}</Box>
                        <Typography variant="caption" fontWeight={600}>{product.departureLocation}</Typography>
                        <Typography variant="caption" sx={{ color: '#aaa' }}>→</Typography>
                        <Typography variant="caption" fontWeight={600}>{product.arrivalLocation}</Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
}

function CardSkeleton() {
    return (
        <Box sx={{ borderRadius: 3, overflow: 'hidden', bgcolor: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', height: 400, display: 'flex', flexDirection: 'column' }}>
            <Skeleton variant="rectangular" width="100%" height={190} sx={{ flexShrink: 0 }} />
            <Box sx={{ p: 2, flex: 1 }}>
                <Skeleton variant="text" width="40%" height={24} sx={{ mb: 0.75 }} />
                <Skeleton variant="text" width="80%" height={26} sx={{ mb: 0.5 }} />
                <Skeleton variant="text" width="100%" />
                <Skeleton variant="text" width="60%" sx={{ mb: 1 }} />
                <Skeleton variant="text" width="50%" height={24} />
            </Box>
        </Box>
    );
}

export default function SearchResultsPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const keyword = searchParams.get('q') || '';
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!keyword.trim()) { setProducts([]); return; }
        setLoading(true);
        searchProducts(keyword.trim(), 50)
            .then(setProducts)
            .catch(() => setProducts([]))
            .finally(() => setLoading(false));
    }, [keyword]);

    return (
        <Box sx={{ bgcolor: '#f7f8fc', minHeight: '100vh', py: 5 }}>
            <Container maxWidth="xl">
                {/* 헤더 */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <Box sx={{
                        width: 48, height: 48, borderRadius: 2, bgcolor: '#1976d2',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <SearchIcon sx={{ color: 'white', fontSize: 26 }} />
                    </Box>
                    <Box>
                        <Typography variant="h5" fontWeight={800} lineHeight={1.2}
                            sx={{ fontSize: { xs: '1.3rem', md: '1.7rem' } }}>
                            '{keyword}' 검색 결과
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            총 {loading ? '-' : products.length}건
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ height: 3, width: 48, borderRadius: 2, bgcolor: '#1976d2', mb: 4 }} />

                {/* 키워드 없음 */}
                {!keyword.trim() && (
                    <Box sx={{ py: 10, textAlign: 'center', borderRadius: 3, bgcolor: 'white', border: '1px dashed #ddd' }}>
                        <Typography color="text.disabled" variant="h6">검색어를 입력해주세요.</Typography>
                    </Box>
                )}

                {/* 로딩 */}
                {loading && (
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', md: 'repeat(3,1fr)', lg: 'repeat(4,1fr)' }, gap: 3 }}>
                        {[1,2,3,4].map(i => <CardSkeleton key={i} />)}
                    </Box>
                )}

                {/* 결과 없음 */}
                {!loading && keyword.trim() && products.length === 0 && (
                    <Box sx={{ py: 10, textAlign: 'center', borderRadius: 3, bgcolor: 'white', border: '1px dashed #ddd' }}>
                        <Typography color="text.disabled" variant="h6">검색 결과가 없습니다.</Typography>
                        <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
                            다른 키워드로 검색해보세요.
                        </Typography>
                    </Box>
                )}

                {/* 결과 그리드 */}
                {!loading && products.length > 0 && (
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', md: 'repeat(3,1fr)', lg: 'repeat(4,1fr)' }, gap: 3 }}>
                        {products.map(p => {
                            const cat = CATEGORY_PATH[p.rootCategoryName] || 'domestic';
                            return (
                                <ProductCard
                                    key={p.productId}
                                    product={p}
                                    categorySlug={cat}
                                    onClick={() => { navigate(`/tour/${cat}/${p.productId}`); window.scrollTo(0, 0); }}
                                />
                            );
                        })}
                    </Box>
                )}
            </Container>
        </Box>
    );
}
