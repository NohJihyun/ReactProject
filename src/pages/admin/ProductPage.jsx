import {
    Box, Paper, Typography, Button, Stack, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, MenuItem,
    Snackbar, Alert, Chip, Tooltip
} from '@mui/material';
import ImageIcon      from '@mui/icons-material/Image';
import VideocamIcon   from '@mui/icons-material/Videocam';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import Pagination from '@mui/material/Pagination';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../../api/productApi';
import { getCategories } from '../../api/categoryApi';

const STATUS_MAP = {
    DRAFT:     { label: '초안',   color: 'default' },
    PUBLISHED: { label: '게시중', color: 'success' },
    HIDDEN:    { label: '숨김',   color: 'warning' },
    ENDED:     { label: '종료',   color: 'error'   },
};

const EMPTY_SEARCH = {
    categoryId: '',
    status:     '',
    isFeatured: '',
    isActive:   '',
    keyword:    '',
};

export default function ProductPage() {
    const navigate = useNavigate();

    const [rows,       setRows]       = useState([]);
    const [searchOpen, setSearchOpen] = useState(false);
    const [search,     setSearch]     = useState(EMPTY_SEARCH);
    const [pageInfo,   setPageInfo]   = useState({ page: 1, size: 10, totalPages: 0, totalElements: 0 });
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [toast, setToast] = useState({ open: false, msg: '', sev: 'success' });

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

    const searchChange = (e) => setSearch({ ...search, [e.target.name]: e.target.value });

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

    const handleResetSearch = () => {
        setSearch(EMPTY_SEARCH);
        load(EMPTY_SEARCH, 1);
    };

    const categoryLabel = (c) => c.depth === 1 ? c.categoryName : `└ ${c.categoryName}`;

    return (
        <div translate="no">
            <Paper sx={{ p: 2 }}>
                {/* 헤더 */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="h6">여행상품 리스트</Typography>
                    <Stack direction="row" spacing={1}>
                        <Button variant="contained" size="small" onClick={handleResetSearch}>초기화</Button>
                        <Button variant="contained" size="small" onClick={() => setSearchOpen(true)}>검색</Button>
                        <Button variant="contained" size="small" onClick={() => navigate('/admin/products/new')}>등록</Button>
                    </Stack>
                </Box>

                {/* 테이블 */}
                <Box sx={{ width: '100%', overflowX: 'auto' }}>
                    <table
                        style={{ width: '100%', borderCollapse: 'collapse', boxSizing: 'border-box' }}
                        border="1"
                        cellPadding="8"
                    >
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'center' }}>#</th>
                                <th style={{ textAlign: 'center', width: 36 }}>교통</th>
                                <th style={{ textAlign: 'center', width: 70 }}>썸네일</th>
                                <th style={{ textAlign: 'left' }}>상품코드</th>
                                <th style={{ textAlign: 'left' }}>상품명</th>
                                <th style={{ textAlign: 'center' }}>카테고리</th>
                                <th style={{ textAlign: 'center' }}>미디어</th>
                                <th style={{ textAlign: 'center' }}>상태</th>
                                <th style={{ textAlign: 'center' }}>추천</th>
                                <th style={{ textAlign: 'center' }}>활성</th>
                                <th style={{ textAlign: 'center' }}>등록일</th>
                                <th style={{ textAlign: 'center', width: '220px' }}>관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length === 0 ? (
                                <tr>
                                    <td colSpan={12} style={{ textAlign: 'center', padding: '32px', color: '#888' }}>
                                        데이터가 없습니다.
                                    </td>
                                </tr>
                            ) : rows.map((row, idx) => {
                                const statusInfo = STATUS_MAP[row.status] ?? { label: row.status, color: 'default' };
                                const hasVideo = !!(row.videoPath || row.videoUrl);
                                const TRANSPORT_EMOJI = {
                                    CRUISE:           '🚢',
                                    INTERNATIONAL_AIR: '✈️',
                                    DOMESTIC_AIR:     '🛫',
                                    BUS:              '🚌',
                                };
                                return (
                                    <tr key={row.productId}>
                                        <td style={{ textAlign: 'center' }}>{(pageInfo.page - 1) * pageInfo.size + idx + 1}</td>

                                        {/* 교통수단 이모지 */}
                                        <td style={{ textAlign: 'center', fontSize: '1.3rem', lineHeight: 1 }}>
                                            {TRANSPORT_EMOJI[row.transportType] ?? ''}
                                        </td>

                                        {/* 썸네일 */}
                                        <td style={{ textAlign: 'center', padding: '4px' }}>
                                            {row.thumbnailPath ? (
                                                <img
                                                    src={`http://localhost:8080${row.thumbnailPath}`}
                                                    alt="썸네일"
                                                    style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4, border: '1px solid #ddd', display: 'block', margin: '0 auto' }}
                                                />
                                            ) : (
                                                <Box sx={{
                                                    width: 60, height: 60, borderRadius: 1,
                                                    border: '1px dashed #ccc', bgcolor: '#f5f5f5',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    margin: '0 auto'
                                                }}>
                                                    <ImageIcon sx={{ color: '#ccc', fontSize: 22 }} />
                                                </Box>
                                            )}
                                        </td>

                                        <td>{row.productCode}</td>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>{row.productName}</div>
                                            {row.productSubname && (
                                                <div style={{ fontSize: '0.75rem', color: '#888' }}>{row.productSubname}</div>
                                            )}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>{row.categoryName ?? '-'}</td>

                                        {/* 미디어 현황 */}
                                        <td style={{ textAlign: 'center' }}>
                                            <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
                                                <Tooltip title={`이미지 ${row.imageCount}장`}>
                                                    <Chip
                                                        icon={<ImageIcon />}
                                                        label={row.imageCount}
                                                        size="small"
                                                        color={row.imageCount > 0 ? 'primary' : 'default'}
                                                        variant={row.imageCount > 0 ? 'filled' : 'outlined'}
                                                    />
                                                </Tooltip>
                                                <Tooltip title={hasVideo ? '동영상 있음' : '동영상 없음'}>
                                                    <Chip
                                                        icon={<VideocamIcon />}
                                                        label={hasVideo ? '✓' : '-'}
                                                        size="small"
                                                        color={hasVideo ? 'secondary' : 'default'}
                                                        variant={hasVideo ? 'filled' : 'outlined'}
                                                    />
                                                </Tooltip>
                                                <Tooltip title={`첨부파일 ${row.fileCount}개`}>
                                                    <Chip
                                                        icon={<AttachFileIcon />}
                                                        label={row.fileCount}
                                                        size="small"
                                                        color={row.fileCount > 0 ? 'warning' : 'default'}
                                                        variant={row.fileCount > 0 ? 'filled' : 'outlined'}
                                                    />
                                                </Tooltip>
                                            </Stack>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <Chip label={statusInfo.label} color={statusInfo.color} size="small" />
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <Chip label={row.isFeatured === 'Y' ? '추천' : '-'} color={row.isFeatured === 'Y' ? 'primary' : 'default'} size="small" />
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <Chip label={row.isActive === 'Y' ? '활성' : '비활성'} color={row.isActive === 'Y' ? 'success' : 'default'} size="small" />
                                        </td>
                                        <td style={{ textAlign: 'center' }}>{row.createdAt ?? '-'}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <Stack direction="row" spacing={1} justifyContent="center">
                                                <Button size="small" variant="contained"
                                                    onClick={() => navigate(`/admin/products/${row.productId}`)}
                                                >수정</Button>
                                                <Button size="small" variant="contained"
                                                    onClick={() => handleDeactivate(row.productId)}
                                                    disabled={row.isActive === 'N'}
                                                >비활성화</Button>
                                                <Button size="small" variant="contained"
                                                    onClick={() => handleDelete(row.productId)}
                                                >삭제</Button>
                                            </Stack>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

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

            {/* 검색 다이얼로그 */}
            <Dialog translate="no" open={searchOpen} onClose={() => setSearchOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>상품 검색</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2} mt={0.5}>
                        <TextField
                            select name="categoryId" label="카테고리"
                            value={search.categoryId} onChange={searchChange} fullWidth
                        >
                            <MenuItem value="">전체</MenuItem>
                            {categoryOptions.map(c => (
                                <MenuItem key={c.categoryId} value={c.categoryId}>{categoryLabel(c)}</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            select name="status" label="상태"
                            value={search.status} onChange={searchChange} fullWidth
                        >
                            <MenuItem value="">전체</MenuItem>
                            <MenuItem value="DRAFT">초안</MenuItem>
                            <MenuItem value="PUBLISHED">게시중</MenuItem>
                            <MenuItem value="HIDDEN">숨김</MenuItem>
                            <MenuItem value="ENDED">종료</MenuItem>
                        </TextField>
                        <TextField
                            select name="isFeatured" label="추천 여부"
                            value={search.isFeatured} onChange={searchChange} fullWidth
                        >
                            <MenuItem value="">전체</MenuItem>
                            <MenuItem value="Y">추천</MenuItem>
                            <MenuItem value="N">일반</MenuItem>
                        </TextField>
                        <TextField
                            select name="isActive" label="활성 여부"
                            value={search.isActive} onChange={searchChange} fullWidth
                        >
                            <MenuItem value="">전체</MenuItem>
                            <MenuItem value="Y">활성</MenuItem>
                            <MenuItem value="N">비활성</MenuItem>
                        </TextField>
                        <TextField
                            name="keyword" label="검색어" placeholder="상품명 / 상품코드"
                            value={search.keyword} onChange={searchChange} fullWidth
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={() => setSearchOpen(false)}>취소</Button>
                    <Button variant="contained" onClick={() => setSearch(EMPTY_SEARCH)}>초기화</Button>
                    <Button variant="contained" onClick={() => { load(search, 1); setSearchOpen(false); }}>검색</Button>
                </DialogActions>
            </Dialog>

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
