import {
    Box, Paper, Typography, TextField, Table, TableHead, TableRow,
    TableCell, TableBody, Chip, Button, CircularProgress,
    Alert, Snackbar, Dialog, DialogTitle, DialogContent, DialogActions,
    FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel,
    Stack, Divider
} from '@mui/material';
import { useEffect, useState, useCallback } from 'react';
import { getAdminUsers, changeUserRole, updateAdminUser, deleteAdminUser } from '../../api/adminUserApi';
import CommonPagination from '../../components/CommonPagination';
import { useAuth } from '../../auth/AuthProvider';

const SUPER_ADMINS = ['admin@rohitour.com', 'admin@test.com'];

const PROVIDER_LABEL = { LOCAL: '일반', KAKAO: '카카오', NAVER: '네이버', GOOGLE: '구글' };
const PROVIDER_COLOR = { LOCAL: 'default', KAKAO: 'warning', NAVER: 'success', GOOGLE: 'error' };

const EMPTY_FORM = {
    name: '', loginId: '', email: '', phone: '', birth: '', role: 'USER', isActive: true,
};

export default function AdminUsersPage() {
    const { user } = useAuth();
    const isSuperAdmin = user?.loginId && SUPER_ADMINS.includes(user.loginId);
    const [users, setUsers] = useState([]);
    const [totalPage, setTotalPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [keyword, setKeyword] = useState('');
    const [inputKeyword, setInputKeyword] = useState('');
    const [loading, setLoading] = useState(false);
    const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

    const [editOpen, setEditOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [editForm, setEditForm] = useState(EMPTY_FORM);
    const [editSaving, setEditSaving] = useState(false);

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteDeleting, setDeleteDeleting] = useState(false);

    const fetchUsers = useCallback(async (kw, pg) => {
        setLoading(true);
        try {
            const data = await getAdminUsers(kw, pg - 1, 10);
            setUsers(data.list);
            setTotalPage(data.totalPage);
            setTotalCount(data.totalCount);
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchUsers(keyword, page); }, [keyword, page, fetchUsers]);

    const handleSearch = (e) => {
        e.preventDefault();
        setKeyword(inputKeyword.trim());
        setPage(1);
    };

    const handleRoleToggle = async (u) => {
        const newRole = u.role === 'ADMIN' ? 'USER' : 'ADMIN';
        const label = newRole === 'ADMIN' ? '관리자' : '일반 사용자';
        if (!window.confirm(`${u.name}(${u.loginId}) 님의 권한을 ${label}(으)로 변경하시겠습니까?`)) return;
        try {
            await changeUserRole(u.userId, newRole);
            setSnack({ open: true, msg: `권한이 ${label}(으)로 변경되었습니다.`, severity: 'success' });
            fetchUsers(keyword, page);
        } catch {
            setSnack({ open: true, msg: '권한 변경에 실패했습니다.', severity: 'error' });
        }
    };

    const openEdit = (u) => {
        setEditTarget(u);
        setEditForm({
            name:     u.name     ?? '',
            loginId:  u.loginId  ?? '',
            email:    u.email    ?? '',
            phone:    u.phone    ?? '',
            birth:    u.birth    ?? '',
            role:     u.role     ?? 'USER',
            isActive: u.isActive ?? true,
        });
        setEditOpen(true);
    };

    const handleEditSave = async () => {
        setEditSaving(true);
        try {
            await updateAdminUser(editTarget.userId, {
                name:     editForm.name     || null,
                loginId:  editForm.loginId  || null,
                email:    editForm.email    || null,
                phone:    editForm.phone    || null,
                birth:    editForm.birth    || null,
                role:     editForm.role     || null,
                isActive: editForm.isActive,
            });
            setSnack({ open: true, msg: '회원 정보가 수정되었습니다.', severity: 'success' });
            setEditOpen(false);
            fetchUsers(keyword, page);
        } catch (e) {
            const msg = e?.response?.data?.message || '수정에 실패했습니다.';
            setSnack({ open: true, msg, severity: 'error' });
        } finally {
            setEditSaving(false);
        }
    };

    const handleDelete = async () => {
        setDeleteDeleting(true);
        try {
            await deleteAdminUser(deleteTarget.userId);
            setSnack({ open: true, msg: `${deleteTarget.name} 회원이 삭제되었습니다.`, severity: 'success' });
            setDeleteTarget(null);
            fetchUsers(keyword, page);
        } catch (e) {
            const msg = e?.response?.data?.message || '삭제에 실패했습니다.';
            setSnack({ open: true, msg, severity: 'error' });
            setDeleteTarget(null);
        } finally {
            setDeleteDeleting(false);
        }
    };

    const colSpan = isSuperAdmin ? 6 : 5;

    return (
        <Box>
            <Typography variant="h5" fontWeight={700} mb={3}>권한 관리</Typography>

            <Paper variant="outlined" sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">전체 {totalCount}명</Typography>
                    <Alert severity="info" sx={{ py: 0.3, flex: 1 }}>
                        역할 변경 버튼을 클릭하면 권한이 즉시 변경됩니다.
                    </Alert>
                </Box>

                <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1, mb: 2 }}>
                    <TextField
                        size="small"
                        placeholder="이름 또는 아이디 검색"
                        value={inputKeyword}
                        onChange={e => setInputKeyword(e.target.value)}
                        sx={{ width: { xs: '100%', sm: 280 } }}
                    />
                    <Button type="submit" variant="contained" size="small">검색</Button>
                    <Button
                        type="button"
                        variant="contained"
                        size="small"
                        onClick={() => { setInputKeyword(''); setKeyword(''); setPage(1); }}
                    >
                        초기화
                    </Button>
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress size={32} />
                    </Box>
                ) : (
                    <>
                        <Box sx={{ overflowX: 'auto' }}>
                            <Table size="small" sx={{ minWidth: isSuperAdmin ? 720 : 560 }}>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                        <TableCell>이름</TableCell>
                                        <TableCell>아이디</TableCell>
                                        <TableCell>이메일</TableCell>
                                        <TableCell>가입방법</TableCell>
                                        <TableCell>역할</TableCell>
                                        {isSuperAdmin && <TableCell align="center">관리</TableCell>}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {users.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={colSpan} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                                검색 결과가 없습니다.
                                            </TableCell>
                                        </TableRow>
                                    ) : users.map(u => (
                                        <TableRow key={u.userId} hover>
                                            <TableCell>{u.name}</TableCell>
                                            <TableCell sx={{ fontSize: 14, fontWeight: 700 }}>{u.loginId}</TableCell>
                                            <TableCell sx={{ fontSize: 13, color: 'text.secondary' }}>{u.email}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={PROVIDER_LABEL[u.provider] ?? u.provider}
                                                    color={PROVIDER_COLOR[u.provider] ?? 'default'}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ fontWeight: 700, borderWidth: 2 }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={u.role === 'ADMIN' ? '관리자' : '일반'}
                                                    color={u.role === 'ADMIN' ? 'success' : 'primary'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            {isSuperAdmin && (
                                                <TableCell align="center">
                                                    <Stack direction="row" spacing={0.5} justifyContent="center">
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            color={u.role === 'ADMIN' ? 'primary' : 'success'}
                                                            onClick={() => handleRoleToggle(u)}
                                                            sx={{ fontSize: 11, fontWeight: 700, px: 1, py: 0.3, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
                                                        >
                                                            {u.role === 'ADMIN' ? '→일반' : '→관리자'}
                                                        </Button>
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            color="warning"
                                                            onClick={() => openEdit(u)}
                                                            sx={{ fontSize: 11, fontWeight: 700, px: 1, py: 0.3, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
                                                        >
                                                            수정
                                                        </Button>
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            color="error"
                                                            onClick={() => setDeleteTarget(u)}
                                                            sx={{ fontSize: 11, fontWeight: 700, px: 1, py: 0.3, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
                                                        >
                                                            삭제
                                                        </Button>
                                                    </Stack>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>

                        <CommonPagination
                            count={totalPage}
                            page={page}
                            onChange={(_, v) => setPage(v)}
                        />
                    </>
                )}
            </Paper>

            {/* 수정 다이얼로그 */}
            <Dialog open={editOpen} onClose={() => !editSaving && setEditOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle fontWeight={700}>회원 정보 수정</DialogTitle>
                <Divider />
                <DialogContent sx={{ pt: 2.5 }}>
                    <Stack spacing={2}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField
                                label="이름"
                                size="small"
                                fullWidth
                                value={editForm.name}
                                onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                            />
                            <TextField
                                label="연락처"
                                size="small"
                                fullWidth
                                value={editForm.phone}
                                onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                                placeholder="010-0000-0000"
                            />
                        </Stack>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField
                                label="아이디 (이메일 형식)"
                                size="small"
                                fullWidth
                                value={editForm.loginId}
                                onChange={e => setEditForm(f => ({ ...f, loginId: e.target.value }))}
                            />
                            <TextField
                                label="이메일"
                                size="small"
                                fullWidth
                                value={editForm.email}
                                onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                            />
                        </Stack>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField
                                label="생년월일"
                                type="date"
                                size="small"
                                fullWidth
                                value={editForm.birth}
                                onChange={e => setEditForm(f => ({ ...f, birth: e.target.value }))}
                                InputLabelProps={{ shrink: true }}
                            />
                            <FormControl size="small" fullWidth>
                                <InputLabel>역할</InputLabel>
                                <Select
                                    value={editForm.role}
                                    label="역할"
                                    onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}
                                >
                                    <MenuItem value="USER">일반 사용자</MenuItem>
                                    <MenuItem value="ADMIN">관리자</MenuItem>
                                </Select>
                            </FormControl>
                        </Stack>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={editForm.isActive}
                                    onChange={e => setEditForm(f => ({ ...f, isActive: e.target.checked }))}
                                    color="success"
                                />
                            }
                            label={editForm.isActive ? '활성 계정' : '비활성 계정'}
                        />
                        {editTarget?.provider !== 'LOCAL' && (
                            <Alert severity="warning" sx={{ py: 0.5 }}>
                                소셜 로그인 계정입니다. 아이디·이메일 변경 시 로그인에 영향을 줄 수 있습니다.
                            </Alert>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button onClick={() => setEditOpen(false)} disabled={editSaving}>취소</Button>
                    <Button variant="contained" onClick={handleEditSave} disabled={editSaving}>
                        {editSaving ? <CircularProgress size={18} /> : '저장'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 삭제 확인 다이얼로그 */}
            <Dialog open={!!deleteTarget} onClose={() => !deleteDeleting && setDeleteTarget(null)}>
                <DialogTitle fontWeight={700} color="error">회원 삭제</DialogTitle>
                <DialogContent>
                    <Typography>
                        <strong>{deleteTarget?.name}</strong> ({deleteTarget?.loginId}) 회원을 완전 삭제하시겠습니까?
                    </Typography>
                    <Alert severity="error" sx={{ mt: 1.5, py: 0.5 }}>
                        삭제된 데이터는 복구할 수 없습니다. 예약·후기 등 연결된 데이터가 있으면 삭제가 거부됩니다.
                    </Alert>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button onClick={() => setDeleteTarget(null)} disabled={deleteDeleting}>취소</Button>
                    <Button variant="contained" color="error" onClick={handleDelete} disabled={deleteDeleting}>
                        {deleteDeleting ? <CircularProgress size={18} /> : '삭제'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snack.open}
                autoHideDuration={3000}
                onClose={() => setSnack(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))}>
                    {snack.msg}
                </Alert>
            </Snackbar>
        </Box>
    );
}
