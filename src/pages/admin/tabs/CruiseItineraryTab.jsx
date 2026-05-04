import React, { useEffect, useState, useRef } from 'react';
import {
    Box, Button, Typography, Stack, IconButton, Chip,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Divider, Alert, CircularProgress, Snackbar,
    Tabs, Tab, Table, TableBody, TableCell, TableHead, TableRow,
} from '@mui/material';
import AddIcon         from '@mui/icons-material/Add';
import EditIcon        from '@mui/icons-material/Edit';
import DeleteIcon      from '@mui/icons-material/Delete';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import HotelIcon       from '@mui/icons-material/Hotel';
import LandscapeIcon   from '@mui/icons-material/Landscape';
import AccessTimeIcon  from '@mui/icons-material/AccessTime';
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
const EMPTY_SCHEDULE = { time: '', description: '' };
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
export default function CruiseItineraryTab({ productId }) {
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

    const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
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
            <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}
                variant="scrollable" scrollButtons="auto"
                sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tab label="여행 일정" />
                <Tab label="유의사항" />
                <Tab label="포함 / 불포함" />
                <Tab label="가이드 미팅정보" />
                <Tab label="상품 가격" />
                <Tab label="여행후기" />
            </Tabs>

            {/* ── 탭 0: 여행 일정 ── */}
            {activeTab === 0 && <ItinerarySection productId={productId} />}

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
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
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

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button variant="contained" startIcon={<SaveIcon />}
                            onClick={handleSaveDetail} disabled={detailSaving}>
                            {detailSaving ? '저장 중...' : '저장'}
                        </Button>
                    </Box>
                </Stack>
            )}

            {/* ── 탭 5: 여행후기 ── */}
            {activeTab === 5 && (
                <Box sx={{ py: 6, textAlign: 'center', color: 'text.disabled', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
                    <Typography variant="body2">여행후기 기능은 준비 중입니다.</Typography>
                </Box>
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
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
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
function ItinerarySection({ productId }) {
    const [itineraries,       setItineraries]       = useState([]);
    const [loading,           setLoading]           = useState(true);
    const [dialogOpen,        setDialogOpen]        = useState(false);
    const [editTarget,        setEditTarget]        = useState(null);
    const [activeItineraryId, setActiveItineraryId] = useState(null);
    const [form,              setForm]              = useState(EMPTY_FORM);
    const [saving,            setSaving]            = useState(false);
    const [imgUploading,      setImgUploading]      = useState({ location: false, hotel: false });

    const [pendingSchedules,     setPendingSchedules]     = useState([]);
    const [pendingLocationFiles, setPendingLocationFiles] = useState([]);
    const [pendingHotelFiles,    setPendingHotelFiles]    = useState([]);

    const [addingSchedule,      setAddingSchedule]      = useState(false);
    const [scheduleForm,        setScheduleForm]        = useState(EMPTY_SCHEDULE);
    const [scheduleSaving,      setScheduleSaving]      = useState(false);
    const [editingScheduleId,   setEditingScheduleId]   = useState(null);
    const [editingScheduleForm, setEditingScheduleForm] = useState(EMPTY_SCHEDULE);

    const [toast, setToast] = useState('');
    const [snack, setSnack] = useState({ open: false, msg: '' });

    const locationListRefs  = useRef({});
    const hotelListRefs     = useRef({});
    const pendingLocationRef = useRef(null);
    const pendingHotelRef    = useRef(null);
    const locationDialogRef  = useRef(null);
    const hotelDialogRef     = useRef(null);

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
        setPendingLocationFiles([]);
        setPendingHotelFiles([]);
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
        setPendingLocationFiles([]);
        setPendingHotelFiles([]);
        setAddingSchedule(false);
        setEditingScheduleId(null);
        setDialogOpen(true);
    };

    const closeDialog = () => {
        pendingLocationFiles.forEach(f => URL.revokeObjectURL(f.previewUrl));
        pendingHotelFiles.forEach(f => URL.revokeObjectURL(f.previewUrl));
        setPendingLocationFiles([]);
        setPendingHotelFiles([]);
        setDialogOpen(false);
    };

    const addPendingRow = () =>
        setPendingSchedules(ps => [...ps, { tempId: Date.now(), time: '', description: '' }]);
    const removePendingRow = (tempId) =>
        setPendingSchedules(ps => ps.filter(s => s.tempId !== tempId));
    const updatePendingRow = (tempId, field, value) =>
        setPendingSchedules(ps => ps.map(s => s.tempId === tempId ? { ...s, [field]: value } : s));

    const addPendingImages = (files, type) => {
        const entries = Array.from(files).map(file => ({
            tempId: `${Date.now()}_${Math.random()}`,
            file,
            previewUrl: URL.createObjectURL(file),
        }));
        if (type === 'LOCATION') setPendingLocationFiles(ps => [...ps, ...entries]);
        else setPendingHotelFiles(ps => [...ps, ...entries]);
    };

    const removePendingImage = (tempId, type) => {
        const setter = type === 'LOCATION' ? setPendingLocationFiles : setPendingHotelFiles;
        setter(ps => {
            const target = ps.find(f => f.tempId === tempId);
            if (target) URL.revokeObjectURL(target.previewUrl);
            return ps.filter(f => f.tempId !== tempId);
        });
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
                    if (validSchedules[i].time) sp.append('time', validSchedules[i].time);
                    sp.append('description', validSchedules[i].description);
                    sp.append('sortOrder', i);
                    await api.addCruiseSchedule(productId, created.id, sp);
                }
                for (const pf of pendingLocationFiles) {
                    const fd = new FormData();
                    fd.append('file', pf.file);
                    fd.append('imageType', 'LOCATION');
                    await api.uploadCruiseItineraryImage(productId, created.id, fd);
                    URL.revokeObjectURL(pf.previewUrl);
                }
                for (const pf of pendingHotelFiles) {
                    const fd = new FormData();
                    fd.append('file', pf.file);
                    fd.append('imageType', 'HOTEL');
                    await api.uploadCruiseItineraryImage(productId, created.id, fd);
                    URL.revokeObjectURL(pf.previewUrl);
                }

                setPendingSchedules([]);
                setPendingLocationFiles([]);
                setPendingHotelFiles([]);
                setEditTarget(created);
                setActiveItineraryId(created.id);
                setSnack({ open: true, msg: '저장되었습니다.' });
                await silentLoad();
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
        if (scheduleForm.time) params.append('time', scheduleForm.time);
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
        if (editingScheduleForm.time) params.append('time', editingScheduleForm.time);
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

    const handleImageUpload = async (itineraryId, files, imageType) => {
        setImgUploading(u => ({ ...u, [imageType === 'LOCATION' ? 'location' : 'hotel']: true }));
        try {
            for (const file of Array.from(files)) {
                const fd = new FormData();
                fd.append('file', file);
                fd.append('imageType', imageType);
                await api.uploadCruiseItineraryImage(productId, itineraryId, fd);
            }
            await silentLoad();
        } finally {
            setImgUploading(u => ({ ...u, [imageType === 'LOCATION' ? 'location' : 'hotel']: false }));
        }
    };

    const handleImageDelete = async (itineraryId, imageId, fromDialog = false) => {
        if (!window.confirm('이미지를 삭제하시겠습니까?')) return;
        await api.deleteCruiseItineraryImage(productId, itineraryId, imageId);
        fromDialog ? await silentLoad() : await load();
    };

    const dialogItinerary    = itineraries.find(i => i.id === activeItineraryId);
    const dialogSchedules    = dialogItinerary?.schedules  || [];
    const dialogLocationImgs = (dialogItinerary?.images || []).filter(i => i.imageType === 'LOCATION');
    const dialogHotelImgs    = (dialogItinerary?.images || []).filter(i => i.imageType === 'HOTEL');

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
                {itineraries.map((item) => {
                    const locationImgs = (item.images || []).filter(i => i.imageType === 'LOCATION');
                    const hotelImgs    = (item.images || []).filter(i => i.imageType === 'HOTEL');
                    return (
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
                                <Typography fontWeight={700} color="text.primary" sx={{ fontSize: '1.05rem', mb: 1.5 }}>
                                    제목: {item.title}
                                </Typography>
                                {item.description && (
                                    <Typography variant="body2" color="text.primary" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
                                        일정설명: {item.description}
                                    </Typography>
                                )}

                                {(item.schedules || []).length > 0 && (
                                    <Box sx={{ mb: 2 }}>
                                        <Stack direction="row" alignItems="center" spacing={0.5} mb={1}>
                                            <AccessTimeIcon fontSize="small" color="action" />
                                            <Typography variant="caption" fontWeight={600}>시간대별 일정</Typography>
                                        </Stack>
                                        <Stack spacing={0.5}>
                                            {item.schedules.map(s => (
                                                <Stack key={s.id} direction="row" spacing={1.5} alignItems="flex-start">
                                                    <Typography variant="caption" fontWeight={700} color="primary.main"
                                                        sx={{ minWidth: 42, mt: 0.2 }}>
                                                        {s.time || '–'}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">{s.description}</Typography>
                                                </Stack>
                                            ))}
                                        </Stack>
                                    </Box>
                                )}

                                <ImageRow
                                    icon={<LandscapeIcon fontSize="small" color="action" />}
                                    label={`관광지 이미지 (${locationImgs.length})`}
                                    images={locationImgs}
                                    onAdd={() => locationListRefs.current[item.id]?.click()}
                                    onDelete={(imgId) => handleImageDelete(item.id, imgId)}
                                    inputRef={el => locationListRefs.current[item.id] = el}
                                    onFileChange={e => {
                                        if (e.target.files?.length) handleImageUpload(item.id, e.target.files, 'LOCATION');
                                        e.target.value = '';
                                    }}
                                />
                                <Divider sx={{ my: 2 }} />
                                {item.hotelName && (
                                    <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ display: 'block', mb: 1 }}>
                                        🏨 숙박: {item.hotelName}
                                    </Typography>
                                )}
                                <ImageRow
                                    icon={<HotelIcon fontSize="small" color="action" />}
                                    label={`호텔 이미지 (${hotelImgs.length})`}
                                    images={hotelImgs}
                                    onAdd={() => hotelListRefs.current[item.id]?.click()}
                                    onDelete={(imgId) => handleImageDelete(item.id, imgId)}
                                    inputRef={el => hotelListRefs.current[item.id] = el}
                                    onFileChange={e => {
                                        if (e.target.files?.length) handleImageUpload(item.id, e.target.files, 'HOTEL');
                                        e.target.value = '';
                                    }}
                                />
                                {item.shoppingCenterName && (
                                    <Box sx={{ mt: 2, p: 1.5, bgcolor: 'warning.50', borderRadius: 1 }}>
                                        <Typography variant="caption" fontWeight={600} color="warning.dark">🛍 쇼핑</Typography>
                                        <Typography variant="body2" fontWeight={600}>{item.shoppingCenterName}</Typography>
                                        {item.shoppingInfo && <Typography variant="caption" color="text.secondary">{item.shoppingInfo}</Typography>}
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    );
                })}
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
                                    {pendingSchedules.map(s => (
                                        <Stack key={s.tempId} direction="row" spacing={1} alignItems="center">
                                            <TextField size="small" label="시간" value={s.time}
                                                onChange={e => updatePendingRow(s.tempId, 'time', e.target.value)}
                                                sx={{ width: 90 }} placeholder="09:00" />
                                            <TextField size="small" label="내용 *" value={s.description}
                                                onChange={e => updatePendingRow(s.tempId, 'description', e.target.value)}
                                                fullWidth placeholder="일정 내용" />
                                            <IconButton size="small" color="error" onClick={() => removePendingRow(s.tempId)}>
                                                <CloseIcon fontSize="small" />
                                            </IconButton>
                                        </Stack>
                                    ))}
                                </Stack>
                                <Button size="small" startIcon={<AddIcon />} onClick={addPendingRow}>시간 일정 추가</Button>
                            </Box>
                        ) : (
                            <Box>
                                <Stack spacing={1} sx={{ mb: 1 }}>
                                    {dialogSchedules.map(s => (
                                        <Box key={s.id}>
                                            {editingScheduleId === s.id ? (
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <TextField size="small" label="시간" value={editingScheduleForm.time}
                                                        onChange={e => setEditingScheduleForm(f => ({ ...f, time: e.target.value }))}
                                                        sx={{ width: 90 }} placeholder="09:00" />
                                                    <TextField size="small" label="내용 *" value={editingScheduleForm.description}
                                                        onChange={e => setEditingScheduleForm(f => ({ ...f, description: e.target.value }))}
                                                        fullWidth />
                                                    <IconButton size="small" color="primary" disabled={scheduleSaving}
                                                        onClick={() => handleUpdateSchedule(s.id)}><CheckIcon fontSize="small" /></IconButton>
                                                    <IconButton size="small" onClick={() => setEditingScheduleId(null)}><CloseIcon fontSize="small" /></IconButton>
                                                </Stack>
                                            ) : (
                                                <Stack direction="row" alignItems="center" spacing={1}
                                                    sx={{ px: 1.5, py: 0.75, bgcolor: 'grey.50', borderRadius: 1 }}>
                                                    <Typography variant="caption" fontWeight={700} color="primary.main" sx={{ minWidth: 42 }}>
                                                        {s.time || '–'}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ flex: 1 }}>{s.description}</Typography>
                                                    <IconButton size="small" onClick={() => {
                                                        setEditingScheduleId(s.id);
                                                        setEditingScheduleForm({ time: s.time || '', description: s.description });
                                                    }}><EditIcon sx={{ fontSize: 14 }} /></IconButton>
                                                    <IconButton size="small" color="error"
                                                        onClick={() => handleDeleteSchedule(s.id)}><DeleteIcon sx={{ fontSize: 14 }} /></IconButton>
                                                </Stack>
                                            )}
                                        </Box>
                                    ))}
                                </Stack>
                                {addingSchedule ? (
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <TextField size="small" label="시간" value={scheduleForm.time}
                                            onChange={e => setScheduleForm(f => ({ ...f, time: e.target.value }))}
                                            sx={{ width: 90 }} placeholder="09:00" />
                                        <TextField size="small" label="내용 *" value={scheduleForm.description}
                                            onChange={e => setScheduleForm(f => ({ ...f, description: e.target.value }))}
                                            fullWidth placeholder="일정 내용을 입력하세요" />
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

                        <Divider><Typography variant="caption" color="text.secondary">관광지 이미지</Typography></Divider>
                        {!activeItineraryId ? (
                            <PendingImageRow icon={<LandscapeIcon fontSize="small" color="action" />}
                                label="관광지 이미지" files={pendingLocationFiles} inputRef={pendingLocationRef}
                                onFileChange={e => { if (e.target.files?.length) addPendingImages(e.target.files, 'LOCATION'); e.target.value = ''; }}
                                onRemove={(tempId) => removePendingImage(tempId, 'LOCATION')} />
                        ) : (
                            <ImageRow icon={<LandscapeIcon fontSize="small" color="action" />}
                                label={`관광지 이미지 (${dialogLocationImgs.length})`} images={dialogLocationImgs}
                                onAdd={() => locationDialogRef.current?.click()}
                                onDelete={(imgId) => handleImageDelete(activeItineraryId, imgId, true)}
                                inputRef={locationDialogRef}
                                onFileChange={e => { if (e.target.files?.length) handleImageUpload(activeItineraryId, e.target.files, 'LOCATION'); e.target.value = ''; }}
                                disabled={imgUploading.location} />
                        )}

                        <Divider><Typography variant="caption" color="text.secondary">숙박 정보 (선택)</Typography></Divider>
                        <TextField label="호텔명" value={form.hotelName} fullWidth
                            onChange={e => setForm(f => ({ ...f, hotelName: e.target.value }))} />
                        {!activeItineraryId ? (
                            <PendingImageRow icon={<HotelIcon fontSize="small" color="action" />}
                                label="호텔 이미지" files={pendingHotelFiles} inputRef={pendingHotelRef}
                                onFileChange={e => { if (e.target.files?.length) addPendingImages(e.target.files, 'HOTEL'); e.target.value = ''; }}
                                onRemove={(tempId) => removePendingImage(tempId, 'HOTEL')} />
                        ) : (
                            <ImageRow icon={<HotelIcon fontSize="small" color="action" />}
                                label={`호텔 이미지 (${dialogHotelImgs.length})`} images={dialogHotelImgs}
                                onAdd={() => hotelDialogRef.current?.click()}
                                onDelete={(imgId) => handleImageDelete(activeItineraryId, imgId, true)}
                                inputRef={hotelDialogRef}
                                onFileChange={e => { if (e.target.files?.length) handleImageUpload(activeItineraryId, e.target.files, 'HOTEL'); e.target.value = ''; }}
                                disabled={imgUploading.hotel} />
                        )}

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

/* ── 저장 전 로컬 프리뷰 ── */
function PendingImageRow({ icon, label, files, inputRef, onFileChange, onRemove, imgSize = 110 }) {
    return (
        <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                    {icon}
                    <Typography variant="body2" fontWeight={600}>{label} ({files.length})</Typography>
                </Stack>
                <Button size="small" startIcon={<PhotoCameraIcon />} onClick={() => inputRef.current?.click()}>사진 선택</Button>
                <input type="file" accept="image/*" multiple hidden ref={inputRef} onChange={onFileChange} />
            </Stack>
            <Stack direction="row" flexWrap="wrap" gap={1}>
                {files.map(f => (
                    <Box key={f.tempId} sx={{ position: 'relative' }}>
                        <Box component="img" src={f.previewUrl}
                            sx={{ width: imgSize, height: Math.round(imgSize * 0.75), objectFit: 'cover', borderRadius: 1, display: 'block' }} />
                        <IconButton size="small" color="error"
                            sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(255,255,255,0.85)', p: '2px' }}
                            onClick={() => onRemove(f.tempId)}>
                            <DeleteIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                    </Box>
                ))}
                {files.length === 0 && <Typography variant="caption" color="text.disabled">선택된 이미지 없음</Typography>}
            </Stack>
        </Box>
    );
}

/* ── 저장 후 서버 이미지 ── */
function ImageRow({ icon, label, images, onAdd, onDelete, inputRef, onFileChange, disabled = false, imgSize = 110 }) {
    return (
        <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                    {icon}
                    <Typography variant="body2" fontWeight={600}>{label}</Typography>
                </Stack>
                <Button size="small" startIcon={<PhotoCameraIcon />} disabled={disabled} onClick={onAdd}>
                    {disabled ? '업로드 중...' : '추가'}
                </Button>
                <input type="file" accept="image/*" multiple hidden ref={inputRef} onChange={onFileChange} />
            </Stack>
            <Stack direction="row" flexWrap="wrap" gap={1}>
                {images.map(img => (
                    <Box key={img.id} sx={{ position: 'relative' }}>
                        <Box component="img" src={`${IMG_BASE}${img.imagePath}`}
                            sx={{ width: imgSize, height: Math.round(imgSize * 0.75), objectFit: 'cover', borderRadius: 1, display: 'block' }} />
                        <IconButton size="small" color="error"
                            sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(255,255,255,0.85)', p: '2px' }}
                            onClick={() => onDelete(img.id)}>
                            <DeleteIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                    </Box>
                ))}
                {images.length === 0 && <Typography variant="caption" color="text.disabled">이미지 없음</Typography>}
            </Stack>
        </Box>
    );
}
