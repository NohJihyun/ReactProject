import { Box, Typography, Divider, Button, Stack, Chip } from '@mui/material';
import { useParams } from 'react-router-dom';

export default function PaymentPage() {
    const { bookingNumber } = useParams();

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(160deg, #e3f2fd 0%, #fafafa 60%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
        }}>
            <Box sx={{
                maxWidth: 460,
                width: '100%',
                bgcolor: '#fff',
                borderRadius: 4,
                overflow: 'hidden',
                boxShadow: '0 8px 40px rgba(25,118,210,0.12)',
            }}>
                {/* 헤더 */}
                <Box sx={{
                    background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                    px: 4, py: 3.5,
                    textAlign: 'center',
                    position: 'relative',
                }}>
                    <Box sx={{
                        width: 56, height: 56,
                        borderRadius: '50%',
                        bgcolor: 'rgba(255,255,255,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        mx: 'auto', mb: 1.5,
                        fontSize: 28,
                    }}>
                        💳
                    </Box>
                    <Typography variant="h6" fontWeight={800} color="#fff" letterSpacing={0.5}>
                        결제하기
                    </Typography>
                    {bookingNumber && (
                        <Chip
                            label={`예약번호 ${bookingNumber}`}
                            size="small"
                            sx={{
                                mt: 1,
                                bgcolor: 'rgba(255,255,255,0.25)',
                                color: '#fff',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                letterSpacing: 0.3,
                            }}
                        />
                    )}
                </Box>

                {/* 본문 */}
                <Box sx={{ px: 4, py: 4 }}>
                    {/* 별 5개 */}
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                        {[1,2,3,4,5].map(i => (
                            <Typography key={i} component="span" sx={{ fontSize: 28, color: '#FFD700', mx: 0.3 }}>★</Typography>
                        ))}
                    </Box>

                    {/* 상태 안내 */}
                    <Box sx={{
                        bgcolor: '#f0f7ff',
                        border: '1px solid #bbdefb',
                        borderRadius: 3,
                        px: 3, py: 2.5,
                        textAlign: 'center',
                        mb: 3,
                    }}>
                        <Typography variant="body1" fontWeight={700} color="#1565c0" gutterBottom>
                            온라인 결제 서비스 준비 중
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                            더 편리한 결제 서비스를 준비하고 있습니다.<br />
                            현재는 담당자 확인 후 결제 방법을 안내드립니다.
                        </Typography>
                    </Box>

                    <Divider sx={{ mb: 3 }}>
                        <Typography variant="caption" color="text.disabled">결제 문의</Typography>
                    </Divider>

                    {/* 연락처 */}
                    <Stack spacing={1.5}>
                        <Box sx={{
                            display: 'flex', alignItems: 'center', gap: 1.5,
                            bgcolor: '#fafafa', borderRadius: 2, px: 2.5, py: 1.5,
                        }}>
                            <Typography sx={{ fontSize: 20 }}>📞</Typography>
                            <Box>
                                <Typography variant="caption" color="text.disabled" display="block">전화</Typography>
                                <Typography variant="body2" fontWeight={700}>031-466-9600</Typography>
                            </Box>
                        </Box>
                        <Box sx={{
                            display: 'flex', alignItems: 'center', gap: 1.5,
                            bgcolor: '#fafafa', borderRadius: 2, px: 2.5, py: 1.5,
                        }}>
                            <Typography sx={{ fontSize: 20 }}>✉️</Typography>
                            <Box>
                                <Typography variant="caption" color="text.disabled" display="block">이메일</Typography>
                                <Typography variant="body2" fontWeight={700}>with@rohitour.com</Typography>
                            </Box>
                        </Box>
                        <Typography variant="caption" color="text.disabled" textAlign="center" display="block" sx={{ pt: 0.5 }}>
                            평일 09:00 ~ 18:00 (점심 12:00 ~ 13:00)
                        </Typography>
                    </Stack>

                    <Button
                        variant="outlined"
                        fullWidth
                        onClick={() => window.close()}
                        sx={{ mt: 3.5, borderRadius: 2, py: 1.2, fontWeight: 600 }}>
                        창 닫기
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}
