import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Container, Typography, Grid, Chip, Skeleton, Stack,
} from '@mui/material';
import PeopleIcon       from '@mui/icons-material/People';
import AttachMoneyIcon  from '@mui/icons-material/AttachMoney';
import { getProductsByCategory } from '../../api/clientApi';

const IMG_BASE = 'http://localhost:8080';

const CATEGORY_MAP = {
    school:   '수학여행',
    domestic: '국내여행',
    overseas: '해외여행',
};

const formatPrice = (price) => {
    if (!price) return null;
    return Number(price).toLocaleString('ko-KR') + '원~';
};

function ProductCard({ product, onClick }) {
    const price = formatPrice(product.pricePerPerson);
    return (
        <Box
            onClick={onClick}
            sx={{
                borderRadius: 3,
                overflow: 'hidden',
                bgcolor: 'white',
                boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
                transition: 'transform 0.25s, box-shadow 0.25s',
                cursor: 'pointer',
                '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 8px 28px rgba(0,0,0,0.16)',
                },
            }}
        >
            <Box sx={{ position: 'relative', width: '100%', paddingTop: '72%', bgcolor: '#f0f0f0' }}>
                {product.thumbnailPath ? (
                    <img
                        src={`${IMG_BASE}${product.thumbnailPath}`}
                        alt={product.productName}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                ) : (
                    <Box sx={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#ccc', fontSize: 48,
                    }}>
                        🏞
                    </Box>
                )}
                {product.isFeatured === 'Y' && (
                    <Chip
                        label="추천"
                        size="small"
                        sx={{
                            position: 'absolute', top: 10, left: 10,
                            bgcolor: '#ff6f00', color: 'white', fontWeight: 700, fontSize: '0.7rem',
                        }}
                    />
                )}
            </Box>

            <Box sx={{ p: 2.5 }}>
                <Typography
                    variant="h6"
                    fontWeight={700}
                    sx={{
                        overflow: 'hidden', display: '-webkit-box',
                        WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
                        mb: 0.75, fontSize: '1rem',
                    }}
                >
                    {product.productName}
                </Typography>

                {product.summary && (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            overflow: 'hidden', display: '-webkit-box',
                            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                            mb: 1.5, lineHeight: 1.6, minHeight: '3.2em', fontSize: '0.875rem',
                        }}
                    >
                        {product.summary}
                    </Typography>
                )}

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {product.minPeople && (
                        <Chip
                            icon={<PeopleIcon sx={{ fontSize: '15px !important' }} />}
                            label={`${product.minPeople}인 이상`}
                            size="small" variant="outlined" sx={{ fontSize: '0.75rem' }}
                        />
                    )}
                    {price && (
                        <Chip
                            icon={<AttachMoneyIcon sx={{ fontSize: '15px !important' }} />}
                            label={price}
                            size="small" variant="outlined" color="primary" sx={{ fontSize: '0.75rem' }}
                        />
                    )}
                </Stack>
            </Box>
        </Box>
    );
}

function CardSkeleton() {
    return (
        <Box sx={{ borderRadius: 3, overflow: 'hidden', bgcolor: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <Skeleton variant="rectangular" width="100%" height={220} />
            <Box sx={{ p: 2 }}>
                <Skeleton variant="text" width="70%" height={28} />
                <Skeleton variant="text" width="100%" />
                <Skeleton variant="text" width="80%" />
            </Box>
        </Box>
    );
}

export default function TourListPage() {
    const { category } = useParams();
    const navigate = useNavigate();
    const categoryName = CATEGORY_MAP[category];
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!categoryName) { setLoading(false); return; }
        getProductsByCategory(categoryName)
            .then(setProducts)
            .catch(() => setProducts([]))
            .finally(() => setLoading(false));
    }, [categoryName]);

    if (!categoryName) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">잘못된 카테고리입니다.</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ bgcolor: '#f7f8fc', minHeight: '100vh', py: 5 }}>
            <Container maxWidth="lg">
                <Typography variant="h4" fontWeight={800} sx={{ mb: 1, fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
                    {categoryName}
                </Typography>
                <Box sx={{ height: 3, width: 48, borderRadius: 2, bgcolor: '#2e7d32', mb: 4 }} />

                {loading && (
                    <Grid container spacing={3}>
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <Grid item xs={12} sm={6} md={4} key={i}>
                                <CardSkeleton />
                            </Grid>
                        ))}
                    </Grid>
                )}

                {!loading && products.length === 0 && (
                    <Box sx={{
                        py: 10, textAlign: 'center', borderRadius: 3,
                        bgcolor: 'white', border: '1px dashed #ddd',
                    }}>
                        <Typography color="text.disabled" variant="h6">등록된 상품이 없습니다.</Typography>
                    </Box>
                )}

                {!loading && products.length > 0 && (
                    <Grid container spacing={3}>
                        {products.map(p => (
                            <Grid item xs={12} sm={6} md={4} key={p.productId}>
                                <ProductCard
                                    product={p}
                                    onClick={() => { navigate(`/tour/${category}/${p.productId}`); window.scrollTo(0, 0); }}
                                />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>
        </Box>
    );
}
