import {
    Box, Paper, Typography, Button, Stack, Tabs, Tab,
    TextField, MenuItem, Switch, FormControlLabel,
    Divider, Snackbar, Alert, CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as api from '../../api/productApi';
import { getCategories } from '../../api/categoryApi';
import ProductImageTab from './tabs/ProductImageTab';
import ProductVideoTab from './tabs/ProductVideoTab';
import ProductFileTab  from './tabs/ProductFileTab';

const EMPTY_FORM = {
    categoryId:      '',
    productCode:     '',
    productName:     '',
    productSubname:  '',
    summary:         '',
    description:     '',
    status:          'DRAFT',
    isFeatured:      'N',
    isActive:        'Y',
    travelType:      'BOTH',
    minPeople:       '',
    maxPeople:       '',
    pricePerPerson:  '',
    exposureStartAt: '',
    exposureEndAt:   '',
    seoTitle:        '',
    seoDescription:  '',
};

const toDatetimeLocal = (val) => (val ? String(val).substring(0, 16) : '');

function SectionTitle({ children }) {
    return (
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 600 }}>
            {children}
        </Typography>
    );
}

function PlaceholderTab({ label }) {
    return (
        <Box sx={{ py: 8, textAlign: 'center', color: 'text.disabled' }}>
            <Typography variant="body1">{label} 기능은 준비 중입니다.</Typography>
            <Typography variant="caption">파일 업로드 API 구현 후 연동 예정</Typography>
        </Box>
    );
}

export default function ProductFormPage() {
    const { id }   = useParams();
    const navigate = useNavigate();
    const isEdit   = !!id;

    const [tab,             setTab]             = useState(0);
    const [form,            setForm]            = useState(EMPTY_FORM);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [loading,         setLoading]         = useState(isEdit);
    const [savedProductId,  setSavedProductId]  = useState(isEdit ? Number(id) : null);
    const [toast,           setToast]           = useState({ open: false, msg: '', sev: 'success' });
    const [mediaSummary,    setMediaSummary]    = useState({ imageCount: 0, hasVideo: false, fileCount: 0 });

    const tabsUnlocked = isEdit || savedProductId !== null;
    const activeProductId = isEdit ? Number(id) : savedProductId;

    /* 미디어 현황 요약 로드 */
    const loadMediaSummary = async (pid) => {
        if (!pid) return;
        try {
            const [images, files, product] = await Promise.all([
                api.getProductImages(pid),
                api.getProductFiles(pid),
                api.getProduct(pid),
            ]);
            setMediaSummary({
                imageCount: images.length,
                hasVideo:   !!product.videoUrl,
                fileCount:  files.length,
            });
        } catch { /* 조용히 무시 */ }
    };

    useEffect(() => {
        if (activeProductId) loadMediaSummary(activeProductId);
    }, [activeProductId]);

    /* 카테고리 목록 */
    useEffect(() => {
        (async () => {
            try {
                const data = await getCategories({ isActive: 'Y', page: 1, size: 1000 });
                setCategoryOptions(data.list ?? []);
            } catch (e) {
                console.error(e);
            }
        })();
    }, []);

    /* 수정 시 기존 데이터 로드 */
    useEffect(() => {
        if (!isEdit) return;
        (async () => {
            try {
                const data = await api.getProduct(id);
                setForm({
                    categoryId:      data.categoryId      ?? '',
                    productCode:     data.productCode     ?? '',
                    productName:     data.productName     ?? '',
                    productSubname:  data.productSubname  ?? '',
                    summary:         data.summary         ?? '',
                    description:     data.description     ?? '',
                    status:          data.status          ?? 'DRAFT',
                    isFeatured:      data.isFeatured      ?? 'N',
                    isActive:        data.isActive        ?? 'Y',
                    travelType:      data.travelType      ?? 'BOTH',
                    minPeople:       data.minPeople       ?? '',
                    maxPeople:       data.maxPeople       ?? '',
                    pricePerPerson:  data.pricePerPerson  ?? '',
                    exposureStartAt: toDatetimeLocal(data.exposureStartAt),
                    exposureEndAt:   toDatetimeLocal(data.exposureEndAt),
                    seoTitle:        data.seoTitle        ?? '',
                    seoDescription:  data.seoDescription  ?? '',
                });
            } catch (e) {
                console.error(e);
                setToast({ open: true, msg: '상품 정보를 불러오지 못했습니다.', sev: 'error' });
            } finally {
                setLoading(false);
            }
        })();
    }, [id, isEdit]);

    const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const validate = (f) => {
        if (!f.categoryId)                       return '카테고리를 선택해주세요.';
        if (!String(f.productCode ?? '').trim()) return '상품 코드를 입력해주세요.';
        if (!String(f.productName ?? '').trim()) return '상품명을 입력해주세요.';
        if (!f.status)                           return '상태를 선택해주세요.';
        if (f.exposureStartAt && f.exposureEndAt && f.exposureStartAt > f.exposureEndAt)
            return '노출 종료일은 시작일 이후여야 합니다.';
        return null;
    };

    const handleSave = async () => {
        const msg = validate(form);
        if (msg) { setToast({ open: true, msg, sev: 'warning' }); return; }

        const nullIfEmpty = (v) => (v === '' || v === undefined) ? null : v;
        const payload = {
            ...form,
            categoryId:      Number(form.categoryId) || null,
            productSubname:  nullIfEmpty(form.productSubname),
            summary:         nullIfEmpty(form.summary),
            description:     nullIfEmpty(form.description),
            travelType:      nullIfEmpty(form.travelType),
            minPeople:       form.minPeople      !== '' ? Number(form.minPeople)      : null,
            maxPeople:       form.maxPeople      !== '' ? Number(form.maxPeople)      : null,
            pricePerPerson:  form.pricePerPerson !== '' ? Number(form.pricePerPerson) : null,
            exposureStartAt: nullIfEmpty(form.exposureStartAt),
            exposureEndAt:   nullIfEmpty(form.exposureEndAt),
            seoTitle:        nullIfEmpty(form.seoTitle),
            seoDescription:  nullIfEmpty(form.seoDescription),
        };

        try {
            if (isEdit || savedProductId) {
                // 수정 (URL로 진입한 수정 or 등록 후 기본정보 재수정)
                const updateId = isEdit ? id : savedProductId;
                await api.updateProduct(updateId, payload);
                setToast({ open: true, msg: '저장되었습니다.', sev: 'success' });
                if (isEdit) setTimeout(() => navigate('/admin/products'), 1500);
            } else {
                // 최초 등록
                const result = await api.createProduct(payload);
                setSavedProductId(result.productId);
                setToast({ open: true, msg: '저장되었습니다. 이미지·첨부파일을 이어서 등록하세요.', sev: 'success' });
                setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 800);
            }
        } catch (error) {
            const status    = error?.response?.status;
            const serverMsg = error?.response?.data?.message;
            if (status === 409) {
                setToast({ open: true, msg: serverMsg || '이미 사용 중인 상품 코드입니다.', sev: 'error' });
                return;
            }
            setToast({ open: true, msg: '저장에 실패했습니다.', sev: 'error' });
        }
    };

    const categoryLabel = (c) => c.depth === 1 ? c.categoryName : `└ ${c.categoryName}`;

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <div translate="no">
            <Paper sx={{ p: 2 }}>
                {/* 헤더 */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Button
                            startIcon={<ArrowBackIcon />}
                            onClick={() => navigate('/admin/products')}
                        >
                            목록으로
                        </Button>
                        <Typography variant="h6">
                            {isEdit ? '여행상품 수정' : '여행상품 등록'}
                        </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                        {tab === 0 && (
                            <Button variant="contained" onClick={handleSave}>저장</Button>
                        )}
                        {tabsUnlocked && (
                            <Button
                                variant="contained"
                                color="success"
                                onClick={() => navigate('/admin/products')}
                            >
                                {isEdit ? '수정 완료' : '등록 완료'}
                            </Button>
                        )}
                    </Stack>
                </Box>

                {/* 탭 */}
                <Tabs
                    value={tab}
                    onChange={(_, v) => {
                        setTab(v);
                        if (activeProductId) loadMediaSummary(activeProductId);
                    }}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
                >
                    <Tab label="기본정보" />
                    <Tab
                        disabled={!tabsUnlocked}
                        label={
                            tabsUnlocked
                                ? `이미지 ${mediaSummary.imageCount > 0 ? `(${mediaSummary.imageCount})` : '-'}`
                                : '이미지'
                        }
                    />
                    <Tab
                        disabled={!tabsUnlocked}
                        label={
                            tabsUnlocked
                                ? `유튜브 동영상 ${mediaSummary.hasVideo ? '✓' : '-'}`
                                : '유튜브 동영상'
                        }
                    />
                    <Tab
                        disabled={!tabsUnlocked}
                        label={
                            tabsUnlocked
                                ? `첨부파일 ${mediaSummary.fileCount > 0 ? `(${mediaSummary.fileCount})` : '-'}`
                                : '첨부파일'
                        }
                    />
                </Tabs>

                {/* 신규 등록 시 탭 안내 문구 */}
                {!isEdit && !tabsUnlocked && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        기본정보를 저장하면 이미지·유튜브 동영상·첨부파일 탭이 활성화됩니다. 동영상은 유튜브 URL로 등록합니다.
                    </Alert>
                )}

                {/* ── 기본정보 탭 ── */}
                {tab === 0 && (
                    <Stack spacing={3} sx={{ maxWidth: 720 }}>

                        {/* 상품 기본 정보 */}
                        <Box>
                            <SectionTitle>상품 기본 정보</SectionTitle>
                            <Stack spacing={2}>
                                <TextField
                                    select name="categoryId" label="카테고리 *"
                                    value={form.categoryId} onChange={change} fullWidth
                                >
                                    {categoryOptions.map(c => (
                                        <MenuItem key={c.categoryId} value={c.categoryId}>
                                            {categoryLabel(c)}
                                        </MenuItem>
                                    ))}
                                </TextField>
                                <TextField
                                    name="productCode" label="상품 코드 *"
                                    value={form.productCode} onChange={change}
                                    fullWidth disabled={isEdit}
                                    inputProps={{ maxLength: 50 }}
                                    placeholder="예) TOUR-2024-001"
                                    helperText={isEdit ? '상품 코드는 수정할 수 없습니다.' : '영문/숫자/하이픈 조합 권장'}
                                />
                                <TextField
                                    name="productName" label="상품명 *"
                                    value={form.productName} onChange={change}
                                    fullWidth inputProps={{ maxLength: 200 }}
                                    placeholder="예) 경주 수학여행 3박 4일"
                                />
                                <TextField
                                    name="productSubname" label="부제목"
                                    value={form.productSubname} onChange={change}
                                    fullWidth inputProps={{ maxLength: 200 }}
                                    placeholder="예) 역사와 문화를 담은 특별한 여행 (선택)"
                                />
                            </Stack>
                        </Box>

                        <Divider />

                        {/* 상품 내용 */}
                        <Box>
                            <SectionTitle>상품 내용</SectionTitle>
                            <Stack spacing={2}>
                                <TextField
                                    name="summary" label="요약"
                                    value={form.summary} onChange={change}
                                    fullWidth multiline rows={2}
                                    inputProps={{ maxLength: 500 }}
                                    placeholder="상품 목록에 표시되는 짧은 소개글 (선택, 500자 이내)"
                                />
                                <TextField
                                    name="description" label="상세 설명"
                                    value={form.description} onChange={change}
                                    fullWidth multiline rows={8}
                                    placeholder="상품의 상세 내용, 일정, 포함/불포함 사항 등을 입력하세요. (선택)"
                                />
                            </Stack>
                        </Box>

                        <Divider />

                        {/* 여행 옵션 */}
                        <Box>
                            <SectionTitle>여행 옵션</SectionTitle>
                            <Stack spacing={2}>
                                <TextField
                                    select name="travelType" label="여행 유형"
                                    value={form.travelType} onChange={change} fullWidth
                                >
                                    <MenuItem value="BOTH">모두 (개인/단체)</MenuItem>
                                    <MenuItem value="INDIVIDUAL">개인/가족</MenuItem>
                                    <MenuItem value="GROUP">단체</MenuItem>
                                </TextField>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                    <TextField
                                        name="minPeople" label="최소 인원"
                                        value={form.minPeople} onChange={change}
                                        type="number" fullWidth
                                        inputProps={{ min: 1 }}
                                        placeholder="예) 10"
                                        helperText="선택"
                                    />
                                    <TextField
                                        name="maxPeople" label="최대 인원"
                                        value={form.maxPeople} onChange={change}
                                        type="number" fullWidth
                                        inputProps={{ min: 1 }}
                                        placeholder="예) 50"
                                        helperText="선택"
                                    />
                                    <TextField
                                        name="pricePerPerson" label="1인 참고가격 (원)"
                                        value={form.pricePerPerson} onChange={change}
                                        type="number" fullWidth
                                        inputProps={{ min: 0 }}
                                        placeholder="예) 150000"
                                        helperText="선택 · 정확한 견적은 상담 제공"
                                    />
                                </Stack>
                            </Stack>
                        </Box>

                        <Divider />

                        {/* 노출 설정 */}
                        <Box>
                            <SectionTitle>노출 설정</SectionTitle>
                            <Stack spacing={2}>
                                <TextField
                                    select name="status" label="상태 *"
                                    value={form.status} onChange={change} fullWidth
                                >
                                    <MenuItem value="DRAFT">초안</MenuItem>
                                    <MenuItem value="PUBLISHED">게시중</MenuItem>
                                    <MenuItem value="HIDDEN">숨김</MenuItem>
                                    <MenuItem value="ENDED">종료</MenuItem>
                                </TextField>
                                <Stack direction="row" spacing={3}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={form.isFeatured === 'Y'}
                                                onChange={(e) => setForm({ ...form, isFeatured: e.target.checked ? 'Y' : 'N' })}
                                            />
                                        }
                                        label="추천 상품"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={form.isActive === 'Y'}
                                                onChange={(e) => setForm({ ...form, isActive: e.target.checked ? 'Y' : 'N' })}
                                            />
                                        }
                                        label="활성 여부"
                                    />
                                </Stack>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                    <TextField
                                        name="exposureStartAt" label="노출 시작일"
                                        type="datetime-local" value={form.exposureStartAt}
                                        onChange={change} fullWidth
                                        InputLabelProps={{ shrink: true }}
                                    />
                                    <TextField
                                        name="exposureEndAt" label="노출 종료일"
                                        type="datetime-local" value={form.exposureEndAt}
                                        onChange={change} fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        helperText="비워두면 상시운영"
                                    />
                                </Stack>
                            </Stack>
                        </Box>

                        <Divider />

                        {/* SEO 설정 */}
                        <Box>
                            <SectionTitle>SEO 설정</SectionTitle>
                            <Stack spacing={2}>
                                <TextField
                                    name="seoTitle" label="SEO 제목"
                                    value={form.seoTitle} onChange={change}
                                    fullWidth inputProps={{ maxLength: 200 }}
                                    placeholder="예) 경주 수학여행 3박 4일 - 로이투어 (선택)"
                                    helperText="검색 결과에 표시되는 제목, 비우면 상품명으로 대체"
                                />
                                <TextField
                                    name="seoDescription" label="SEO 설명"
                                    value={form.seoDescription} onChange={change}
                                    fullWidth multiline rows={2}
                                    inputProps={{ maxLength: 500 }}
                                    placeholder="검색 결과에 표시되는 설명을 입력하세요. 150자 이내 권장 (선택)"
                                />
                            </Stack>
                        </Box>

                        {/* 하단 저장 버튼 */}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
                            <Stack direction="row" spacing={1}>
                                <Button variant="outlined" onClick={() => navigate('/admin/products')}>목록으로</Button>
                                <Button variant="contained" size="large" onClick={handleSave}>저장</Button>
                            </Stack>
                        </Box>
                    </Stack>
                )}

                {/* ── 이미지 탭 ── */}
                {tab === 1 && (
                    <ProductImageTab
                        productId={activeProductId}
                        onUpdate={() => loadMediaSummary(activeProductId)}
                    />
                )}

                {/* ── 유튜브 동영상 탭 ── */}
                {tab === 2 && (
                    <ProductVideoTab
                        productId={activeProductId}
                        onUpdate={() => loadMediaSummary(activeProductId)}
                    />
                )}

                {/* ── 첨부파일 탭 ── */}
                {tab === 3 && (
                    <ProductFileTab
                        productId={activeProductId}
                        onUpdate={() => loadMediaSummary(activeProductId)}
                    />
                )}
            </Paper>

            <Snackbar
                open={toast.open}
                autoHideDuration={2500}
                onClose={() => setToast(s => ({ ...s, open: false }))}
            >
                <Alert severity={toast.sev} variant="filled">{toast.msg}</Alert>
            </Snackbar>
        </div>
    );
}
