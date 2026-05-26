import {
    Box, Paper, Typography, TextField, Table, TableHead, TableRow,
    TableCell, TableBody, Chip, Button, CircularProgress,
    Alert, Snackbar
} from '@mui/material';
import { useEffect, useState, useCallback } from 'react';
import { getAdminUsers, changeUserRole } from '../../api/adminUserApi';
import CommonPagination from '../../components/CommonPagination';
import { useAuth } from '../../auth/AuthProvider';

const SUPER_ADMINS = ['admin@rohitour.com'];

const PROVIDER_LABEL = { LOCAL: '일반', KAKAO: '카카오', NAVER: '네이버', GOOGLE: '구글' };
const PROVIDER_COLOR = { LOCAL: 'default', KAKAO: 'warning', NAVER: 'success', GOOGLE: 'error' };

export default function AdminUsersPage() {
    const { user } = useAuth();
    const isSuperAdmin = user?.email && SUPER_ADMINS.includes(user.email);
    const [users, setUsers] = useState([]);
    const [totalPage, setTotalPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [keyword, setKeyword] = useState('');
    const [inputKeyword, setInputKeyword] = useState('');
    const [loading, setLoading] = useState(false);
    const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

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

    const handleRoleToggle = async (user) => {
        const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
        const label = newRole === 'ADMIN' ? '관리자' : '일반 사용자';
        if (!window.confirm(`${user.name}(${user.loginId}) 님의 권한을 ${label}(으)로 변경하시겠습니까?`)) return;
        try {
            await changeUserRole(user.userId, newRole);
            setSnack({ open: true, msg: `권한이 ${label}(으)로 변경되었습니다.`, severity: 'success' });
            fetchUsers(keyword, page);
        } catch {
            setSnack({ open: true, msg: '권한 변경에 실패했습니다.', severity: 'error' });
        }
    };

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

                <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                        size="small"
                        placeholder="이름 또는 아이디 검색"
                        value={inputKeyword}
                        onChange={e => setInputKeyword(e.target.value)}
                        sx={{ width: 280 }}
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
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                    <TableCell>이름</TableCell>
                                    <TableCell>아이디</TableCell>
                                    <TableCell>가입방법</TableCell>
                                    <TableCell>역할</TableCell>
                                    {isSuperAdmin && <TableCell align="center">역할 변경</TableCell>}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {users.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={isSuperAdmin ? 5 : 4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                            검색 결과가 없습니다.
                                        </TableCell>
                                    </TableRow>
                                ) : users.map(u => (
                                    <TableRow key={u.userId} hover>
                                        <TableCell>{u.name}</TableCell>
                                        <TableCell sx={{ fontSize: 14, fontWeight: 700 }}>{u.loginId}</TableCell>
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
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    color={u.role === 'ADMIN' ? 'primary' : 'success'}
                                                    onClick={() => handleRoleToggle(u)}
                                                    sx={{ fontSize: 12, fontWeight: 700, px: 1.5, py: 0.5, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
                                                >
                                                    {u.role === 'ADMIN' ? '→ 일반' : '→ 관리자'}
                                                </Button>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        <CommonPagination
                            count={totalPage}
                            page={page}
                            onChange={(_, v) => setPage(v)}
                        />
                    </>
                )}
            </Paper>

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
