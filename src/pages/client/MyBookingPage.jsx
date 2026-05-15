import {
    Box, Container, Typography, Chip, Stack, Paper,
    Table, TableHead, TableBody, TableRow, TableCell,
    CircularProgress, Button, Divider, Alert,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, IconButton,
} from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import PhoneIcon from '@mui/icons-material/Phone';
import CancelIcon from '@mui/icons-material/Cancel';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyBookings, updateBooking, deleteBooking } from '../../api/bookingApi';

const BOOKING_STATUS = {
    PENDING:   { label: '신청',  color: 'warning', desc: '예약 신청이 접수되었습니다.' },
    CONFIRMED: { label: '확정',  color: 'success', desc: '예약이 확정되었습니다. 담당자가 곧 연락드립니다.' },
    COMPLETED: { label: '완료',  color: 'primary', desc: '여행이 완료되었습니다.' },
    CANCELLED: { label: '취소',  color: 'error',   desc: '예약이 취소되었습니다.' },
};

const PAYMENT_STATUS = {
    UNPAID:   { label: '미결제',   color: 'warning' },
    PAID:     { label: '결제완료', color: 'success' },
    REFUNDED: { label: '환불',     color: 'error'   },
};

function Counter({ value, onChange, min = 0 }) {
    return (
        <Stack direction="row" alignItems="center" spacing={0.5}>
            <IconButton size="small" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}
                sx={{ p: 0.3, color: 'primary.main' }}>
                <RemoveIcon sx={{ fontSize: 16 }} />
            </IconButton>
            <Typography fontWeight={700} sx={{ minWidth: 20, textAlign: 'center' }}>{value}</Typography>
            <IconButton size="small" onClick={() => onChange(value + 1)} sx={{ p: 0.3, color: 'primary.main' }}>
                <AddIcon sx={{ fontSize: 16 }} />
            </IconButton>
        </Stack>
    );
}

function BookingDetailDialog({ booking, open, onClose }) {
    if (!booking) return null;
    const bs = BOOKING_STATUS[booking.status] ?? { label: booking.status, color: 'default' };
    const ps = PAYMENT_STATUS[booking.paymentStatus] ?? { label: booking.paymentStatus, color: 'default' };
    const total = booking.adultCount + booking.childCount + booking.infantCount;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 700 }}>
                예약 상세 — {booking.bookingNumber}
            </DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2}>
                    <Alert severity={booking.status === 'CANCELLED' ? 'error' : booking.status === 'CONFIRMED' ? 'success' : 'info'} sx={{ py: 0.5 }}>
                        {bs.desc}
                    </Alert>
                    <Box>
                        <Typography variant="caption" color="text.secondary">상품명</Typography>
                        <Typography fontWeight={600}>{booking.productName}</Typography>
                    </Box>
                    <Divider />
                    <Stack direction="row" spacing={1}>
                        <Chip label={bs.label} color={bs.color} size="small" />
                        <Chip label={ps.label} color={ps.color} size="small" />
                    </Stack>
                    <Box>
                        <Typography variant="caption" color="text.secondary">예약자</Typography>
                        <Typography fontWeight={600}>{booking.name}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary">연락처</Typography>
                        <Typography>{booking.phone}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary">이메일</Typography>
                        <Typography>{booking.email}</Typography>
                    </Box>
                    <Divider />
                    <Box>
                        <Typography variant="caption" color="text.secondary">인원</Typography>
                        <Typography>
                            성인 {booking.adultCount}명
                            {booking.childCount > 0 && ` / 아동 ${booking.childCount}명`}
                            {booking.infantCount > 0 && ` / 유아 ${booking.infantCount}명`}
                            <Typography component="span" variant="caption" color="primary" sx={{ ml: 1 }}>
                                (총 {total}명)
                            </Typography>
                        </Typography>
                    </Box>
                    {booking.desiredDepartureAt && (
                        <Box>
                            <Typography variant="caption" color="text.secondary">희망 출발일</Typography>
                            <Typography fontWeight={600}>{booking.desiredDepartureAt}</Typography>
                        </Box>
                    )}
                    {booking.requestMemo && (
                        <>
                            <Divider />
                            <Box>
                                <Typography variant="caption" color="text.secondary">요청사항</Typography>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mt: 0.5 }}>{booking.requestMemo}</Typography>
                            </Box>
                        </>
                    )}
                    {booking.adminMemo && (
                        <>
                            <Divider />
                            <Box sx={{ p: 1.5, bgcolor: '#f0f4ff', borderRadius: 1 }}>
                                <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>담당자 메모</Typography>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: '#1a237e' }}>{booking.adminMemo}</Typography>
                            </Box>
                        </>
                    )}
                    <Divider />
                    <Box>
                        <Typography variant="caption" color="text.secondary">신청일시</Typography>
                        <Typography variant="body2">{booking.createdAt?.substring(0, 16).replace('T', ' ')}</Typography>
                    </Box>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>닫기</Button>
            </DialogActions>
        </Dialog>
    );
}

function EditDialog({ booking, open, onClose, onSaved }) {
    const [form, setForm] = useState({ adultCount: 1, childCount: 0, infantCount: 0, desiredDepartureAt: '', requestMemo: '' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (booking) {
            setForm({
                adultCount:        booking.adultCount,
                childCount:        booking.childCount,
                infantCount:       booking.infantCount,
                desiredDepartureAt: booking.desiredDepartureAt ?? '',
                requestMemo:       booking.requestMemo ?? '',
            });
            setError('');
        }
    }, [booking]);

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            await updateBooking(booking.bookingId, form);
            onSaved();
            onClose();
        } catch (e) {
            setError(e?.response?.data?.message || '수정에 실패했습니다.');
        } finally {
            setSaving(false);
        }
    };

    if (!booking) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ fontWeight: 700 }}>예약 수정</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2.5} sx={{ pt: 0.5 }}>
                    {error && <Alert severity="error">{error}</Alert>}

                    <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={1}>인원</Typography>
                        <Stack direction="row" spacing={1}>
                            {[
                                { label: '성인 *', key: 'adultCount',  min: 1 },
                                { label: '아동',   key: 'childCount',  min: 0 },
                                { label: '유아',   key: 'infantCount', min: 0 },
                            ].map(({ label, key, min }) => (
                                <Box key={key} sx={{ flex: 1, border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.2, textAlign: 'center', bgcolor: 'grey.50' }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>{label}</Typography>
                                    <Counter value={form[key]} onChange={v => setForm(f => ({ ...f, [key]: v }))} min={min} />
                                </Box>
                            ))}
                        </Stack>
                    </Box>

                    <TextField
                        label="희망 출발일" size="small" fullWidth type="date"
                        InputLabelProps={{ shrink: true }}
                        value={form.desiredDepartureAt}
                        onChange={e => setForm(f => ({ ...f, desiredDepartureAt: e.target.value }))}
                    />

                    <TextField
                        label="요청사항" size="small" fullWidth multiline rows={3}
                        value={form.requestMemo}
                        onChange={e => setForm(f => ({ ...f, requestMemo: e.target.value }))}
                    />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 2.5, pb: 2.5, gap: 1 }}>
                <Button onClick={onClose} disabled={saving} sx={{ flex: 1 }}>취소</Button>
                <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ flex: 2, fontWeight: 700 }}>
                    {saving ? <CircularProgress size={18} color="inherit" /> : '저장'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

function DeleteConfirmDialog({ booking, open, onClose, onDeleted }) {
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await deleteBooking(booking.bookingId);
            onDeleted();
            onClose();
        } finally {
            setDeleting(false);
        }
    };

    if (!booking) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ fontWeight: 700 }}>예약 삭제</DialogTitle>
            <DialogContent>
                <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>{booking.productName}</strong> 예약({booking.bookingNumber})을 삭제하시겠습니까?
                </Typography>
                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                    삭제 후 복구할 수 없습니다.
                </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 2.5, pb: 2.5, gap: 1 }}>
                <Button onClick={onClose} disabled={deleting} sx={{ flex: 1 }}>취소</Button>
                <Button variant="contained" color="error" onClick={handleDelete} disabled={deleting} sx={{ flex: 2, fontWeight: 700 }}>
                    {deleting ? <CircularProgress size={18} color="inherit" /> : '삭제'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

function CancelGuideDialog({ open, onClose }) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CancelIcon sx={{ color: '#e53935', fontSize: 22 }} />
                취소·환불 안내
            </DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2}>
                    <Alert severity="info" sx={{ fontSize: '0.82rem' }}>
                        취소 및 환불은 담당자와 직접 상담 후 처리됩니다.
                    </Alert>
                    <Box sx={{ bgcolor: '#fff8e1', borderRadius: 2, p: 2, border: '1px solid #ffe082' }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" mb={0.5}>
                            고객센터
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <PhoneIcon sx={{ color: '#e65100', fontSize: 20 }} />
                            <Typography fontWeight={800} fontSize="1.1rem" color="#e65100">
                                031-466-9600
                            </Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                            평일 09:00 ~ 18:00 (점심 12:00 ~ 13:00)
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" mb={0.5}>
                            취소·환불 수수료 기준
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                            취소 시점에 따라 취소수수료가 부과될 수 있습니다.<br />
                            자세한 내용은 여행약관을 확인해 주세요.
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                            <Button
                                size="small"
                                variant="text"
                                sx={{ p: 0, fontSize: '0.75rem', color: '#1565c0', textDecoration: 'underline' }}
                                onClick={() => window.open('/travel-terms', '_blank')}
                            >
                                여행약관 보기 →
                            </Button>
                        </Box>
                    </Box>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="contained" fullWidth sx={{ fontWeight: 700 }}>확인</Button>
            </DialogActions>
        </Dialog>
    );
}

export default function MyBookingPage() {
    const navigate = useNavigate();
    const [bookings,    setBookings]    = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [selected,    setSelected]    = useState(null);
    const [detailOpen,  setDetailOpen]  = useState(false);
    const [editTarget,  setEditTarget]  = useState(null);
    const [editOpen,    setEditOpen]    = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteOpen,  setDeleteOpen]  = useState(false);
    const [cancelGuideOpen, setCancelGuideOpen] = useState(false);

    const load = () => {
        setLoading(true);
        getMyBookings()
            .then(data => setBookings(data))
            .catch(() => setBookings([]))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const handleDetail = (booking) => { setSelected(booking); setDetailOpen(true); };
    const handleEdit   = (booking) => { setEditTarget(booking); setEditOpen(true); };
    const handleDelete = (booking) => { setDeleteTarget(booking); setDeleteOpen(true); };

    return (
        <Box sx={{ bgcolor: '#f7f8fc', minHeight: '100vh', py: 5 }}>
            <Container maxWidth="md">
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 3, color: 'text.secondary' }}>
                    돌아가기
                </Button>

                <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
                    <EventNoteIcon sx={{ color: '#1976d2', fontSize: 28 }} />
                    <Typography variant="h5" fontWeight={800}>나의 이용내역</Typography>
                </Stack>

                <Alert severity="info" sx={{ mb: 3, fontSize: '0.85rem', lineHeight: 1.8 }}>
                    예약 신청이 완료되면 담당자가 확인 후 연락드립니다.<br />
                    담당자와 예약 및 결제 처리가 완료되면 <strong>예약상태</strong>와 <strong>결제상태</strong>가 자동으로 변경됩니다.<br />
                    문의사항은 <strong>031-466-9600</strong> 으로 연락주세요.
                </Alert>

                <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                            <CircularProgress />
                        </Box>
                    ) : bookings.length === 0 ? (
                        <Box sx={{ py: 10, textAlign: 'center' }}>
                            <Typography sx={{ fontSize: '2.5rem', mb: 2 }}>📋</Typography>
                            <Typography variant="h6" fontWeight={700} color="text.secondary">
                                예약 내역이 없습니다
                            </Typography>
                            <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
                                여행 상품을 둘러보고 예약 신청을 해보세요!
                            </Typography>
                            <Button variant="contained" sx={{ mt: 3 }} onClick={() => navigate('/')}>
                                상품 둘러보기
                            </Button>
                        </Box>
                    ) : (
                        <Box sx={{ overflowX: 'auto' }}>
                            <Table sx={{ minWidth: 700, tableLayout: 'fixed' }}>
                                <colgroup>
                                    <col style={{ width: '13%' }} />  {/* 예약번호 */}
                                    <col style={{ width: '20%' }} />  {/* 상품명 */}
                                    <col style={{ width: '7%' }}  />  {/* 인원 */}
                                    <col style={{ width: '10%' }} />  {/* 출발일 */}
                                    <col style={{ width: '11%' }} />  {/* 예약상태 */}
                                    <col style={{ width: '11%' }} />  {/* 결제상태 */}
                                    <col style={{ width: '9%' }}  />  {/* 신청일 */}
                                    <col style={{ width: '19%' }} />  {/* 관리 */}
                                </colgroup>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#1976d2' }}>
                                        {[
                                            { label: '예약번호',  align: 'left'   },
                                            { label: '상품명',    align: 'left'   },
                                            { label: '인원',      align: 'center' },
                                            { label: '출발일',    align: 'center' },
                                            { label: '예약상태',  align: 'center' },
                                            { label: '결제상태',  align: 'center' },
                                            { label: '신청일',    align: 'center' },
                                            { label: '관리',      align: 'center' },
                                        ].map(({ label, align }) => (
                                            <TableCell key={label} align={align}
                                                sx={{ fontWeight: 700, color: '#fff', fontSize: '0.8rem',
                                                      py: 1.5, whiteSpace: 'nowrap', borderBottom: 'none' }}>
                                                {label}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {bookings.map((row, idx) => {
                                        const bs = BOOKING_STATUS[row.status] ?? { label: row.status, color: 'default' };
                                        const ps = PAYMENT_STATUS[row.paymentStatus] ?? { label: row.paymentStatus, color: 'default' };
                                        const total = row.adultCount + row.childCount + row.infantCount;
                                        const isPending   = row.status === 'PENDING';
                                        const isCancelable = row.status === 'CONFIRMED' && row.paymentStatus === 'PAID';
                                        return (
                                            <TableRow key={row.bookingId} hover
                                                sx={{ bgcolor: idx % 2 === 0 ? '#fff' : '#fafafa',
                                                      '&:last-child td': { borderBottom: 0 } }}>
                                                <TableCell sx={{ py: 1.5 }}>
                                                    <Typography variant="caption" fontWeight={700} color="primary"
                                                        sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                                                        onClick={() => handleDetail(row)}>
                                                        {row.bookingNumber}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ py: 1.5 }}>
                                                    <Typography variant="body2" noWrap title={row.productName}>
                                                        {row.productName}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center" sx={{ py: 1.5 }}>
                                                    <Typography variant="body2">{total}명</Typography>
                                                </TableCell>
                                                <TableCell align="center" sx={{ py: 1.5 }}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {row.desiredDepartureAt ?? '-'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center" sx={{ py: 1.5 }}>
                                                    <Chip label={bs.label} color={bs.color} size="small"
                                                        sx={{ fontSize: '0.72rem', height: 22 }} />
                                                </TableCell>
                                                <TableCell align="center" sx={{ py: 1.5 }}>
                                                    <Chip label={ps.label} color={ps.color} size="small"
                                                        sx={{ fontSize: '0.72rem', height: 22 }} />
                                                </TableCell>
                                                <TableCell align="center" sx={{ py: 1.5 }}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {row.createdAt?.substring(0, 10)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center" sx={{ py: 1 }}>
                                                    <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
                                                        <Button size="small" variant="contained" onClick={() => handleDetail(row)}
                                                            sx={{ minWidth: 0, px: 1.2, py: 0.3, fontSize: '0.72rem' }}>
                                                            상세
                                                        </Button>
                                                        {isPending && (
                                                            <>
                                                                <IconButton size="small" color="primary" onClick={() => handleEdit(row)}
                                                                    title="수정" sx={{ p: 0.4 }}>
                                                                    <EditIcon sx={{ fontSize: 15 }} />
                                                                </IconButton>
                                                                <IconButton size="small" color="error" onClick={() => handleDelete(row)}
                                                                    title="삭제" sx={{ p: 0.4 }}>
                                                                    <DeleteIcon sx={{ fontSize: 15 }} />
                                                                </IconButton>
                                                            </>
                                                        )}
                                                        {isCancelable && (
                                                            <Button
                                                                size="small"
                                                                variant="contained"
                                                                color="error"
                                                                onClick={() => setCancelGuideOpen(true)}
                                                                sx={{ minWidth: 0, px: 1, py: 0.3, fontSize: '0.7rem', whiteSpace: 'nowrap' }}
                                                            >
                                                                취소·환불
                                                            </Button>
                                                        )}
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </Box>
                    )}
                </Paper>
            </Container>

            <BookingDetailDialog booking={selected} open={detailOpen} onClose={() => setDetailOpen(false)} />
            <EditDialog booking={editTarget} open={editOpen} onClose={() => setEditOpen(false)} onSaved={load} />
            <DeleteConfirmDialog booking={deleteTarget} open={deleteOpen} onClose={() => setDeleteOpen(false)} onDeleted={load} />
            <CancelGuideDialog open={cancelGuideOpen} onClose={() => setCancelGuideOpen(false)} />
        </Box>
    );
}
