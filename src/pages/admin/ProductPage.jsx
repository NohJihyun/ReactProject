import {
    Box, Paper, Typography, Button, Stack, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, MenuItem, Switch,
    FormControlLabel, Snackbar, Alert, Chip,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import Pagination from '@mui/material/Pagination';
import { useEffect, useState } from 'react';
import * as api from '../../api/productApi';
import { getCategories } from '../../api/categoryApi';

/* 상태 → 한글 + 색상 */
const STATUS_MAP = {
    DRAFT:     { label: '초안',   color: 'default' },
    PUBLISHED: { label: '게시중', color: 'success' },
    HIDDEN:    { label: '숨김',   color: 'warning' },
    ENDED:     { label: '종료',   color: 'error'   },
};

const EMPTY_FORM = {
    categoryId:      '',
    productCode:     '',
    productName:     '',
    productSubname:  '',
    summary:         '',
    description:     '',
    thumbnailUrl:    '',
    status:          'DRAFT',
    isFeatured:      'N',
    isActive:        'Y',
    exposureStartAt: '',
    exposureEndAt:   '',
    seoTitle:        '',
    seoDescription:  '',
};

const EMPTY_SEARCH = {
    categoryId: '',
    status:     '',
    isFeatured: '',
    isActive:   '',
    keyword:    '',
};

/* ISO datetime → datetime-local 입력값 형식 */
const toDatetimeLocal = (val) => (val ? String(val).substring(0, 16) : '');

export default function ProductPage() {
    const [rows,       setRows]       = useState([]);
    const [selected,   setSelected]   = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState(null); // 'create' | 'edit' | 'search'
    const [form,       setForm]       = useState(EMPTY_FORM);
    const [search,     setSearch]     = useState(EMPTY_SEARCH);
    const [pageInfo,   setPageInfo]   = useState({ page: 1, size: 10, totalPages: 0, totalElements: 0 });
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [toast, setToast] = useState({ open: false, msg: '', sev: 'success' });

    /* ── 목록 조회 ── */
    const load = async (searchParam = search, page = 1) => {
        try {
            const cleaned = Object.fromEntries(
                Object.entries(searchParam).filter(([, v]) => v !== '' && v !== null)
            );
            const data = await api.getProducts({ ...cleaned, page, size: pageInfo.size });
            setRows(data.list ?? []);
            setPageInfo({ page: data.page, size: data.size, totalPages: data.totalPage, totalElements: data.totalCount });
        } catch (e) {
            console.error(e);
            setRows([]);
        }
    };

    /* 카테고리 옵션 로드 (폼/검색 공용) */
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

    useEffect(() => {
        load(search, 1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* selected → form 동기화 */
    useEffect(() => {
        if (selected) {
            setForm({
                categoryId:      selected.categoryId      ?? '',
                productCode:     selected.productCode     ?? '',
                productName:     selected.productName     ?? '',
                productSubname:  selected.productSubname  ?? '',
                summary:         selected.summary         ?? '',
                description:     selected.description     ?? '',
                thumbnailUrl:    selected.thumbnailUrl    ?? '',
                status:          selected.status          ?? 'DRAFT',
                isFeatured:      selected.isFeatured      ?? 'N',
                isActive:        selected.isActive        ?? 'Y',
                exposureStartAt: toDatetimeLocal(selected.exposureStartAt),
                exposureEndAt:   toDatetimeLocal(selected.exposureEndAt),
                seoTitle:        selected.seoTitle        ?? '',
                seoDescription:  selected.seoDescription  ?? '',
            });
        }
    }, [selected]);

    /* ── 입력 핸들러 ── */
    const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    const searchChange = (e) => setSearch({ ...search, [e.target.name]: e.target.value });

    /* ── 검증 ── */
    const validateForm = (f) => {
        if (!f.categoryId)                          return '카테고리를 선택해주세요.';
        if (!String(f.productCode ?? '').trim())    return '상품 코드를 입력해주세요.';
        if (!String(f.productName ?? '').trim())    return '상품명을 입력해주세요.';
        if (!f.status)                              return '상태를 선택해주세요.';
        if (f.exposureStartAt && f.exposureEndAt && f.exposureStartAt > f.exposureEndAt)
            return '노출 종료일은 시작일 이후여야 합니다.';
        return null;
    };

    /* ── 저장 ── */
    const handleSave = async () => {
        const msg = validateForm(form);
        if (msg) {
            setToast({ open: true, msg, sev: 'warning' });
            return;
        }

        const editing = !!selected?.productId;
        const payload = {
            ...form,
            categoryId:      Number(form.categoryId) || null,
            exposureStartAt: form.exposureStartAt || null,
            exposureEndAt:   form.exposureEndAt   || null,
        };

        try {
            if (editing) {
                await api.updateProduct(selected.productId, payload);
            } else {
                await api.createProduct(payload);
            }
            setSelected(null);
            setDialogOpen(false);
            await load(search);
            setToast({ open: true, msg: editing ? '상품이 수정되었습니다.' : '상품이 등록되었습니다.', sev: 'success' });
        } catch (error) {
            const status = error?.response?.status;
            const serverMsg = error?.response?.data?.message;
            if (status === 409) {
                setToast({ open: true, msg: serverMsg || '이미 사용 중인 상품 코드입니다.', sev: 'error' });
                return;
            }
            setToast({ open: true, msg: '저장에 실패했습니다.', sev: 'error' });
        }
    };

    /* ── 비활성화 ── */
    const handleDeactivate = async (id) => {
        if (!window.confirm('비활성화 하시겠습니까?')) return;
        try {
            await api.deactivateProduct(id);
            await load(search);
            setToast({ open: true, msg: '비활성화 완료', sev: 'success' });
        } catch {
            setToast({ open: true, msg: '비활성화 실패', sev: 'error' });
        }
    };

    /* ── 물리 삭제 ── */
    const handleDelete = async (id) => {
        if (!window.confirm('정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
        try {
            await api.deleteProduct(id);
            await load(search);
            setToast({ open: true, msg: '삭제되었습니다.', sev: 'success' });
        } catch {
            setToast({ open: true, msg: '삭제에 실패했습니다.', sev: 'error' });
        }
    };

    /* ── 검색 ── */
    const handleSearch = () => {
        load(search, 1);
    };

    const handleResetSearch = () => {
        setSearch(EMPTY_SEARCH);
        load(EMPTY_SEARCH, 1);
    };

    const closeDialog = () => {
        setDialogOpen(false);
        setDialogMode(null);
    };

    /* ── 카테고리 셀렉트 표시 ── */
    const categoryLabel = (c) => c.depth === 1 ? c.categoryName : `└ ${c.categoryName}`;

    /* ────────────────────────────── RENDER ─────────────────────────────── */
    return (
        <div translate="no">
            <Paper sx={{ p: 2 }}>
                {/* 헤더 */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">여행상품 리스트</Typography>
                    <Stack direction="row" spacing={1}>
                        <Button variant="contained" onClick={handleResetSearch}>초기화</Button>
                        <Button variant="contained" onClick={() => { setDialogMode('search'); setDialogOpen(true); }}>검색</Button>
                        <Button variant="contained" onClick={() => {
                            setSelected(null);
                            setForm(EMPTY_FORM);
                            setDialogMode('create');
                            setDialogOpen(true);
                        }}>등록</Button>
                    </Stack>
                </Box>

                {/* 테이블 */}
                <Box sx={{ width: '100%', overflowX: 'auto' }}>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'grey.100' }}>
                                    <TableCell>#</TableCell>
                                    <TableCell>상품코드</TableCell>
                                    <TableCell>상품명</TableCell>
                                    <TableCell>카테고리</TableCell>
                                    <TableCell>상태</TableCell>
                                    <TableCell>추천</TableCell>
                                    <TableCell>활성</TableCell>
                                    <TableCell>등록일</TableCell>
                                    <TableCell align="center">관리</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} align="center" sx={{ color: 'text.secondary', py: 4 }}>
                                            데이터가 없습니다.
                                        </TableCell>
                                    </TableRow>
                                ) : rows.map((row, idx) => {
                                    const statusInfo = STATUS_MAP[row.status] ?? { label: row.status, color: 'default' };
                                    return (
                                        <TableRow key={row.productId} hover>
                                            <TableCell>{(pageInfo.page - 1) * pageInfo.size + idx + 1}</TableCell>
                                            <TableCell>{row.productCode}</TableCell>
                                            <TableCell>
                                                <Box>
                                                    <Typography variant="body2" fontWeight={500}>{row.productName}</Typography>
                                                    {row.productSubname && (
                                                        <Typography variant="caption" color="text.secondary">{row.productSubname}</Typography>
                                                    )}
                                                </Box>
                                            </TableCell>
                                            <TableCell>{row.categoryName ?? '-'}</TableCell>
                                            <TableCell>
                                                <Chip label={statusInfo.label} color={statusInfo.color} size="small" />
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={row.isFeatured === 'Y' ? '추천' : '-'} color={row.isFeatured === 'Y' ? 'primary' : 'default'} size="small" />
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={row.isActive === 'Y' ? '활성' : '비활성'} color={row.isActive === 'Y' ? 'success' : 'default'} size="small" />
                                            </TableCell>
                                            <TableCell>{row.createdAt ?? '-'}</TableCell>
                                            <TableCell align="center">
                                                <Stack direction="row" spacing={0.5} justifyContent="center">
                                                    <Button size="small" variant="outlined" onClick={() => {
                                                        setSelected(row);
                                                        setDialogMode('edit');
                                                        setDialogOpen(true);
                                                    }}>수정</Button>
                                                    <Button size="small" variant="outlined" color="warning"
                                                        onClick={() => handleDeactivate(row.productId)}
                                                        disabled={row.isActive === 'N'}
                                                    >비활성화</Button>
                                                    <Button size="small" variant="outlined" color="error"
                                                        onClick={() => handleDelete(row.productId)}
                                                    >삭제</Button>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* 페이지네이션 */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Pagination
                            count={pageInfo.totalPages}
                            page={pageInfo.page}
                            onChange={(e, value) => load(search, value)}
                            color="primary"
                            showFirstButton
                            showLastButton
                        />
                    </Box>
                </Box>
            </Paper>

            {/* ─────────────── DIALOG ─────────────── */}
            <Dialog
                translate="no"
                key={dialogMode}
                open={dialogOpen}
                onClose={closeDialog}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    {dialogMode === 'create' ? '상품 등록' : dialogMode === 'edit' ? '상품 수정' : '상품 검색'}
                </DialogTitle>

                <DialogContent dividers>
                    {dialogOpen && (
                        <>
                            {/* 등록 / 수정 */}
                            {(dialogMode === 'create' || dialogMode === 'edit') && (
                                <Stack spacing={2} mt={0.5}>
                                    <TextField
                                        select
                                        name="categoryId"
                                        label="카테고리 *"
                                        value={form.categoryId}
                                        onChange={change}
                                        fullWidth
                                    >
                                        {categoryOptions.map(c => (
                                            <MenuItem key={c.categoryId} value={c.categoryId}>
                                                {categoryLabel(c)}
                                            </MenuItem>
                                        ))}
                                    </TextField>

                                    <TextField
                                        name="productCode"
                                        label="상품 코드 *"
                                        value={form.productCode}
                                        onChange={change}
                                        fullWidth
                                        disabled={dialogMode === 'edit'}
                                        inputProps={{ maxLength: 50 }}
                                    />

                                    <TextField
                                        name="productName"
                                        label="상품명 *"
                                        value={form.productName}
                                        onChange={change}
                                        fullWidth
                                        inputProps={{ maxLength: 200 }}
                                    />

                                    <TextField
                                        name="productSubname"
                                        label="부제목"
                                        value={form.productSubname}
                                        onChange={change}
                                        fullWidth
                                        inputProps={{ maxLength: 200 }}
                                    />

                                    <TextField
                                        name="summary"
                                        label="요약"
                                        value={form.summary}
                                        onChange={change}
                                        fullWidth
                                        inputProps={{ maxLength: 500 }}
                                    />

                                    <TextField
                                        name="description"
                                        label="상세 설명"
                                        value={form.description}
                                        onChange={change}
                                        fullWidth
                                        multiline
                                        rows={4}
                                    />

                                    <TextField
                                        name="thumbnailUrl"
                                        label="썸네일 URL"
                                        value={form.thumbnailUrl}
                                        onChange={change}
                                        fullWidth
                                        inputProps={{ maxLength: 500 }}
                                    />

                                    <TextField
                                        select
                                        name="status"
                                        label="상태 *"
                                        value={form.status}
                                        onChange={change}
                                        fullWidth
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

                                    <TextField
                                        name="exposureStartAt"
                                        label="노출 시작일"
                                        type="datetime-local"
                                        value={form.exposureStartAt}
                                        onChange={change}
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                    />

                                    <TextField
                                        name="exposureEndAt"
                                        label="노출 종료일"
                                        type="datetime-local"
                                        value={form.exposureEndAt}
                                        onChange={change}
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                    />

                                    <TextField
                                        name="seoTitle"
                                        label="SEO 제목"
                                        value={form.seoTitle}
                                        onChange={change}
                                        fullWidth
                                        inputProps={{ maxLength: 200 }}
                                    />

                                    <TextField
                                        name="seoDescription"
                                        label="SEO 설명"
                                        value={form.seoDescription}
                                        onChange={change}
                                        fullWidth
                                        inputProps={{ maxLength: 500 }}
                                    />
                                </Stack>
                            )}

                            {/* 검색 */}
                            {dialogMode === 'search' && (
                                <Stack spacing={2} mt={0.5}>
                                    <TextField
                                        select
                                        name="categoryId"
                                        label="카테고리"
                                        value={search.categoryId}
                                        onChange={searchChange}
                                        fullWidth
                                    >
                                        <MenuItem value="">전체</MenuItem>
                                        {categoryOptions.map(c => (
                                            <MenuItem key={c.categoryId} value={c.categoryId}>
                                                {categoryLabel(c)}
                                            </MenuItem>
                                        ))}
                                    </TextField>

                                    <TextField
                                        select
                                        name="status"
                                        label="상태"
                                        value={search.status}
                                        onChange={searchChange}
                                        fullWidth
                                    >
                                        <MenuItem value="">전체</MenuItem>
                                        <MenuItem value="DRAFT">초안</MenuItem>
                                        <MenuItem value="PUBLISHED">게시중</MenuItem>
                                        <MenuItem value="HIDDEN">숨김</MenuItem>
                                        <MenuItem value="ENDED">종료</MenuItem>
                                    </TextField>

                                    <TextField
                                        select
                                        name="isFeatured"
                                        label="추천 여부"
                                        value={search.isFeatured}
                                        onChange={searchChange}
                                        fullWidth
                                    >
                                        <MenuItem value="">전체</MenuItem>
                                        <MenuItem value="Y">추천</MenuItem>
                                        <MenuItem value="N">일반</MenuItem>
                                    </TextField>

                                    <TextField
                                        select
                                        name="isActive"
                                        label="활성 여부"
                                        value={search.isActive}
                                        onChange={searchChange}
                                        fullWidth
                                    >
                                        <MenuItem value="">전체</MenuItem>
                                        <MenuItem value="Y">활성</MenuItem>
                                        <MenuItem value="N">비활성</MenuItem>
                                    </TextField>

                                    <TextField
                                        name="keyword"
                                        label="검색어"
                                        placeholder="상품명 / 상품코드"
                                        value={search.keyword}
                                        onChange={searchChange}
                                        fullWidth
                                    />
                                </Stack>
                            )}
                        </>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button variant="contained" onClick={closeDialog}>취소</Button>

                    {(dialogMode === 'create' || dialogMode === 'edit') && (
                        <Button variant="contained" onClick={handleSave}>저장</Button>
                    )}

                    {dialogMode === 'search' && (
                        <>
                            <Button variant="contained" onClick={() => setSearch(EMPTY_SEARCH)}>초기화</Button>
                            <Button variant="contained" onClick={() => { handleSearch(); closeDialog(); }}>검색</Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>

            {/* Toast */}
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
