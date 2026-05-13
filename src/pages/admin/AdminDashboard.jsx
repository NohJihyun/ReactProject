import {
    Box, Grid, Paper, Typography, CircularProgress, Card, CardContent, Divider, Chip, Alert
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PublishedWithChangesIcon from '@mui/icons-material/PublishedWithChanges';
import RateReviewIcon from '@mui/icons-material/RateReview';
import WifiIcon from '@mui/icons-material/Wifi';
import { useEffect, useState, useCallback } from 'react';
import { getAdminStats } from '../../api/adminUserApi';

/* ── 통계 카드 ── */
const StatCard = ({ icon, label, value, color }) => (
    <Card variant="outlined" sx={{ height: '100%', borderLeft: `4px solid ${color}` }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: '16px !important' }}>
            <Box sx={{
                width: 48, height: 48, borderRadius: 2,
                bgcolor: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color, flexShrink: 0
            }}>
                {icon}
            </Box>
            <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" color="text.secondary" noWrap>{label}</Typography>
                <Typography variant="h5" fontWeight={700} lineHeight={1.2}>{value ?? '-'}</Typography>
            </Box>
        </CardContent>
    </Card>
);

/* ── 상태 뱃지 카드 ── */
const StatusBadge = ({ label, value, color, bgcolor }) => (
    <Box sx={{
        flex: 1, textAlign: 'center', py: 1.5, px: 1,
        borderRadius: 2, bgcolor, border: `1px solid ${color}22`
    }}>
        <Typography variant="h5" fontWeight={700} sx={{ color }}>{value ?? 0}</Typography>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
    </Box>
);

/* ── 바 차트 ── */
const BarChart = ({ data, labelKey, valueKey, color = '#1976d2' }) => {
    const max = Math.max(...data.map(d => d[valueKey]), 1);
    return (
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: { xs: 0.3, sm: 0.8 }, height: 140, pt: 2 }}>
            {data.map((d, i) => (
                <Box key={i} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                    <Typography sx={{ fontSize: 10, mb: 0.3, color: d[valueKey] > 0 ? 'text.primary' : 'transparent' }}>
                        {d[valueKey]}
                    </Typography>
                    <Box sx={{
                        width: '70%',
                        height: `${Math.max((d[valueKey] / max) * 85, d[valueKey] > 0 ? 3 : 0)}%`,
                        bgcolor: color,
                        borderRadius: '3px 3px 0 0',
                        transition: 'height 0.4s ease',
                        opacity: 0.85,
                        '&:hover': { opacity: 1 }
                    }} />
                    <Typography sx={{ fontSize: { xs: 8, sm: 10 }, mt: 0.5, color: 'text.secondary', textAlign: 'center' }}>
                        {d[labelKey]}
                    </Typography>
                </Box>
            ))}
        </Box>
    );
};

/* ── 가입방법별 수평 바 ── */
const PROVIDER_META = {
    LOCAL:  { label: '일반(이메일)', color: '#1976d2' },
    KAKAO:  { label: '카카오',       color: '#f9a825' },
    NAVER:  { label: '네이버',       color: '#43a047' },
    GOOGLE: { label: '구글',         color: '#e53935' },
};

const ProviderChart = ({ data, total }) => {
    if (!data || data.length === 0) return <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>데이터 없음</Typography>;
    return (
        <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1.2 }}>
            {data.map((d, i) => {
                const meta = PROVIDER_META[d.provider] ?? { label: d.provider, color: '#9e9e9e' };
                const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
                return (
                    <Box key={i}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                            <Typography variant="body2" fontWeight={500}>{meta.label}</Typography>
                            <Typography variant="body2" color="text.secondary">{d.count}명 ({pct}%)</Typography>
                        </Box>
                        <Box sx={{ height: 10, bgcolor: '#f0f0f0', borderRadius: 5, overflow: 'hidden' }}>
                            <Box sx={{
                                height: '100%', width: `${pct}%`, bgcolor: meta.color,
                                borderRadius: 5, transition: 'width 0.5s ease', minWidth: pct > 0 ? 4 : 0
                            }} />
                        </Box>
                    </Box>
                );
            })}
        </Box>
    );
};

/* ── 월별/연도별 데이터 가공 ── */
function buildMonthlyChart(rawData) {
    const map = {};
    (rawData ?? []).forEach(d => { map[d.month] = d.count; });
    return Array.from({ length: 12 }, (_, i) => {
        const date = new Date();
        date.setDate(1);
        date.setMonth(date.getMonth() - 11 + i);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        return { label: `${date.getMonth() + 1}월`, count: map[key] ?? 0 };
    });
}

function buildYearlyChart(rawData) {
    const map = {};
    (rawData ?? []).forEach(d => { map[d.year] = d.count; });
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => {
        const yr = currentYear - 4 + i;
        return { label: `${yr}년`, count: map[yr] ?? 0 };
    });
}

/* ── 메인 ── */
export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try { setStats(await getAdminStats()); }
        catch { /* ignore */ }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchStats(); }, [fetchStats]);

    const monthlyData = buildMonthlyChart(stats?.monthlyRegistrations);
    const yearlyData  = buildYearlyChart(stats?.yearlyRegistrations);

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: { sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
                <Typography variant="h5" fontWeight={700} sx={{ flexShrink: 0 }}>홈페이지 이용 현황</Typography>
                <Alert severity="info" sx={{ py: 0.5 }}>
                    홈페이지 전체 현황을 한눈에 파악하는 페이지입니다. 별도 수정 및 삭제, 등록 기능을 사용할 수 없습니다.
                </Alert>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    {/* ── 활성 세션 배너 ── */}
                    <Paper variant="outlined" sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#e8f5e9' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#43a047', boxShadow: '0 0 0 3px #a5d6a7' }} />
                            <WifiIcon sx={{ color: '#388e3c' }} />
                        </Box>
                        <Box>
                            <Typography variant="body2" color="text.secondary">현재 활성 세션 (유효한 로그인 상태)</Typography>
                            <Typography variant="h6" fontWeight={700} color="#2e7d32">
                                {stats?.activeSessionCount?.toLocaleString() ?? '-'} 명
                            </Typography>
                        </Box>
                        <Chip label="유효 RefreshToken 기준" size="small" sx={{ ml: 'auto', bgcolor: '#c8e6c9', color: '#1b5e20' }} />
                    </Paper>

                    {/* ── 회원 현황 ── */}
                    <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
                        <Typography variant="subtitle1" fontWeight={700} mb={2} color="text.secondary">회원 현황</Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <StatCard icon={<PeopleIcon />} label="전체 회원" value={stats?.totalUsers?.toLocaleString()} color="#1976d2" />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <StatCard icon={<PersonIcon />} label="활성 회원" value={stats?.activeUsers?.toLocaleString()} color="#388e3c" />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <StatCard icon={<AdminPanelSettingsIcon />} label="관리자" value={stats?.adminCount?.toLocaleString()} color="#d32f2f" />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <StatCard icon={<PersonIcon />} label="일반 회원" value={stats?.userCount?.toLocaleString()} color="#7b1fa2" />
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* ── 상품 현황 + 후기 현황 + 가입방법 ── */}
                    <Grid container spacing={3} sx={{ mb: 3 }}>

                        {/* 상품 상태별 */}
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <StorefrontIcon sx={{ color: '#f57c00' }} />
                                    <Typography variant="subtitle1" fontWeight={700}>상품 현황</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                                        전체 {stats?.totalProducts ?? 0}개
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <StatusBadge label="게시중" value={stats?.publishedProducts} color="#1976d2" bgcolor="#e3f2fd" />
                                    <StatusBadge label="임시저장" value={stats?.draftProducts} color="#f57c00" bgcolor="#fff3e0" />
                                    <StatusBadge label="숨김" value={stats?.hiddenProducts} color="#757575" bgcolor="#f5f5f5" />
                                    <StatusBadge label="종료" value={stats?.endedProducts} color="#c62828" bgcolor="#ffebee" />
                                </Box>
                            </Paper>
                        </Grid>

                        {/* 후기 상태별 */}
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <RateReviewIcon sx={{ color: '#00838f' }} />
                                    <Typography variant="subtitle1" fontWeight={700}>후기 현황</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                                        전체 {stats?.totalReviews ?? 0}개
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1.5 }}>
                                    <StatusBadge label="노출중" value={stats?.publishedReviews} color="#1976d2" bgcolor="#e3f2fd" />
                                    <StatusBadge label="숨김" value={stats?.hiddenReviews} color="#757575" bgcolor="#f5f5f5" />
                                </Box>
                            </Paper>
                        </Grid>

                        {/* 가입방법별 */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <PublishedWithChangesIcon sx={{ color: '#7b1fa2' }} />
                                    <Typography variant="subtitle1" fontWeight={700}>가입 방법별</Typography>
                                </Box>
                                <ProviderChart data={stats?.providerStats} total={stats?.totalUsers} />
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* ── 가입자 추이 차트 ── */}
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 7 }}>
                            <Paper variant="outlined" sx={{ p: 2.5 }}>
                                <Typography variant="subtitle1" fontWeight={700}>월별 신규 가입자</Typography>
                                <Typography variant="caption" color="text.secondary">최근 12개월 기준</Typography>
                                <BarChart data={monthlyData} labelKey="label" valueKey="count" color="#1976d2" />
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, md: 5 }}>
                            <Paper variant="outlined" sx={{ p: 2.5 }}>
                                <Typography variant="subtitle1" fontWeight={700}>연도별 신규 가입자</Typography>
                                <Typography variant="caption" color="text.secondary">최근 5년 기준</Typography>
                                <BarChart data={yearlyData} labelKey="label" valueKey="count" color="#7b1fa2" />
                            </Paper>
                        </Grid>
                    </Grid>
                </>
            )}
        </Box>
    );
}
