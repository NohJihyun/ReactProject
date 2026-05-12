import React, { useEffect, useState, useRef } from 'react';
import {
    Box, Button, Typography, Stack, IconButton, Chip,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Divider, Alert, CircularProgress, Snackbar,
    Tabs, Tab, MenuItem,
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
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import * as api from '../../../api/schoolTripApi';

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

const EMPTY_DETAIL = {
    transportInfo: '',
    priceAdult: '', priceChild: '', priceInfant: '',
    ageAdult: '', ageChild: '', ageInfant: '',
    includedItems: '', excludedItems: '',
    guideName: '', guidePhone: '', meetingLocation: '', meetingTime: '', notes: '',
    insuranceInfo: '', emergencyContact: '', otherNotices: '',
    surchargeInfo: '', terms: '', reservationNotes: '',
};

export default function SchoolTripItineraryTab({ productId, onComplete }) {
    const [activeTab, setActiveTab] = useState(0);

    const [detail,       setDetail]       = useState(EMPTY_DETAIL);
    const [detailLoad,   setDetailLoad]   = useState(true);
    const [detailSaving, setDetailSaving] = useState(false);

    const [snack,       setSnack]       = useState({ open: false, msg: '', severity: 'success' });
    const [pricesSaved, setPricesSaved] = useState(false);
    const showSnack = (msg, severity = 'success') => setSnack({ open: true, msg, severity });

    useEffect(() => { loadDetail(); }, [productId]);

    const loadDetail = async () => {
        setDetailLoad(true);
        try {
            const data = await api.getSchoolTripDetail(productId);
            setDetail(data ? { ...EMPTY_DETAIL, ...data } : EMPTY_DETAIL);
        } finally { setDetailLoad(false); }
    };

    const handleSaveDetail = async () => {
        setDetailSaving(true);
        try {
            const saved = await api.saveSchoolTripDetail(productId, detail);
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

    return (
        <Box>
            {pricesSaved && (
                <Alert severity="success" onClose={() => setPricesSaved(false)} sx={{ mb: 2 }}>
                    수학여행 일정 정보를 저장하였습니다.&nbsp;
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
                        { key: 'insuranceInfo',    label: '여행자 보험',   rows: 4 },
                        { key: 'emergencyContact', label: '비상 연락처',   rows: 3 },
                        { key: 'otherNotices',     label: '기타 유의사항', rows: 4 },
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
                        <TextField label="가이드 / 인솔자명" value={detail.guideName || ''}
                            onChange={e => setDetail(d => ({ ...d, guideName: e.target.value }))} fullWidth />
                        <TextField label="연락처" value={detail.guidePhone || ''}
                            onChange={e => setDetail(d => ({ ...d, guidePhone: e.target.value }))} fullWidth />
                    </Stack>
                    <TextField label="미팅 장소" value={detail.meetingLocation || ''}
                        onChange={e => setDetail(d => ({ ...d, meetingLocation: e.target.value }))} fullWidth />
                    <TextField label="미팅 시간" value={detail.meetingTime || ''}
                        onChange={e => setDetail(d => ({ ...d, meetingTime: e.target.value }))}
                        fullWidth placeholder="예: 08:00" />
                    <TextField label="안내 사항" value={detail.notes || ''}
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
                detailLoad ? <Loading /> :
                <Stack spacing={3} sx={{ pt: 1 }}>

                    {/* 교통편 안내 (수학여행 전용) */}
                    <Box sx={{ p: 2, bgcolor: 'blue.50', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                            <DirectionsBusIcon fontSize="small" color="primary" />
                            <Typography variant="caption" fontWeight={600} color="text.secondary">
                                교통편 안내
                            </Typography>
                        </Stack>
                        <TextField
                            label="교통편 정보"
                            value={detail.transportInfo || ''}
                            onChange={e => setDetail(d => ({ ...d, transportInfo: e.target.value }))}
                            fullWidth multiline rows={4}
                            placeholder={`예: 전세버스 이용 (45인승 대형버스)\n차량 번호: 123가 4567\n운전기사: 홍길동 / 010-1234-5678`} />
                    </Box>

                    {/* 연령 기준 */}
                    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                            연령 기준
                        </Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField size="small" label="성인" value={detail.ageAdult || ''}
                                onChange={e => setDetail(d => ({ ...d, ageAdult: e.target.value }))}
                                placeholder="예: 인솔 교사" fullWidth />
                            <TextField size="small" label="아동(학생)" value={detail.ageChild || ''}
                                onChange={e => setDetail(d => ({ ...d, ageChild: e.target.value }))}
                                placeholder="예: 초/중/고등학생" fullWidth />
                            <TextField size="small" label="유아" value={detail.ageInfant || ''}
                                onChange={e => setDetail(d => ({ ...d, ageInfant: e.target.value }))}
                                placeholder="해당 없으면 미입력" fullWidth />
                        </Stack>
                    </Box>

                    {/* 단가 */}
                    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                            1인 단가 (원)
                        </Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField size="small" label="성인(교사)" type="number" value={detail.priceAdult || ''}
                                onChange={e => setDetail(d => ({ ...d, priceAdult: e.target.value }))}
                                fullWidth />
                            <TextField size="small" label="아동(학생)" type="number" value={detail.priceChild || ''}
                                onChange={e => setDetail(d => ({ ...d, priceChild: e.target.value }))}
                                fullWidth />
                            <TextField size="small" label="유아" type="number" value={detail.priceInfant || ''}
                                onChange={e => setDetail(d => ({ ...d, priceInfant: e.target.value }))}
                                fullWidth />
                        </Stack>
                    </Box>

                    <TextField label="유류할증료 / 추가비용" value={detail.surchargeInfo || ''}
                        onChange={e => setDetail(d => ({ ...d, surchargeInfo: e.target.value }))}
                        fullWidth multiline rows={4} placeholder="추가 비용 안내" />
                    <TextField label="상품 약관" value={detail.terms || ''}
                        onChange={e => setDetail(d => ({ ...d, terms: e.target.value }))}
                        fullWidth multiline rows={6} />
                    <TextField label="예약시 유의사항" value={detail.reservationNotes || ''}
                        onChange={e => setDetail(d => ({ ...d, reservationNotes: e.target.value }))}
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

function Loading() {
    return <Box sx={{ py: 4, textAlign: 'center' }}><CircularProgress /></Box>;
}

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

    const locationListRefs   = useRef({});
    const hotelListRefs      = useRef({});
    const pendingLocationRef = useRef(null);
    const pendingHotelRef    = useRef(null);
    const locationDialogRef  = useRef(null);
    const hotelDialogRef     = useRef(null);

    useEffect(() => { load(); }, [productId]);

    const load = async () => {
        setLoading(true);
        try { setItineraries(await api.getSchoolTripItineraries(productId)); }
        finally { setLoading(false); }
    };

    const silentLoad = async () => {
        try { setItineraries(await api.getSchoolTripItineraries(productId)); } catch {}
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
        setPendingSchedules(ps => [...ps, { tempId: Date.now(), time: '', ampm: 'AM', description: '' }]);
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
                await api.updateSchoolTripItinerary(productId, editTarget.id, params);
                setSnack({ open: true, msg: '일정이 수정되었습니다.' });
                closeDialog();
                await load();
            } else {
                const created = await api.createSchoolTripItinerary(productId, params);

                const validSchedules = pendingSchedules.filter(s => s.description.trim());
                for (let i = 0; i < validSchedules.length; i++) {
                    const sp = new URLSearchParams();
                    if (validSchedules[i].time) sp.append('time', `${validSchedules[i].time} ${validSchedules[i].ampm}`);
                    sp.append('description', validSchedules[i].description);
                    sp.append('sortOrder', i);
                    await api.addSchoolTripSchedule(productId, created.id, sp);
                }
                for (const pf of pendingLocationFiles) {
                    const fd = new FormData();
                    fd.append('file', pf.file);
                    fd.append('imageType', 'LOCATION');
                    await api.uploadSchoolTripItineraryImage(productId, created.id, fd);
                    URL.revokeObjectURL(pf.previewUrl);
                }
                for (const pf of pendingHotelFiles) {
                    const fd = new FormData();
                    fd.append('file', pf.file);
                    fd.append('imageType', 'HOTEL');
                    await api.uploadSchoolTripItineraryImage(productId, created.id, fd);
                    URL.revokeObjectURL(pf.previewUrl);
                }

                setPendingSchedules([]);
                setPendingLocationFiles([]);
                setPendingHotelFiles([]);
                setSnack({ open: true, msg: '저장되었습니다.' });
                await silentLoad();
                setTimeout(() => {
                    closeDialog();
                    onAfterSave?.();
                }, 1500);
            }
        } catch {
            setToast('저장 중 오류가 발생했습니다.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteItinerary = async (id) => {
        if (!window.confirm('이 일정을 삭제하시겠습니까? 이미지도 함께 삭제됩니다.')) return;
        await api.deleteSchoolTripItinerary(productId, id);
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
            await api.addSchoolTripSchedule(productId, activeItineraryId, params);
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
            await api.updateSchoolTripSchedule(productId, activeItineraryId, scheduleId, params);
            setEditingScheduleId(null);
            await silentLoad();
        } finally { setScheduleSaving(false); }
    };

    const handleDeleteSchedule = async (scheduleId) => {
        if (!window.confirm('이 시간 일정을 삭제하시겠습니까?')) return;
        await api.deleteSchoolTripSchedule(productId, activeItineraryId, scheduleId);
        await silentLoad();
    };

    const handleImageUpload = async (itineraryId, files, imageType) => {
        setImgUploading(u => ({ ...u, [imageType === 'LOCATION' ? 'location' : 'hotel']: true }));
        try {
            for (const file of Array.from(files)) {
                const fd = new FormData();
                fd.append('file', file);
                fd.append('imageType', imageType);
                await api.uploadSchoolTripItineraryImage(productId, itineraryId, fd);
            }
            await silentLoad();
        } finally {
            setImgUploading(u => ({ ...u, [imageType === 'LOCATION' ? 'location' : 'hotel']: false }));
        }
    };

    const handleImageDelete = async (itineraryId, imageId, fromDialog = false) => {
        if (!window.confirm('이미지를 삭제하시겠습니까?')) return;
        await api.deleteSchoolTripItineraryImage(productId, itineraryId, imageId);
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
                                <Typography fontWeight={700} sx={{ fontSize: '1.05rem', mb: 1.5 }}>
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
                                    <Typography variant="body2" fontWeight={600} sx={{ display: 'block', mb: 1 }}>
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
                                placeholder="예: 학교 출발, 현지 도착" />
                        </Stack>

                        <TextField label="일정 설명" value={form.description} fullWidth multiline rows={2}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />

                        <Divider><Typography variant="caption" color="text.secondary">시간대별 일정</Typography></Divider>

                        {!activeItineraryId ? (
                            <Box>
                                <Stack spacing={1} sx={{ mb: 1 }}>
                                    {pendingSchedules.map(s => (
                                        <Stack key={s.tempId} direction="row" spacing={1} alignItems="center">
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
                                                <Stack direction="row" alignItems="center" spacing={1}
                                                    sx={{ px: 1.5, py: 0.75, bgcolor: 'grey.50', borderRadius: 1 }}>
                                                    <Typography variant="caption" fontWeight={700} color="primary.main" sx={{ minWidth: 42 }}>
                                                        {s.time || '–'}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ flex: 1 }}>{s.description}</Typography>
                                                    <IconButton size="small" onClick={() => {
                                                        setEditingScheduleId(s.id);
                                                        const p = parseTime(s.time);
                                                        setEditingScheduleForm({ time: p.time, ampm: p.ampm, description: s.description });
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
