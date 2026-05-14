import React, { useEffect, useState } from 'react';
import {
    Box, Button, Typography, Stack, IconButton, Chip,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Divider, Alert, CircularProgress, Snackbar,
    Tabs, Tab, Table, TableBody, TableCell, TableHead, TableRow, MenuItem,
} from '@mui/material';
import AddIcon         from '@mui/icons-material/Add';
import EditIcon        from '@mui/icons-material/Edit';
import DeleteIcon      from '@mui/icons-material/Delete';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CheckIcon       from '@mui/icons-material/Check';
import CloseIcon       from '@mui/icons-material/Close';
import SaveIcon        from '@mui/icons-material/Save';
import * as api from '../../../api/cruiseApi';

const IMG_BASE = 'http://localhost:8080';

const EMPTY_FORM = {
    dayNumber: '', title: '', description: '',
    hotelName: '',
    shoppingCenterName: '', shoppingExchangeInfo: '', shoppingInfo: '',
};
const EMPTY_SCHEDULE = { time: '', ampm: 'AM', description: '' };

const parseTime = (timeStr) => {
    if (!timeStr) return { time: '', ampm: 'AM' };
    const parts = timeStr.trim().split(' ');
    if (parts.length >= 2 && (parts[1] === 'AM' || parts[1] === 'PM')) {
        return { time: parts[0], ampm: parts[1] };
    }
    return { time: timeStr, ampm: 'AM' };
};
const formatTime = (timeStr) => {
    if (!timeStr) return '–';
    const { time, ampm } = parseTime(timeStr);
    return time ? `${ampm} ${time}` : timeStr;
};
const toMinutes = (timeStr) => {
    if (!timeStr) return 9999;
    const { time, ampm } = parseTime(timeStr);
    const [h, m = '0'] = (time || '').split(':');
    let hours = parseInt(h) || 0;
    if (ampm === 'PM' && hours !== 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return hours * 60 + (parseInt(m) || 0);
};
const EMPTY_DETAIL = {
    includedItems: '', excludedItems: '',
    guideName: '', guidePhone: '', meetingLocation: '', meetingTime: '', notes: '',
    insuranceInfo: '', emergencyContact: '', passportVisaInfo: '', otherNotices: '',
    ageAdult: '', ageChild: '', ageInfant: '',
    terms: '', reservationNotes: '', entryRegulations: '', surchargeInfo: '',
};
const EMPTY_PRICE = { cabinType: '', priceAdult: '', priceChild: '', priceInfant: '' };

/* ══════════════════════════════════════════════
   메인 컴포넌트
══════════════════════════════════════════════ */
export default function CruiseItineraryTab({ productId, onComplete }) {
    const [activeTab, setActiveTab] = useState(0);

    /* detail 상태 (탭 1~3 공유) */
    const [detail,       setDetail]       = useState(EMPTY_DETAIL);
    const [detailLoad,   setDetailLoad]   = useState(true);
    const [detailSaving, setDetailSaving] = useState(false);

    /* prices 상태 (탭 4) */
    const [prices,           setPrices]           = useState([]);
    const [pricesLoad,       setPricesLoad]       = useState(true);
    const [editingPriceId,   setEditingPriceId]   = useState(null);
    const [editingPriceForm, setEditingPriceForm] = useState(EMPTY_PRICE);
    const [addingPrice,      setAddingPrice]      = useState(false);
    const [priceForm,        setPriceForm]        = useState(EMPTY_PRICE);

    const [snack,       setSnack]       = useState({ open: false, msg: '', severity: 'success' });
    const [pricesSaved, setPricesSaved] = useState(false);
    const showSnack = (msg, severity = 'success') => setSnack({ open: true, msg, severity });

    useEffect(() => {
        loadDetail();
        loadPrices();
    }, [productId]);

    const loadDetail = async () => {
        setDetailLoad(true);
        try {
            const data = await api.getCruiseDetail(productId);
            setDetail(data ? { ...EMPTY_DETAIL, ...data } : EMPTY_DETAIL);
        } finally { setDetailLoad(false); }
    };

    const loadPrices = async () => {
        setPricesLoad(true);
        try { setPrices(await api.getCruisePrices(productId)); }
        finally { setPricesLoad(false); }
    };

    const handleSaveDetail = async () => {
        setDetailSaving(true);
        try {
            const saved = await api.saveCruiseDetail(productId, detail);
            setDetail({ ...EMPTY_DETAIL, ...saved });
            showSnack('저장되었습니다.');
            if (activeTab < 4) setActiveTab(prev => prev + 1);
            else {
                onComplete?.();
                if (!onComplete) {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setTimeout(() => setPricesSaved(true), 400);
                }
            }
        } catch { showSnack('저장 중 오류가 발생했습니다.', 'error'); }
        finally { setDetailSaving(false); }
    };

    const handleAddPrice = async () => {
        if (!priceForm.cabinType.trim()) return;
        try {
            const p = await api.addCruisePrice(productId, {
                cabinType:   priceForm.cabinType,
                priceAdult:  Number(priceForm.priceAdult)  || 0,
                priceChild:  Number(priceForm.priceChild)  || 0,
                priceInfant: Number(priceForm.priceInfant) || 0,
            });
            setPrices(ps => [...ps, p]);
            setPriceForm(EMPTY_PRICE);
            setAddingPrice(false);
            showSnack('가격이 추가되었습니다.');
        } catch { showSnack('저장 중 오류가 발생했습니다.', 'error'); }
    };

    const handleUpdatePrice = async () => {
        if (!editingPriceForm.cabinType.trim()) return;
        try {
            const updated = await api.updateCruisePrice(productId, editingPriceId, {
                cabinType:   editingPriceForm.cabinType,
                priceAdult:  Number(editingPriceForm.priceAdult)  || 0,
                priceChild:  Number(editingPriceForm.priceChild)  || 0,
                priceInfant: Number(editingPriceForm.priceInfant) || 0,
                sortOrder:   prices.findIndex(p => p.id === editingPriceId),
            });
            setPrices(ps => ps.map(p => p.id === editingPriceId ? updated : p));
            setEditingPriceId(null);
            showSnack('수정되었습니다.');
        } catch { showSnack('수정 중 오류가 발생했습니다.', 'error'); }
    };

    const handleDeletePrice = async (priceId) => {
        if (!window.confirm('이 가격 항목을 삭제하시겠습니까?')) return;
        await api.deleteCruisePrice(productId, priceId);
        setPrices(ps => ps.filter(p => p.id !== priceId));
        showSnack('삭제되었습니다.');
    };

    const fmtPrice = (v) => v ? Number(v).toLocaleString() + '원' : '-';

    return (
        <Box>
            {pricesSaved && (
                <Alert severity="success" onClose={() => setPricesSaved(false)} sx={{ mb: 2 }}>
                    크루즈 일정 정보들을 저장하였습니다.&nbsp;
                    <strong>[메인화면 썸네일 이미지]&nbsp;[유튜브 동영상]&nbsp;[첨부파일]&nbsp;[기본정보]</strong>
                    &nbsp;더 이상 수정하실 게 없으면 <strong>수정완료</strong> 버튼을 클릭해주세요.
                </Alert>
            )}

            <Tabs value={activeTab} onChange={(_, v) => { setActiveTab(v); setPricesSaved(false); }}
                variant="scrollable" scrollButtons="auto"
                sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tab label="여행 일정" />
                <Tab label="유의사항" />
                <Tab label="포함 / 불포함" />
                <Tab label="가이드 미팅정보" />
                <Tab label="상품 가격" />
            </Tabs>

            {/* ── 탭 0: 여행 일정 ── */}
            {activeTab === 0 && (
                <Box>
                    <ItinerarySection productId={productId} onAfterSave={() => setActiveTab(1)} />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', pr: 9, mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                        <Button variant="contained" onClick={() => setActiveTab(1)}>저장</Button>
                    </Box>
                </Box>
            )}

            {/* ── 탭 1: 유의사항 ── */}
            {activeTab === 1 && (
                detailLoad ? <Loading /> :
                <DetailForm
                    fields={[
                        { key: 'insuranceInfo',    label: '여행자 보험',    rows: 4 },
                        { key: 'emergencyContact', label: '비상 연락처',    rows: 3 },
                        { key: 'passportVisaInfo', label: '여권 / 비자 안내', rows: 3 },
                        { key: 'otherNotices',     label: '기타 유의사항',  rows: 4 },
                    ]}
                    detail={detail} setDetail={setDetail}
                    saving={detailSaving} onSave={handleSaveDetail}
                />
            )}

            {/* ── 탭 2: 포함/불포함 ── */}
            {activeTab === 2 && (
                detailLoad ? <Loading /> :
                <DetailForm
                    fields={[
                        { key: 'includedItems', label: '포함 사항',   rows: 7 },
                        { key: 'excludedItems', label: '불포함 사항', rows: 7 },
                    ]}
                    detail={detail} setDetail={setDetail}
                    saving={detailSaving} onSave={handleSaveDetail}
                />
            )}

            {/* ── 탭 3: 가이드 미팅정보 ── */}
            {activeTab === 3 && (
                detailLoad ? <Loading /> :
                <Stack spacing={2} sx={{ pt: 1 }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField label="가이드 / 인솔자명" value={detail.guideName}
                            onChange={e => setDetail(d => ({ ...d, guideName: e.target.value }))} fullWidth />
                        <TextField label="연락처" value={detail.guidePhone}
                            onChange={e => setDetail(d => ({ ...d, guidePhone: e.target.value }))} fullWidth />
                    </Stack>
                    <TextField label="미팅 장소" value={detail.meetingLocation}
                        onChange={e => setDetail(d => ({ ...d, meetingLocation: e.target.value }))} fullWidth />
                    <TextField label="미팅 시간" value={detail.meetingTime}
                        onChange={e => setDetail(d => ({ ...d, meetingTime: e.target.value }))}
                        fullWidth placeholder="예: 08:00" />
                    <TextField label="안내 사항" value={detail.notes}
                        onChange={e => setDetail(d => ({ ...d, notes: e.target.value }))}
                        fullWidth multiline rows={4} />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', pr: 9 }}>
                        <Button variant="contained" startIcon={<SaveIcon />}
                            onClick={handleSaveDetail} disabled={detailSaving}>
                            {detailSaving ? '저장 중...' : '저장'}
                        </Button>
                    </Box>
                </Stack>
            )}

            {/* ── 탭 4: 상품 가격 ── */}
            {activeTab === 4 && (
                (pricesLoad || detailLoad) ? <Loading /> :
                <Stack spacing={3} sx={{ pt: 1 }}>
                    {/* 연령 기준 */}
                    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                            연령 기준
                        </Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField size="small" label="성인" value={detail.ageAdult || ''}
                                onChange={e => setDetail(d => ({ ...d, ageAdult: e.target.value }))}
                                placeholder="예: 만 12세 이상" fullWidth />
                            <TextField size="small" label="아동" value={detail.ageChild || ''}
                                onChange={e => setDetail(d => ({ ...d, ageChild: e.target.value }))}
                                placeholder="예: 만 2세 ~ 11세" fullWidth />
                            <TextField size="small" label="유아" value={detail.ageInfant || ''}
                                onChange={e => setDetail(d => ({ ...d, ageInfant: e.target.value }))}
                                placeholder="예: 만 2세 미만" fullWidth />
                        </Stack>
                    </Box>

                    {/* 가격 추가 버튼 + 테이블 */}
                    <Box>
                        {!addingPrice && (
                            <Box sx={{ mb: 1 }}>
                                <Button startIcon={<AddIcon />} onClick={() => setAddingPrice(true)}>
                                    가격 추가
                                </Button>
                            </Box>
                        )}
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'grey.50' }}>
                                    <TableCell sx={{ width: '28%' }} align="center">객실 타입</TableCell>
                                    <TableCell sx={{ width: '20%' }} align="center">성인 (원)</TableCell>
                                    <TableCell sx={{ width: '20%' }} align="center">아동 (원)</TableCell>
                                    <TableCell sx={{ width: '20%' }} align="center">유아 (원)</TableCell>
                                    <TableCell sx={{ width: '12%' }} align="center">관리</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {addingPrice && (
                                    <TableRow>
                                        <TableCell align="center">
                                            <TextField size="small" value={priceForm.cabinType} autoFocus
                                                onChange={e => setPriceForm(f => ({ ...f, cabinType: e.target.value }))}
                                                placeholder="예: 내항실" sx={{ width: 120 }} />
                                        </TableCell>
                                        <TableCell align="center">
                                            <TextField size="small" type="number" value={priceForm.priceAdult}
                                                onChange={e => setPriceForm(f => ({ ...f, priceAdult: e.target.value }))}
                                                sx={{ width: 110 }} />
                                        </TableCell>
                                        <TableCell align="center">
                                            <TextField size="small" type="number" value={priceForm.priceChild}
                                                onChange={e => setPriceForm(f => ({ ...f, priceChild: e.target.value }))}
                                                sx={{ width: 110 }} />
                                        </TableCell>
                                        <TableCell align="center">
                                            <TextField size="small" type="number" value={priceForm.priceInfant}
                                                onChange={e => setPriceForm(f => ({ ...f, priceInfant: e.target.value }))}
                                                sx={{ width: 110 }} />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Stack direction="row" justifyContent="center" spacing={0.5}>
                                                <IconButton size="small" color="primary" onClick={handleAddPrice}>
                                                    <CheckIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" onClick={() => {
                                                    setAddingPrice(false);
                                                    setPriceForm(EMPTY_PRICE);
                                                }}>
                                                    <CloseIcon fontSize="small" />
                                                </IconButton>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                )}

                                {prices.map(p => (
                                    <TableRow key={p.id}>
                                        {editingPriceId === p.id ? (
                                            <>
                                                <TableCell align="center">
                                                    <TextField size="small" value={editingPriceForm.cabinType}
                                                        onChange={e => setEditingPriceForm(f => ({ ...f, cabinType: e.target.value }))}
                                                        placeholder="예: 내항실" sx={{ width: 120 }} />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <TextField size="small" type="number" value={editingPriceForm.priceAdult}
                                                        onChange={e => setEditingPriceForm(f => ({ ...f, priceAdult: e.target.value }))}
                                                        sx={{ width: 110 }} />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <TextField size="small" type="number" value={editingPriceForm.priceChild}
                                                        onChange={e => setEditingPriceForm(f => ({ ...f, priceChild: e.target.value }))}
                                                        sx={{ width: 110 }} />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <TextField size="small" type="number" value={editingPriceForm.priceInfant}
                                                        onChange={e => setEditingPriceForm(f => ({ ...f, priceInfant: e.target.value }))}
                                                        sx={{ width: 110 }} />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Stack direction="row" justifyContent="center" spacing={0.5}>
                                                        <IconButton size="small" color="primary" onClick={handleUpdatePrice}>
                                                            <CheckIcon fontSize="small" />
                                                        </IconButton>
                                                        <IconButton size="small" onClick={() => setEditingPriceId(null)}>
                                                            <CloseIcon fontSize="small" />
                                                        </IconButton>
                                                    </Stack>
                                                </TableCell>
                                            </>
                                        ) : (
                                            <>
                                                <TableCell align="center">{p.cabinType}</TableCell>
                                                <TableCell align="center">{fmtPrice(p.priceAdult)}</TableCell>
                                                <TableCell align="center">{fmtPrice(p.priceChild)}</TableCell>
                                                <TableCell align="center">{fmtPrice(p.priceInfant)}</TableCell>
                                                <TableCell align="center">
                                                    <Stack direction="row" justifyContent="center" spacing={0.5}>
                                                        <IconButton size="small" onClick={() => {
                                                            setEditingPriceId(p.id);
                                                            setEditingPriceForm({
                                                                cabinType:   p.cabinType,
                                                                priceAdult:  p.priceAdult,
                                                                priceChild:  p.priceChild,
                                                                priceInfant: p.priceInfant,
                                                            });
                                                        }}>
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                        <IconButton size="small" color="error" onClick={() => handleDeletePrice(p.id)}>
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Stack>
                                                </TableCell>
                                            </>
                                        )}
                                    </TableRow>
                                ))}

                                {prices.length === 0 && !addingPrice && (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ color: 'text.disabled', py: 3 }}>
                                            등록된 가격 정보가 없습니다.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Box>

                    {/* 유료할증료 / 상품 약관 / 예약 유의사항 / 나라별 입국규정 */}
                    <TextField label="유료할증료" value={detail.surchargeInfo || ''}
                        onChange={e => setDetail(d => ({ ...d, surchargeInfo: e.target.value }))}
                        fullWidth multiline rows={4} placeholder="유류할증료, 항만세 등 추가 비용 안내" />
                    <TextField label="상품 약관" value={detail.terms || ''}
                        onChange={e => setDetail(d => ({ ...d, terms: e.target.value }))}
                        fullWidth multiline rows={6} />
                    <TextField label="예약시 유의사항" value={detail.reservationNotes || ''}
                        onChange={e => setDetail(d => ({ ...d, reservationNotes: e.target.value }))}
                        fullWidth multiline rows={6} />
                    <TextField label="나라별 입국규정" value={detail.entryRegulations || ''}
                        onChange={e => setDetail(d => ({ ...d, entryRegulations: e.target.value }))}
                        fullWidth multiline rows={6} />

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', pr: 9 }}>
                        <Button variant="contained" startIcon={<SaveIcon />}
                            onClick={handleSaveDetail} disabled={detailSaving}>
                            {detailSaving ? '저장 중...' : '저장'}
                        </Button>
                    </Box>
                </Stack>
            )}


            <Snackbar open={snack.open} autoHideDuration={2500}
                onClose={() => setSnack(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity={snack.severity} variant="filled">{snack.msg}</Alert>
            </Snackbar>
        </Box>
    );
}

/* ── 공통 로딩 ── */
function Loading() {
    return <Box sx={{ py: 4, textAlign: 'center' }}><CircularProgress /></Box>;
}

/* ── 공통 detail 폼 (유의사항, 포함/불포함) ── */
function DetailForm({ fields, detail, setDetail, saving, onSave }) {
    return (
        <Stack spacing={2} sx={{ pt: 1 }}>
            {fields.map(f => (
                <TextField key={f.key} label={f.label} value={detail[f.key] || ''}
                    onChange={e => setDetail(d => ({ ...d, [f.key]: e.target.value }))}
                    fullWidth multiline rows={f.rows} />
            ))}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', pr: 9 }}>
                <Button variant="contained" startIcon={<SaveIcon />} onClick={onSave} disabled={saving}>
                    {saving ? '저장 중...' : '저장'}
                </Button>
            </Box>
        </Stack>
    );
}

/* ══════════════════════════════════════════════
   탭 0: 여행 일정 섹션
══════════════════════════════════════════════ */
function ItinerarySection({ productId, onAfterSave }) {
    const [itineraries,       setItineraries]       = useState([]);
    const [loading,           setLoading]           = useState(true);
    const [dialogOpen,        setDialogOpen]        = useState(false);
    const [editTarget,        setEditTarget]        = useState(null);
    const [activeItineraryId, setActiveItineraryId] = useState(null);
    const [form,              setForm]              = useState(EMPTY_FORM);
    const [saving,            setSaving]            = useState(false);

    const [pendingSchedules, setPendingSchedules] = useState([]);

    const [addingSchedule,      setAddingSchedule]      = useState(false);
    const [scheduleForm,        setScheduleForm]        = useState(EMPTY_SCHEDULE);
    const [scheduleSaving,      setScheduleSaving]      = useState(false);
    const [editingScheduleId,   setEditingScheduleId]   = useState(null);
    const [editingScheduleForm, setEditingScheduleForm] = useState(EMPTY_SCHEDULE);

    const [toast, setToast] = useState('');
    const [snack, setSnack] = useState({ open: false, msg: '' });

    useEffect(() => { load(); }, [productId]);

    const load = async () => {
        setLoading(true);
        try { setItineraries(await api.getCruiseItineraries(productId)); }
        finally { setLoading(false); }
    };

    const silentLoad = async () => {
        try { setItineraries(await api.getCruiseItineraries(productId)); } catch {}
    };

    const openAdd = () => {
        setEditTarget(null);
        setActiveItineraryId(null);
        setForm({ ...EMPTY_FORM });
        setPendingSchedules([]);
        setAddingSchedule(false);
        setEditingScheduleId(null);
        setDialogOpen(true);
    };

    const openEdit = (item) => {
        setEditTarget(item);
        setActiveItineraryId(item.id);
        setForm({
            dayNumber:            item.dayNumber,
            title:                item.title                || '',
            description:          item.description          || '',
            hotelName:            item.hotelName            || '',
            shoppingCenterName:   item.shoppingCenterName   || '',
            shoppingExchangeInfo: item.shoppingExchangeInfo || '',
            shoppingInfo:         item.shoppingInfo         || '',
        });
        setPendingSchedules([]);
        setAddingSchedule(false);
        setEditingScheduleId(null);
        setDialogOpen(true);
    };

    const closeDialog = () => {
        pendingSchedules.forEach(s => (s.pendingImages || []).forEach(i => URL.revokeObjectURL(i.previewUrl)));
        setDialogOpen(false);
    };

    const addPendingRow = () =>
        setPendingSchedules(ps => [...ps, { tempId: Date.now(), time: '', ampm: 'AM', description: '', pendingImages: [] }]);
    const removePendingRow = (tempId) =>
        setPendingSchedules(ps => ps.filter(s => s.tempId !== tempId));
    const updatePendingRow = (tempId, field, value) =>
        setPendingSchedules(ps => ps.map(s => s.tempId === tempId ? { ...s, [field]: value } : s));

    const addPendingScheduleImage = (tempId, files) => {
        const entries = Array.from(files).map(file => ({
            imgTempId: `${Date.now()}_${Math.random()}`,
            file,
            previewUrl: URL.createObjectURL(file),
        }));
        setPendingSchedules(ps => ps.map(s =>
            s.tempId === tempId ? { ...s, pendingImages: [...(s.pendingImages || []), ...entries] } : s
        ));
    };
    const removePendingScheduleImage = (tempId, imgTempId) => {
        setPendingSchedules(ps => ps.map(s => {
            if (s.tempId !== tempId) return s;
            const target = (s.pendingImages || []).find(i => i.imgTempId === imgTempId);
            if (target) URL.revokeObjectURL(target.previewUrl);
            return { ...s, pendingImages: (s.pendingImages || []).filter(i => i.imgTempId !== imgTempId) };
        }));
    };

    const handleSave = async () => {
        if (!form.dayNumber || !form.title.trim()) {
            setToast('일차와 제목은 필수입니다.');
            return;
        }
        setSaving(true);
        const params = new URLSearchParams();
        params.append('dayNumber', form.dayNumber);
        params.append('title',     form.title);
        params.append('sortOrder', editTarget ? editTarget.sortOrder : itineraries.length);
        if (form.description)          params.append('description',          form.description);
        if (form.hotelName)            params.append('hotelName',            form.hotelName);
        if (form.shoppingCenterName)   params.append('shoppingCenterName',   form.shoppingCenterName);
        if (form.shoppingExchangeInfo) params.append('shoppingExchangeInfo', form.shoppingExchangeInfo);
        if (form.shoppingInfo)         params.append('shoppingInfo',         form.shoppingInfo);

        try {
            if (editTarget) {
                await api.updateCruiseItinerary(productId, editTarget.id, params);
                setSnack({ open: true, msg: '일정이 수정되었습니다.' });
                closeDialog();
                await load();
            } else {
                const created = await api.createCruiseItinerary(productId, params);

                const validSchedules = pendingSchedules.filter(s => s.description.trim());
                for (let i = 0; i < validSchedules.length; i++) {
                    const sp = new URLSearchParams();
                    if (validSchedules[i].time) sp.append('time', `${validSchedules[i].time} ${validSchedules[i].ampm}`);
                    sp.append('description', validSchedules[i].description);
                    sp.append('sortOrder', i);
                    const createdSchedule = await api.addCruiseSchedule(productId, created.id, sp);
                    for (const img of (validSchedules[i].pendingImages || [])) {
                        const fd = new FormData();
                        fd.append('file', img.file);
                        await api.uploadCruiseScheduleImage(productId, created.id, createdSchedule.id, fd);
                        URL.revokeObjectURL(img.previewUrl);
                    }
                }
                const fresh = await api.getCruiseItineraries(productId);
                setItineraries(fresh);
                const savedItem = fresh.find(i => i.id === created.id);
                setActiveItineraryId(created.id);
                setEditTarget(savedItem ?? created);
                setPendingSchedules([]);
                setSnack({ open: true, msg: '저장되었습니다. 등록된 시간대를 확인하세요.' });
            }
        } catch {
            setToast('저장 중 오류가 발생했습니다.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteItinerary = async (id) => {
        if (!window.confirm('이 일정을 삭제하시겠습니까? 이미지도 함께 삭제됩니다.')) return;
        await api.deleteCruiseItinerary(productId, id);
        await load();
    };

    const handleAddSchedule = async () => {
        if (!scheduleForm.description.trim()) return;
        setScheduleSaving(true);
        const params = new URLSearchParams();
        if (scheduleForm.time) params.append('time', `${scheduleForm.time} ${scheduleForm.ampm}`);
        params.append('description', scheduleForm.description);
        params.append('sortOrder', dialogSchedules.length);
        try {
            await api.addCruiseSchedule(productId, activeItineraryId, params);
            setScheduleForm(EMPTY_SCHEDULE);
            setAddingSchedule(false);
            await silentLoad();
        } finally { setScheduleSaving(false); }
    };

    const handleUpdateSchedule = async (scheduleId) => {
        if (!editingScheduleForm.description.trim()) return;
        setScheduleSaving(true);
        const params = new URLSearchParams();
        if (editingScheduleForm.time) params.append('time', `${editingScheduleForm.time} ${editingScheduleForm.ampm}`);
        params.append('description', editingScheduleForm.description);
        params.append('sortOrder', 0);
        try {
            await api.updateCruiseSchedule(productId, activeItineraryId, scheduleId, params);
            setEditingScheduleId(null);
            await silentLoad();
        } finally { setScheduleSaving(false); }
    };

    const handleDeleteSchedule = async (scheduleId) => {
        if (!window.confirm('이 시간 일정을 삭제하시겠습니까?')) return;
        await api.deleteCruiseSchedule(productId, activeItineraryId, scheduleId);
        await silentLoad();
    };

    const dialogItinerary = itineraries.find(i => i.id === activeItineraryId);
    const dialogSchedules = [...(dialogItinerary?.schedules || [])].sort((a, b) => toMinutes(a.time) - toMinutes(b.time));

    if (loading) return <Loading />;

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="body2" color="text.secondary">
                    일정을 일차 순서대로 등록하세요.
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>
                    일정 추가
                </Button>
            </Stack>

            {itineraries.length === 0 && (
                <Box sx={{ py: 6, textAlign: 'center', color: 'text.disabled', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
                    <Typography variant="body2">등록된 일정이 없습니다.</Typography>
                </Box>
            )}

            <Stack spacing={2}>
                {itineraries.map((item) => (
                    <Box key={item.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between"
                            sx={{ px: 2, py: 1.5, bgcolor: 'grey.50' }}>
                            <Chip label={`${item.dayNumber}일차`} size="small" color="primary" />
                            <Stack direction="row" spacing={0.5}>
                                <IconButton size="small" onClick={() => openEdit(item)}><EditIcon fontSize="small" /></IconButton>
                                <IconButton size="small" color="error" onClick={() => handleDeleteItinerary(item.id)}><DeleteIcon fontSize="small" /></IconButton>
                            </Stack>
                        </Stack>

                        <Box sx={{ px: 2, py: 2 }}>
                            <Typography fontWeight={700} color="text.primary" sx={{ fontSize: '1.05rem', mb: 1 }}>
                                제목: {item.title}
                            </Typography>
                            {item.description && (
                                <Typography variant="body2" color="text.primary" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
                                    일정설명: {item.description}
                                </Typography>
                            )}

                            {/* 타임라인 */}
                            {(item.schedules || []).length > 0 ? (
                                <Box sx={{ mb: 1 }}>
                                    {[...item.schedules].sort((a, b) => toMinutes(a.time) - toMinutes(b.time)).map((s, idx) => (
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
                                                                <Box component="img" key={img.id}
                                                                    src={`${IMG_BASE}${img.imagePath}`}
                                                                    sx={{ width: 100, height: 75, objectFit: 'cover', borderRadius: 1, display: 'block' }} />
                                                            ))}
                                                        </Stack>
                                                    )}
                                                </Box>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            ) : (
                                <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 1 }}>등록된 시간 일정 없음</Typography>
                            )}

                            {item.hotelName && (
                                <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ display: 'block', mt: 1, mb: 0.5 }}>
                                    🏨 숙박: {item.hotelName}
                                </Typography>
                            )}
                            {item.shoppingCenterName && (
                                <Box sx={{ mt: 1, p: 1.5, bgcolor: 'warning.50', borderRadius: 1 }}>
                                    <Typography variant="caption" fontWeight={600} color="warning.dark">🛍 쇼핑</Typography>
                                    <Typography variant="body2" fontWeight={600}>{item.shoppingCenterName}</Typography>
                                    {item.shoppingInfo && <Typography variant="caption" color="text.secondary">{item.shoppingInfo}</Typography>}
                                </Box>
                            )}
                        </Box>
                    </Box>
                ))}
            </Stack>

            {/* ── 일정 추가/수정 다이얼로그 ── */}
            <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth
                PaperProps={{ sx: { maxHeight: '90vh' } }}>
                <DialogTitle>{editTarget ? '일정 수정' : '일정 추가'}</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2}>
                        {toast && <Alert severity="error" onClose={() => setToast('')}>{toast}</Alert>}

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField label="일차 *" type="number" value={form.dayNumber}
                                onChange={e => setForm(f => ({ ...f, dayNumber: e.target.value }))}
                                sx={{ width: { sm: 100 } }} inputProps={{ min: 1 }} />
                            <TextField label="제목 *" value={form.title} fullWidth
                                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                placeholder="예: 인천 승선, 상하이 도착" />
                        </Stack>

                        <TextField label="일정 설명" value={form.description} fullWidth multiline rows={2}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />

                        <Divider><Typography variant="caption" color="text.secondary">시간대별 일정</Typography></Divider>

                        {!activeItineraryId ? (
                            <Box>
                                <Stack spacing={1} sx={{ mb: 1 }}>
                                    {pendingSchedules.map(s => {
                                        const pendingSchedImgRef = React.createRef();
                                        return (
                                            <Box key={s.tempId} sx={{ mb: 0.5 }}>
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <TextField select size="small" value={s.ampm}
                                                        onChange={e => updatePendingRow(s.tempId, 'ampm', e.target.value)}
                                                        sx={{ width: 88 }}>
                                                        <MenuItem value="AM">AM</MenuItem>
                                                        <MenuItem value="PM">PM</MenuItem>
                                                    </TextField>
                                                    <TextField size="small" label="시간" value={s.time}
                                                        onChange={e => updatePendingRow(s.tempId, 'time', e.target.value)}
                                                        sx={{ width: 88 }} placeholder="9:00" />
                                                    <TextField size="small" label="내용 *" value={s.description}
                                                        onChange={e => updatePendingRow(s.tempId, 'description', e.target.value)}
                                                        sx={{ flex: 1 }} placeholder="일정 내용" />
                                                    <input type="file" accept="image/*" multiple hidden ref={pendingSchedImgRef}
                                                        onChange={e => { if (e.target.files?.length) addPendingScheduleImage(s.tempId, e.target.files); e.target.value = ''; }} />
                                                    <IconButton size="small" title="이미지 추가" onClick={() => pendingSchedImgRef.current?.click()}>
                                                        <PhotoCameraIcon sx={{ fontSize: 16 }} />
                                                    </IconButton>
                                                    <IconButton size="small" color="error" onClick={() => removePendingRow(s.tempId)}>
                                                        <CloseIcon fontSize="small" />
                                                    </IconButton>
                                                </Stack>
                                                {(s.pendingImages || []).length > 0 && (
                                                    <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 0.5, pl: 1 }}>
                                                        {(s.pendingImages || []).map(img => (
                                                            <Box key={img.imgTempId} sx={{ position: 'relative' }}>
                                                                <Box component="img" src={img.previewUrl}
                                                                    sx={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 1, display: 'block' }} />
                                                                <IconButton size="small" color="error"
                                                                    sx={{ position: 'absolute', top: 1, right: 1, bgcolor: 'rgba(255,255,255,0.85)', p: '2px' }}
                                                                    onClick={() => removePendingScheduleImage(s.tempId, img.imgTempId)}>
                                                                    <DeleteIcon sx={{ fontSize: 12 }} />
                                                                </IconButton>
                                                            </Box>
                                                        ))}
                                                    </Stack>
                                                )}
                                            </Box>
                                        );
                                    })}
                                </Stack>
                                <Button size="small" startIcon={<AddIcon />} onClick={addPendingRow}>시간 일정 추가</Button>
                            </Box>
                        ) : (
                            <Box>
                                <Stack spacing={1} sx={{ mb: 1 }}>
                                    {dialogSchedules.map(s => {
                                        const editSchedImgRef = React.createRef();
                                        return (
                                        <Box key={s.id}>
                                            {editingScheduleId === s.id ? (
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <TextField select size="small" value={editingScheduleForm.ampm}
                                                        onChange={e => setEditingScheduleForm(f => ({ ...f, ampm: e.target.value }))}
                                                        sx={{ width: 88 }}>
                                                        <MenuItem value="AM">AM</MenuItem>
                                                        <MenuItem value="PM">PM</MenuItem>
                                                    </TextField>
                                                    <TextField size="small" label="시간" value={editingScheduleForm.time}
                                                        onChange={e => setEditingScheduleForm(f => ({ ...f, time: e.target.value }))}
                                                        sx={{ width: 88 }} placeholder="9:00" />
                                                    <TextField size="small" label="내용 *" value={editingScheduleForm.description}
                                                        onChange={e => setEditingScheduleForm(f => ({ ...f, description: e.target.value }))}
                                                        sx={{ flex: 1 }} />
                                                    <IconButton size="small" color="primary" disabled={scheduleSaving}
                                                        onClick={() => handleUpdateSchedule(s.id)}><CheckIcon fontSize="small" /></IconButton>
                                                    <IconButton size="small" onClick={() => setEditingScheduleId(null)}><CloseIcon fontSize="small" /></IconButton>
                                                </Stack>
                                            ) : (
                                                <Box>
                                                    <Stack direction="row" alignItems="center" spacing={1}
                                                        sx={{ px: 1.5, py: 0.75, bgcolor: 'grey.50', borderRadius: 1 }}>
                                                        <Typography variant="caption" fontWeight={700} color="primary.main" sx={{ minWidth: 58 }}>
                                                            {formatTime(s.time)}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ flex: 1 }}>{s.description}</Typography>
                                                        <input type="file" accept="image/*" multiple hidden ref={editSchedImgRef}
                                                            onChange={async e => {
                                                                if (!e.target.files?.length) return;
                                                                for (const file of Array.from(e.target.files)) {
                                                                    const fd = new FormData(); fd.append('file', file);
                                                                    await api.uploadCruiseScheduleImage(productId, activeItineraryId, s.id, fd);
                                                                }
                                                                e.target.value = '';
                                                                await silentLoad();
                                                            }} />
                                                        <IconButton size="small" title="이미지 추가" onClick={() => editSchedImgRef.current?.click()}>
                                                            <PhotoCameraIcon sx={{ fontSize: 14 }} />
                                                        </IconButton>
                                                        <IconButton size="small" onClick={() => {
                                                            setEditingScheduleId(s.id);
                                                            const p = parseTime(s.time);
                                                            setEditingScheduleForm({ time: p.time, ampm: p.ampm, description: s.description });
                                                        }}><EditIcon sx={{ fontSize: 14 }} /></IconButton>
                                                        <IconButton size="small" color="error"
                                                            onClick={() => handleDeleteSchedule(s.id)}><DeleteIcon sx={{ fontSize: 14 }} /></IconButton>
                                                    </Stack>
                                                    {(s.images || []).length > 0 && (
                                                        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 0.5, pl: 1.5, pb: 0.5 }}>
                                                            {s.images.map(img => (
                                                                <Box key={img.id} sx={{ position: 'relative' }}>
                                                                    <Box component="img" src={`${IMG_BASE}${img.imagePath}`}
                                                                        sx={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 1, display: 'block' }} />
                                                                    <IconButton size="small" color="error"
                                                                        sx={{ position: 'absolute', top: 1, right: 1, bgcolor: 'rgba(255,255,255,0.85)', p: '2px' }}
                                                                        onClick={async () => {
                                                                            await api.deleteCruiseScheduleImage(productId, activeItineraryId, s.id, img.id);
                                                                            await silentLoad();
                                                                        }}>
                                                                        <DeleteIcon sx={{ fontSize: 12 }} />
                                                                    </IconButton>
                                                                </Box>
                                                            ))}
                                                        </Stack>
                                                    )}
                                                </Box>
                                            )}
                                        </Box>
                                        );
                                    })}
                                </Stack>
                                {addingSchedule ? (
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <TextField select size="small" value={scheduleForm.ampm}
                                            onChange={e => setScheduleForm(f => ({ ...f, ampm: e.target.value }))}
                                            sx={{ width: 88 }}>
                                            <MenuItem value="AM">AM</MenuItem>
                                            <MenuItem value="PM">PM</MenuItem>
                                        </TextField>
                                        <TextField size="small" label="시간" value={scheduleForm.time}
                                            onChange={e => setScheduleForm(f => ({ ...f, time: e.target.value }))}
                                            sx={{ width: 88 }} placeholder="9:00" />
                                        <TextField size="small" label="내용 *" value={scheduleForm.description}
                                            onChange={e => setScheduleForm(f => ({ ...f, description: e.target.value }))}
                                            sx={{ flex: 1 }} placeholder="일정 내용을 입력하세요" />
                                        <IconButton size="small" color="primary" disabled={scheduleSaving}
                                            onClick={handleAddSchedule}><CheckIcon fontSize="small" /></IconButton>
                                        <IconButton size="small" onClick={() => {
                                            setAddingSchedule(false);
                                            setScheduleForm(EMPTY_SCHEDULE);
                                        }}><CloseIcon fontSize="small" /></IconButton>
                                    </Stack>
                                ) : (
                                    <Button size="small" startIcon={<AddIcon />} onClick={() => setAddingSchedule(true)}>
                                        시간 일정 추가
                                    </Button>
                                )}
                            </Box>
                        )}

                        <Divider><Typography variant="caption" color="text.secondary">숙박 정보 (선택)</Typography></Divider>
                        <TextField label="호텔명" value={form.hotelName} fullWidth
                            onChange={e => setForm(f => ({ ...f, hotelName: e.target.value }))} />

                        <Divider><Typography variant="caption" color="text.secondary">쇼핑 정보 (선택)</Typography></Divider>
                        <TextField label="쇼핑센터 명칭" value={form.shoppingCenterName} fullWidth
                            onChange={e => setForm(f => ({ ...f, shoppingCenterName: e.target.value }))} />
                        <TextField label="교환/환불 안내" value={form.shoppingExchangeInfo} fullWidth multiline rows={2}
                            onChange={e => setForm(f => ({ ...f, shoppingExchangeInfo: e.target.value }))} />
                        <TextField label="간략한 쇼핑센터 정보" value={form.shoppingInfo} fullWidth multiline rows={2}
                            onChange={e => setForm(f => ({ ...f, shoppingInfo: e.target.value }))} />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>닫기</Button>
                    <Button variant="contained" onClick={handleSave} disabled={saving}>
                        {saving ? '저장 중...' : editTarget ? '수정' : '저장'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snack.open} autoHideDuration={2500}
                onClose={() => setSnack(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity="success" variant="filled">{snack.msg}</Alert>
            </Snackbar>
        </Box>
    );
}

