import {
    Box, Paper, Typography, Alert, Grid, Card, CardContent,
    TextField, MenuItem, Button, Stack, Table, TableHead,
    TableRow, TableCell, TableBody, Chip
} from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PaidIcon from '@mui/icons-material/Paid';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import { useState } from 'react';
import CommonPagination from '../../components/CommonPagination';

/* ── 예약 상태 ── */
const BOOKING_STATUS = {
    PENDING:   { label: '신청',  color: 'warning' },
    CONFIRMED: { label: '확정',  color: 'success' },
    CANCELLED: { label: '취소',  color: 'error'   },
    COMPLETED: { label: '완료',  color: 'default' },
};

/* ── 결제 상태 ── */
const PAYMENT_STATUS = {
    UNPAID:   { label: '미결제',    color: 'warning' },
    PAID:     { label: '결제완료',  color: 'success' },
    REFUNDED: { label: '환불',      color: 'error'   },
};

const StatCard = ({ icon, label, value, color }) => (
    <Card variant="outlined" sx={{ height: '100%', borderLeft: `4px solid ${color}` }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: '14px !important' }}>
            <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
                {icon}
            </Box>
            <Box>
                <Typography variant="body2" color="text.secondary">{label}</Typography>
                <Typography variant="h5" fontWeight={700}>{value}</Typography>
            </Box>
        </CardContent>
    </Card>
);

export default function AdminBookingPage() {
    const [bookingStatus, setBookingStatus] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('');
    const [keyword, setKeyword] = useState('');
    const [page, setPage] = useState(1);

    /* 백엔드 미연동 상태 — 실데이터 없음 */
    const rows = [];
    const totalPage = 1;

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: { sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
                <Typography variant="h5" fontWeight={700} sx={{ flexShrink: 0 }}>예약 및 결제 관리</Typography>
                <Alert severity="warning" sx={{ py: 0.5, flex: 1 }}>
                    예약 / 결제 백엔드 연동 전입니다. UI 구조만 미리 구성한 화면입니다.
                </Alert>
            </Box>

            {/* ── 예약 현황 카드 ── */}
            <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
                <Typography variant="subtitle1" fontWeight={700} mb={2} color="text.secondary">예약 현황</Typography>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <StatCard icon={<EventNoteIcon />} label="전체 예약" value={0} color="#1976d2" />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <StatCard icon={<HourglassEmptyIcon />} label="신청" value={0} color="#f57c00" />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <StatCard icon={<CheckCircleIcon />} label="확정" value={0} color="#388e3c" />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <StatCard icon={<CancelIcon />} label="취소" value={0} color="#d32f2f" />
                    </Grid>
                </Grid>
            </Paper>

            {/* ── 결제 현황 카드 ── */}
            <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
                <Typography variant="subtitle1" fontWeight={700} mb={2} color="text.secondary">결제 현황</Typography>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <StatCard icon={<MoneyOffIcon />} label="미결제" value={0} color="#f57c00" />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <StatCard icon={<PaidIcon />} label="결제완료" value={0} color="#1976d2" />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <StatCard icon={<MoneyOffIcon />} label="환불" value={0} color="#d32f2f" />
                    </Grid>
                </Grid>
            </Paper>

            {/* ── 목록 ── */}
            <Paper variant="outlined" sx={{ p: 2.5 }}>
                {/* 검색 필터 */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} mb={2} flexWrap="wrap">
                    <TextField
                        select size="small" label="예약 상태" value={bookingStatus}
                        onChange={e => setBookingStatus(e.target.value)} sx={{ minWidth: 130 }}
                    >
                        <MenuItem value="">전체</MenuItem>
                        {Object.entries(BOOKING_STATUS).map(([k, v]) => (
                            <MenuItem key={k} value={k}>{v.label}</MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        select size="small" label="결제 상태" value={paymentStatus}
                        onChange={e => setPaymentStatus(e.target.value)} sx={{ minWidth: 130 }}
                    >
                        <MenuItem value="">전체</MenuItem>
                        {Object.entries(PAYMENT_STATUS).map(([k, v]) => (
                            <MenuItem key={k} value={k}>{v.label}</MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        size="small" placeholder="상품명 / 예약자명 / 연락처"
                        value={keyword} onChange={e => setKeyword(e.target.value)}
                        sx={{ minWidth: 240 }}
                    />
                    <Button variant="contained" size="small">검색</Button>
                    <Button variant="contained" size="small" onClick={() => { setBookingStatus(''); setPaymentStatus(''); setKeyword(''); }}>
                        초기화
                    </Button>
                </Stack>

                {/* 테이블 */}
                <Box sx={{ overflowX: 'auto' }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                <TableCell align="center" sx={{ fontWeight: 700 }}>#</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>상품명</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>예약자</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>연락처</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 700 }}>인원</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 700 }}>예약일</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 700 }}>여행일</TableCell>
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
                            ) : rows.map((row, idx) => {
                                const bs = BOOKING_STATUS[row.bookingStatus] ?? { label: row.bookingStatus, color: 'default' };
                                const ps = PAYMENT_STATUS[row.paymentStatus] ?? { label: row.paymentStatus, color: 'default' };
                                return (
                                    <TableRow key={row.id} hover>
                                        <TableCell align="center">{(page - 1) * 10 + idx + 1}</TableCell>
                                        <TableCell>{row.productName}</TableCell>
                                        <TableCell>{row.name}</TableCell>
                                        <TableCell>{row.phone}</TableCell>
                                        <TableCell align="center">{row.people}명</TableCell>
                                        <TableCell align="center">{row.bookedAt}</TableCell>
                                        <TableCell align="center">{row.travelAt}</TableCell>
                                        <TableCell align="center">
                                            <Chip label={bs.label} color={bs.color} size="small" />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip label={ps.label} color={ps.color} size="small" />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Stack direction="row" spacing={0.5} justifyContent="center">
                                                <Button size="small" variant="contained">상세</Button>
                                                <Button size="small" variant="contained" color="error">취소</Button>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </Box>

                <CommonPagination count={totalPage} page={page} onChange={(_, v) => setPage(v)} />
            </Paper>
        </Box>
    );
}
