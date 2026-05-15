import {
    Box, Paper, Typography, Grid, Card, CardContent,
    TextField, MenuItem, Button, Stack, Table, TableHead,
    TableRow, TableCell, TableBody, Chip, CircularProgress,
    Dialog, DialogTitle, DialogContent, DialogActions, Divider, Alert
} from '@mui/material';
import LandscapeIcon      from '@mui/icons-material/Landscape';
import FlightIcon         from '@mui/icons-material/Flight';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import SchoolIcon         from '@mui/icons-material/School';
import EventNoteIcon      from '@mui/icons-material/EventNote';
import CheckCircleIcon    from '@mui/icons-material/CheckCircle';
import CancelIcon         from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PaidIcon           from '@mui/icons-material/Paid';
import MoneyOffIcon       from '@mui/icons-material/MoneyOff';
import DownloadIcon       from '@mui/icons-material/Download';
import { useState, useEffect, useCallback } from 'react';
import CommonPagination from '../../components/CommonPagination';
import {
    getAdminBookings, getAdminBooking,
    updateBookingStatus, updatePaymentStatus, updateBookingMemo, markBookingChecked, getBookingStats,
    exportBookings
} from '../../api/bookingApi';
import { getProducts } from '../../api/productApi';

const CATEGORY_BADGE = {
    '국내여행':        { icon: <LandscapeIcon sx={{ fontSize: 14 }} />,         color: '#2e7d32', bg: '#e8f5e9' },
    '항공 해외여행':   { icon: <FlightIcon sx={{ fontSize: 14 }} />,         color: '#e65100', bg: '#fff3e0' },
    '크루즈 해외여행': { icon: <DirectionsBoatIcon sx={{ fontSize: 14 }} />, color: '#0277bd', bg: '#e1f5fe' },
    '수학여행':        { icon: <SchoolIcon sx={{ fontSize: 14 }} />,         color: '#3f51b5', bg: '#e8eaf6' },
};

const BOOKING_STATUS = {
    PENDING:   { label: '신청',  color: 'warning' },
    CONFIRMED: { label: '확정',  color: 'success' },
    COMPLETED: { label: '완료',  color: 'default' },
    CANCELLED: { label: '취소',  color: 'error'   },
};

const PAYMENT_STATUS = {
    UNPAID:   { label: '미결제',   color: 'warning' },
    PAID:     { label: '결제완료', color: 'success' },
    REFUNDED: { label: '환불',     color: 'error'   },
};

const getPaymentLabel = (paymentStatus, paymentMethod) => {
    if (paymentStatus === 'PAID') {
        return paymentMethod === 'ONLINE' ? '온라인결제완료' : '수기결제완료';
    }
    if (paymentStatus === 'REFUNDED') {
        return paymentMethod === 'ONLINE' ? '온라인환불' : '수기환불';
    }
    return PAYMENT_STATUS[paymentStatus]?.label ?? paymentStatus;
};

const StatCard = ({ icon, label, value, color }) => (
    <Card variant="outlined" sx={{ height: '100%', borderLeft: `4px solid ${color}` }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: '14px !important' }}>
            <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
                {icon}
            </Box>
            <Box>
                <Typography variant="body2" color="text.secondary">{label}</Typography>
                <Typography variant="h5" fontWeight={700}>{value ?? 0}</Typography>
            </Box>
        </CardContent>
    </Card>
);

/* ── 상세 다이얼로그 ── */
function BookingDetailDialog({ bookingId, open, onClose, onUpdated }) {
    const [booking, setBooking] = useState(null);
    const [memoInput, setMemoInput] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open || !bookingId) return;
        getAdminBooking(bookingId).then(data => {
            setBooking(data);
            setMemoInput(data.adminMemo ?? '');
            if (!data.adminChecked) markBookingChecked(bookingId);
        });
    }, [open, bookingId]);

    const handleStatus = async (status) => {
        await updateBookingStatus(bookingId, status);
        setBooking(prev => ({ ...prev, status }));
        onUpdated();
    };

    const handlePayment = async (paymentStatus, paymentMethod) => {
        await updatePaymentStatus(bookingId, paymentStatus, paymentMethod);
        setBooking(prev => ({
            ...prev,
            paymentStatus,
            paymentMethod,
            ...(paymentStatus === 'PAID' ? { status: 'CONFIRMED' } : {}),
        }));
        onUpdated();
    };

    const handleMemoSave = async () => {
        setSaving(true);
        await updateBookingMemo(bookingId, memoInput);
        setBooking(prev => ({ ...prev, adminMemo: memoInput }));
        setSaving(false);
    };

    if (!booking) return null;

    const bs = BOOKING_STATUS[booking.status] ?? { label: booking.status, color: 'default' };
    const ps = PAYMENT_STATUS[booking.paymentStatus] ?? { label: booking.paymentStatus, color: 'default' };
    const totalPeople = booking.adultCount + booking.childCount + booking.infantCount;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 700 }}>
                예약 상세 — {booking.bookingNumber}
            </DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2}>
                    {/* 상품 정보 */}
                    <Box>
                        <Typography variant="caption" color="text.secondary">상품명</Typography>
                        <Typography fontWeight={600}>{booking.productName}</Typography>
                    </Box>
                    <Divider />

                    {/* 예약자 정보 */}
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 6 }}>
                            <Typography variant="caption" color="text.secondary">예약자</Typography>
                            <Typography fontWeight={600}>{booking.name}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <Typography variant="caption" color="text.secondary">연락처</Typography>
                            <Typography fontWeight={600}>{booking.phone}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="caption" color="text.secondary">이메일</Typography>
                            <Typography fontWeight={600}>{booking.email}</Typography>
                        </Grid>
                    </Grid>
                    <Divider />

                    {/* 인원 & 여행일 */}
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 6 }}>
                            <Typography variant="caption" color="text.secondary">인원</Typography>
                            <Typography>성인 {booking.adultCount}명 / 아동 {booking.childCount}명 / 유아 {booking.infantCount}명</Typography>
                            <Typography variant="caption" color="primary">총 {totalPeople}명</Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <Typography variant="caption" color="text.secondary">희망 출발일</Typography>
                            <Typography fontWeight={600}>{booking.desiredDepartureAt ?? '-'}</Typography>
                        </Grid>
                    </Grid>
                    <Divider />

                    {/* 고객 요청사항 */}
                    {booking.requestMemo && (
                        <>
                            <Box>
                                <Typography variant="caption" color="text.secondary">고객 요청사항</Typography>
                                <Typography sx={{ whiteSpace: 'pre-line' }}>{booking.requestMemo}</Typography>
                            </Box>
                            <Divider />
                        </>
                    )}

                    {/* 상태 */}
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Chip label={bs.label} color={bs.color} size="small" />
                        <Chip label={getPaymentLabel(booking.paymentStatus, booking.paymentMethod)} color={ps.color} size="small" />
                    </Stack>

                    {/* 상태 변경 버튼 */}
                    <Box>
                        <Typography variant="caption" color="text.secondary" mb={0.5} display="block">예약 상태 변경</Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {Object.entries(BOOKING_STATUS).map(([k, v]) => (
                                <Button key={k} size="small"
                                    variant={booking.status === k ? 'contained' : 'outlined'}
                                    color={v.color === 'default' ? 'inherit' : v.color}
                                    onClick={() => handleStatus(k)}>
                                    {v.label}
                                </Button>
                            ))}
                        </Stack>
                    </Box>
                    {/* 결제 상태 변경 버튼 */}
                    <Box>
                        <Typography variant="caption" color="text.secondary" mb={0.5} display="block">결제 상태 변경</Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            <Button size="small"
                                variant={booking.paymentStatus === 'UNPAID' ? 'contained' : 'outlined'}
                                color="warning"
                                onClick={() => handlePayment('UNPAID', null)}>
                                미결제
                            </Button>
                            <Button size="small"
                                variant={booking.paymentStatus === 'PAID' && booking.paymentMethod === 'MANUAL' ? 'contained' : 'outlined'}
                                color="success"
                                onClick={() => handlePayment('PAID', 'MANUAL')}>
                                수기결제완료
                            </Button>
                            <Button size="small"
                                variant={booking.paymentStatus === 'PAID' && booking.paymentMethod === 'ONLINE' ? 'contained' : 'outlined'}
                                color="success"
                                onClick={() => handlePayment('PAID', 'ONLINE')}
                                disabled>
                                온라인결제완료
                            </Button>
                            <Button size="small"
                                variant={booking.paymentStatus === 'REFUNDED' ? 'contained' : 'outlined'}
                                color="error"
                                onClick={() => handlePayment('REFUNDED', booking.paymentMethod)}>
                                환불
                            </Button>
                        </Stack>
                    </Box>
                    <Divider />

                    {/* 관리자 메모 */}
                    <Box>
                        <Typography variant="caption" color="text.secondary" mb={0.5} display="block">관리자 메모</Typography>
                        <TextField
                            multiline rows={3} fullWidth size="small"
                            placeholder="협력사 연락 내용, 특이사항 등"
                            value={memoInput}
                            onChange={e => setMemoInput(e.target.value)}
                        />
                        <Button size="small" variant="contained" sx={{ mt: 1 }}
                            onClick={handleMemoSave} disabled={saving}>
                            {saving ? '저장 중...' : '메모 저장'}
                        </Button>
                    </Box>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>닫기</Button>
            </DialogActions>
        </Dialog>
    );
}

/* ── 메인 ── */
export default function AdminBookingPage() {
    const [bookingStatus, setBookingStatus]   = useState('');
    const [paymentStatus, setPaymentStatus]   = useState('');
    const [keyword, setKeyword]               = useState('');
    const [searchInput, setSearchInput]       = useState('');
    const [productId, setProductId]           = useState('');
    const [products, setProducts]             = useState([]);
    const [page, setPage]                     = useState(1);
    const [data, setData]                     = useState(null);
    const [loading, setLoading]               = useState(false);
    const [selectedId, setSelectedId]         = useState(null);
    const [detailOpen, setDetailOpen]         = useState(false);
    const [stats, setStats]                   = useState(null);
    const [productPage, setProductPage]       = useState(1);
    const [exporting, setExporting]           = useState(false);
    const PRODUCT_PAGE_SIZE = 6;

    const loadStats = useCallback(() => {
        getBookingStats().then(setStats).catch(() => {});
    }, []);

    useEffect(() => {
        getProducts({ size: 200 }).then(res => setProducts(res.list ?? []));
        loadStats();
    }, [loadStats]);

    const fetch = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getAdminBookings({ page, size: 15, keyword, status: bookingStatus, paymentStatus, productId: productId || null });
            setData(res);
        } finally {
            setLoading(false);
        }
    }, [page, keyword, bookingStatus, paymentStatus, productId]);

    useEffect(() => { fetch(); }, [fetch]);

    const handleSearch = () => { setKeyword(searchInput); setPage(1); };
    const handleReset  = () => { setBookingStatus(''); setPaymentStatus(''); setSearchInput(''); setKeyword(''); setProductId(''); setPage(1); };

    const handleExport = async () => {
        setExporting(true);
        try {
            const blob = await exportBookings({ keyword, status: bookingStatus, paymentStatus, productId: productId || null });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            a.href = url;
            a.download = `예약내역_${date}.xlsx`;
            a.click();
            URL.revokeObjectURL(url);
        } finally {
            setExporting(false);
        }
    };

    const handleDetail = (id) => { setSelectedId(id); setDetailOpen(true); };
;

    const rows = data?.list ?? [];

    const byStatus       = stats?.byStatus  ?? {};
    const byPayment      = stats?.byPayment ?? {};
    const totalCount     = data?.totalCount ?? 0;
    const pendingCount   = byStatus['PENDING']    ?? 0;
    const confirmedCount = byStatus['CONFIRMED']  ?? 0;
    const cancelledCount = byStatus['CANCELLED']  ?? 0;
    const unpaidCount       = byPayment['UNPAID']      ?? 0;
    const paidManualCount   = byPayment['PAID_MANUAL'] ?? 0;
    const paidOnlineCount   = byPayment['PAID_ONLINE'] ?? 0;
    const refundedCount     = byPayment['REFUNDED']    ?? 0;
    const byProduct      = stats?.byProduct ?? [];

    return (
        <Box>
            <Typography variant="h5" fontWeight={700} mb={3}>예약 및 결제 관리</Typography>

            {/* 예약 현황 카드 */}
            <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
                <Stack direction="row" alignItems="center" spacing={1.5} mb={2} flexWrap="wrap">
                    <Typography variant="subtitle1" fontWeight={700} color="text.secondary">전체 예약 현황</Typography>
                    <Alert severity="info" sx={{ py: 0, fontSize: '0.92rem', fontWeight: 700 }}>로이투어에 등록된 전체 상품의 예약 현황입니다.</Alert>
                </Stack>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <StatCard icon={<EventNoteIcon />}      label="전체 예약" value={totalCount}     color="#1976d2" />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <StatCard icon={<HourglassEmptyIcon />} label="신청"      value={pendingCount}   color="#f57c00" />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <StatCard icon={<CheckCircleIcon />}    label="확정"      value={confirmedCount} color="#388e3c" />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <StatCard icon={<CancelIcon />}         label="취소"      value={cancelledCount} color="#d32f2f" />
                    </Grid>
                </Grid>
            </Paper>

            {/* 상품별 예약 현황 */}
            <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
                <Stack direction="row" alignItems="center" spacing={1.5} mb={2} flexWrap="wrap">
                    <Typography variant="subtitle1" fontWeight={700} color="text.secondary">상품별 예약 현황</Typography>
                    <Alert severity="info" sx={{ py: 0, fontSize: '0.92rem', fontWeight: 700 }}>각 등록된 상품의 예약 현황입니다.</Alert>
                </Stack>
                {byProduct.length === 0 ? (
                    <Typography variant="body2" color="text.disabled" sx={{ py: 1 }}>예약 데이터가 없습니다.</Typography>
                ) : (
                    <>
                        <Grid container spacing={1.5}>
                            {byProduct.slice((productPage - 1) * PRODUCT_PAGE_SIZE, productPage * PRODUCT_PAGE_SIZE).map((item, idx) => (
                                <Grid key={idx} size={{ xs: 12, sm: 6, md: 4 }}>
                                    <Box sx={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        border: '1px solid', borderColor: 'divider', borderRadius: 2,
                                        px: 2, py: 1.2, bgcolor: '#fafafa',
                                    }}>
                                        <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1, mr: 1, overflow: 'hidden' }}>
                                            {(() => {
                                                const badge = CATEGORY_BADGE[item.root_category_name];
                                                return badge ? (
                                                    <Box sx={{
                                                        display: 'inline-flex', alignItems: 'center', gap: 0.4,
                                                        bgcolor: badge.bg, color: badge.color,
                                                        borderRadius: 1, px: 0.8, py: 0.2,
                                                        fontSize: '0.72rem', fontWeight: 700, flexShrink: 0,
                                                    }}>
                                                        {badge.icon} {item.root_category_name}
                                                    </Box>
                                                ) : null;
                                            })()}
                                            <Typography variant="body2" noWrap title={item.product_name}>
                                                {item.product_name}
                                            </Typography>
                                        </Stack>
                                        <Chip label={`${item.cnt}건`} size="small" color="primary" variant="outlined" sx={{ fontWeight: 700, flexShrink: 0 }} />
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                        <CommonPagination
                            count={Math.ceil(byProduct.length / PRODUCT_PAGE_SIZE)}
                            page={productPage}
                            onChange={(_, v) => setProductPage(v)}
                        />
                    </>
                )}
            </Paper>

            {/* 결제 현황 카드 */}
            <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
                <Typography variant="subtitle1" fontWeight={700} mb={2} color="text.secondary">결제 현황</Typography>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 3 }}>
                        <StatCard icon={<MoneyOffIcon />} label="미결제"        value={unpaidCount}     color="#f57c00" />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>
                        <StatCard icon={<PaidIcon />}     label="수기결제완료"  value={paidManualCount} color="#388e3c" />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>
                        <StatCard icon={<PaidIcon />}     label="온라인결제완료" value={paidOnlineCount} color="#1976d2" />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>
                        <StatCard icon={<MoneyOffIcon />} label="환불"          value={refundedCount}   color="#d32f2f" />
                    </Grid>
                </Grid>
            </Paper>

            {/* 목록 */}
            <Paper variant="outlined" sx={{ p: 2.5 }}>
                <Typography variant="h6" fontWeight={800} color="text.primary" mb={1}>예약 목록 관리</Typography>
                <Alert severity="info" sx={{ mb: 2, fontSize: '0.92rem', fontWeight: 700 }}>각 상품에 예약된 현황을 확인 관리 하실수 있습니다.</Alert>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} mb={2} flexWrap="wrap" useFlexGap alignItems="center">
                    <TextField select size="small" label="예약 상태" value={bookingStatus}
                        onChange={e => { setBookingStatus(e.target.value); setPage(1); }} sx={{ minWidth: 130 }}>
                        <MenuItem value="">전체</MenuItem>
                        {Object.entries(BOOKING_STATUS).map(([k, v]) => (
                            <MenuItem key={k} value={k}>{v.label}</MenuItem>
                        ))}
                    </TextField>
                    <TextField select size="small" label="결제 상태" value={paymentStatus}
                        onChange={e => { setPaymentStatus(e.target.value); setPage(1); }} sx={{ minWidth: 130 }}>
                        <MenuItem value="">전체</MenuItem>
                        {Object.entries(PAYMENT_STATUS).map(([k, v]) => (
                            <MenuItem key={k} value={k}>{v.label}</MenuItem>
                        ))}
                    </TextField>
                    <TextField select size="small" label="상품별" value={productId}
                        onChange={e => { setProductId(e.target.value); setPage(1); }} sx={{ minWidth: 180 }}>
                        <MenuItem value="">전체 상품</MenuItem>
                        {products.map(p => (
                            <MenuItem key={p.productId} value={p.productId}>{p.productName}</MenuItem>
                        ))}
                    </TextField>
                    <TextField size="small" placeholder="상품명 / 예약자명 / 연락처 / 예약번호"
                        value={searchInput} onChange={e => setSearchInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        sx={{ minWidth: 280 }} />
                    <Button variant="contained" size="small" onClick={handleSearch}>검색</Button>
                    <Button variant="outlined"  size="small" onClick={handleReset}>초기화</Button>
                    <Box sx={{ flexGrow: 1 }} />
                    <Button
                        variant="contained"
                        size="small"
                        color="success"
                        startIcon={exporting ? <CircularProgress size={14} color="inherit" /> : <DownloadIcon />}
                        onClick={handleExport}
                        disabled={exporting}
                        sx={{ whiteSpace: 'nowrap', fontWeight: 700 }}
                    >
                        {exporting ? '다운로드 중...' : '엑셀 다운로드'}
                    </Button>
                </Stack>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Box sx={{ overflowX: 'auto' }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                    <TableCell align="center" sx={{ fontWeight: 700 }}>예약번호</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>상품명</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>예약자</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>연락처</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 700 }}>인원</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 700 }}>신청일</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 700 }}>희망출발일</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 700 }}>예약상태</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 700 }}>결제상태</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 700 }}>관리</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={10} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                                            예약 데이터가 없습니다.
                                        </TableCell>
                                    </TableRow>
                                ) : rows.map(row => {
                                    const bs = BOOKING_STATUS[row.status] ?? { label: row.status, color: 'default' };
                                    const ps = PAYMENT_STATUS[row.paymentStatus] ?? { label: row.paymentStatus, color: 'default' };
                                    const total = row.adultCount + row.childCount + row.infantCount;
                                    return (
                                        <TableRow key={row.bookingId} hover
                                            sx={{ bgcolor: !row.adminChecked ? '#fff8e1' : 'inherit' }}>
                                            <TableCell align="center">
                                                <Typography variant="caption" fontWeight={700} color="primary">
                                                    {row.bookingNumber}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{row.productName}</TableCell>
                                            <TableCell>{row.name}</TableCell>
                                            <TableCell>{row.phone}</TableCell>
                                            <TableCell align="center">{total}명</TableCell>
                                            <TableCell align="center">
                                                {row.createdAt?.substring(0, 10)}
                                            </TableCell>
                                            <TableCell align="center">
                                                {row.desiredDepartureAt ?? '-'}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip label={bs.label} color={bs.color} size="small" />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip label={getPaymentLabel(row.paymentStatus, row.paymentMethod)} color={ps.color} size="small" />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Button size="small" variant="contained"
                                                    onClick={() => handleDetail(row.bookingId)}>
                                                    상세
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </Box>
                )}

                <CommonPagination
                    count={data?.totalPage ?? 1}
                    page={page}
                    onChange={(_, v) => setPage(v)}
                />
            </Paper>

            <BookingDetailDialog
                bookingId={selectedId}
                open={detailOpen}
                onClose={() => setDetailOpen(false)}
                onUpdated={() => { fetch(); loadStats(); }}
            />
        </Box>
    );
}
