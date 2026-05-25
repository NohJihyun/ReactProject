import { Box, Container, Typography, Divider, Table, TableBody, TableCell, TableHead, TableRow, Paper } from '@mui/material';

const INFO = {
    company: '(주)로이투어',
    rep: '노수정',
    bizNo: '845-81-03904',
    tel: '031-466-9600',
    email: 'with@rohitour.com',
    address: '경기도 안양시 만안구 석수로 42, 2층 202호 (석수동, 럭키아파트상가동)',
    date: '2026년 5월 18일',
};

const COLLECT_TABLE = [
    { purpose: '회원가입 및 관리', items: '이름, 이메일(로그인 아이디), 비밀번호(암호화), 생년월일, 휴대폰번호', period: '회원 탈퇴 시까지 (단, 관계법령에 따른 보존 기간 우선)' },
    { purpose: '소셜 로그인 (네이버·카카오·구글)', items: '소셜 서비스 고유 식별자(providerId), 이름, 이메일 (서비스 정책에 따라 제공 항목 상이)', period: '회원 탈퇴 시까지' },
    { purpose: '여행 상담 및 예약 진행', items: '이름, 연락처, 이메일', period: '서비스 제공 완료 후 5년' },
    { purpose: '마케팅 정보 발송 (선택)', items: '이메일, 휴대폰번호', period: '동의 철회 시까지' },
    { purpose: '불법 이용 방지 및 분쟁 해결', items: '서비스 이용 기록, 접속 로그, IP 정보', period: '3년' },
];

const THIRD_PARTY_TABLE = [
    { receiver: '항공사, 숙박업체, 현지 투어사, 선박사 등 여행 공급업체', items: '이름, 연락처, 이메일', purpose: '여행 예약·진행·확인', period: '서비스 제공 완료 시까지' },
    { receiver: '한국여행업협회(KATA)', items: '사업자 관련 정보 (영업보증보험 유지 목적)', purpose: '영업보증보험 관리', period: '계약 기간 중' },
];

const SECTIONS = [
    {
        title: '제1조 (개인정보의 처리 목적)',
        body: `(주)로이투어(이하 "회사")는 다음 목적으로 개인정보를 처리합니다. 처리하는 개인정보는 해당 목적 이외의 용도로 사용되지 않으며, 목적이 변경될 경우 사전에 동의를 받겠습니다.\n\n· 회원가입 및 관리, 본인 확인, 부정 이용 방지\n· 여행상품 정보 안내 및 상담 신청 접수·처리\n· 여행 예약·계약 체결 및 이행\n· 고객 문의 접수 및 처리, 분쟁 해결\n· 마케팅 및 광고 활용 (동의한 회원에 한함)`,
    },
    {
        title: '제3조 (개인정보의 제3자 제공)',
        body: `회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만, 아래의 경우에는 예외로 합니다.\n\n· 이용자가 사전에 동의한 경우\n· 법령에 따라 수사 목적으로 관계기관의 요청이 있는 경우\n· 여행 예약·진행을 위해 공급업체에 제공이 필요한 경우 (아래 표 참고)`,
        table: THIRD_PARTY_TABLE,
        tableType: 'thirdParty',
    },
    {
        title: '제4조 (개인정보 처리의 위탁)',
        body: `회사는 서비스 제공을 위해 아래와 같이 개인정보 처리 업무를 위탁하고 있습니다.\n\n· 수탁사: Google LLC (Google Analytics — 서비스 이용 통계 분석)\n· 수탁사: 이메일 발송 서비스 운영사 (이메일 인증 코드 발송)\n\n위탁 계약 시 개인정보보호법에 따라 수탁사에 대한 관리·감독을 철저히 합니다.`,
    },
    {
        title: '제5조 (개인정보의 보유 및 이용기간)',
        body: `① 회사는 원칙적으로 개인정보 처리 목적이 달성된 후 지체 없이 해당 정보를 파기합니다.\n② 단, 다음의 경우에는 관계 법령에서 정한 기간 동안 보존합니다.\n\n· 전자상거래 등에서의 소비자보호에 관한 법률\n  - 계약·청약 철회 기록: 5년\n  - 소비자 불만·분쟁 처리 기록: 3년\n· 통신비밀보호법: 로그인 기록 3개월\n· 국세기본법: 거래 관련 서류 5년`,
    },
    {
        title: '제6조 (개인정보의 파기)',
        body: `① 회사는 개인정보 보유기간의 경과 또는 처리 목적 달성 시 지체 없이 해당 정보를 파기합니다.\n② 전자적 파일 형태의 정보는 복구 불가능한 방법으로 영구 삭제하며, 종이 문서는 분쇄기로 파기합니다.`,
    },
    {
        title: '제7조 (이용자의 권리·의무 및 행사 방법)',
        body: `① 이용자는 회사에 대해 언제든지 다음 권리를 행사할 수 있습니다.\n  · 개인정보 열람 요청\n  · 오류 정정 요청\n  · 삭제 요청\n  · 처리 정지 요청\n② 권리 행사는 이메일(${INFO.email}) 또는 전화(${INFO.tel})로 요청하실 수 있으며, 회사는 지체 없이 조치하겠습니다.\n③ 이용자가 개인정보의 오류에 대한 정정 요청을 한 경우, 정정 완료 전까지 해당 정보를 이용·제공하지 않습니다.\n④ 이용자는 자신의 개인정보를 최신 상태로 유지할 의무가 있으며, 부정확한 정보 입력으로 인한 불이익은 이용자가 부담합니다.`,
    },
    {
        title: '제8조 (개인정보의 안전성 확보 조치)',
        body: `회사는 개인정보의 안전성 확보를 위해 다음 조치를 취하고 있습니다.\n\n· 비밀번호 BCrypt 단방향 암호화 저장\n· JWT(Access Token) HTTPS 전송 암호화\n· 데이터베이스 접근 권한 최소화\n· 개인정보 처리 직원 최소화 및 정기 교육`,
    },
    {
        title: '제9조 (쿠키의 설치·운영 및 거부)',
        body: `① 회사는 이용자에게 개인화된 서비스를 제공하기 위해 쿠키(Cookie)를 사용할 수 있습니다.\n② 쿠키는 웹 브라우저에 저장되는 소량의 정보로, 이용자는 브라우저 설정에서 쿠키 수신을 거부할 수 있습니다.\n③ 쿠키 수신 거부 시 서비스의 일부 기능 이용이 제한될 수 있습니다.`,
    },
    {
        title: '제10조 (개인정보 보호책임자)',
        body: `회사는 개인정보 처리에 관한 업무를 총괄하는 개인정보 보호책임자를 다음과 같이 지정하고 있습니다.\n\n· 성명: 노수정\n· 직책: 대표이사\n· 연락처: ${INFO.tel}\n· 이메일: ${INFO.email}\n\n개인정보 보호 관련 문의, 불만 처리, 피해 구제 등은 위 연락처로 문의하시면 신속하게 처리하겠습니다.\n\n또한 개인정보 침해에 대한 신고나 상담이 필요하신 경우 아래 기관에 문의하실 수 있습니다.\n· 개인정보침해신고센터: privacy.kisa.or.kr / (국번없이) 118\n· 개인정보 분쟁조정위원회: www.kopico.go.kr / 1833-6972\n· 대검찰청 사이버수사과: www.spo.go.kr / (국번없이) 1301\n· 경찰청 사이버수사국: ecrm.cyber.go.kr / (국번없이) 182`,
    },
    {
        title: '제11조 (개인정보처리방침의 변경)',
        body: `본 개인정보처리방침은 시행일로부터 적용되며, 내용이 변경될 경우 시행일 최소 7일 전에 웹사이트 공지사항을 통해 안내드리겠습니다.`,
    },
];

function ThirdPartyTable({ rows }) {
    return (
        <Paper variant="outlined" sx={{ mt: 2, mb: 1, overflow: 'auto' }}>
            <Table size="small">
                <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                        {['제공받는 자', '제공 항목', '제공 목적', '보유 기간'].map(h => (
                            <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{h}</TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((r, i) => (
                        <TableRow key={i}>
                            <TableCell sx={{ fontSize: '0.75rem' }}>{r.receiver}</TableCell>
                            <TableCell sx={{ fontSize: '0.75rem' }}>{r.items}</TableCell>
                            <TableCell sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{r.purpose}</TableCell>
                            <TableCell sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{r.period}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Paper>
    );
}

export default function PrivacyPage() {
    return (
        <Box sx={{ bgcolor: '#f7f8fc', minHeight: '100vh', py: { xs: 5, md: 8 } }}>
            <Container maxWidth="md">
                <Box sx={{ mb: 5 }}>
                    <Typography variant="caption" sx={{ color: '#2e7d32', fontWeight: 700, letterSpacing: 2 }}>
                        ROHITOUR
                    </Typography>
                    <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5, mb: 1 }}>
                        개인정보처리방침
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        시행일: {INFO.date} &nbsp;|&nbsp; 최종 수정일: {INFO.date}
                    </Typography>
                </Box>

                <Box sx={{ bgcolor: '#e8f5e9', borderRadius: 2, px: 3, py: 2, mb: 4, borderLeft: '4px solid #2e7d32' }}>
                    <Typography variant="body2" sx={{ color: '#1b5e20', lineHeight: 1.8 }}>
                        {INFO.company}는 개인정보보호법 등 관련 법령을 준수하며, 이용자의 개인정보를 안전하게 처리합니다.
                        본 방침은 회사가 제공하는 모든 서비스에 적용됩니다.
                    </Typography>
                </Box>

                {/* 수집·이용 테이블 */}
                <Box sx={{ bgcolor: 'white', borderRadius: 3, boxShadow: '0 2px 16px rgba(0,0,0,0.06)', p: { xs: 3, md: 5 }, mb: 3 }}>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#1a1a2e', fontSize: '1rem' }}>
                        제2조 (수집하는 개인정보 항목 및 수집·이용 목적)
                    </Typography>
                    <Paper variant="outlined" sx={{ overflow: 'auto' }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                    {['수집·이용 목적', '수집 항목', '보유 기간'].map(h => (
                                        <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.75rem' }}>{h}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {COLLECT_TABLE.map((r, i) => (
                                    <TableRow key={i}>
                                        <TableCell sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{r.purpose}</TableCell>
                                        <TableCell sx={{ fontSize: '0.75rem' }}>{r.items}</TableCell>
                                        <TableCell sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{r.period}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Paper>
                </Box>

                <Box sx={{ bgcolor: 'white', borderRadius: 3, boxShadow: '0 2px 16px rgba(0,0,0,0.06)', p: { xs: 3, md: 5 } }}>
                    {SECTIONS.map((s, i) => (
                        <Box key={i}>
                            {i > 0 && <Divider sx={{ my: 3.5 }} />}
                            <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5, color: '#1a1a2e', fontSize: '1rem' }}>
                                {s.title}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#444', lineHeight: 2, whiteSpace: 'pre-line' }}>
                                {s.body}
                            </Typography>
                            {s.tableType === 'thirdParty' && <ThirdPartyTable rows={s.table} />}
                        </Box>
                    ))}
                </Box>

                <Typography variant="caption" color="text.disabled" sx={{ display: 'block', textAlign: 'center', mt: 4, lineHeight: 2 }}>
                    {INFO.company} &nbsp;|&nbsp; 대표 {INFO.rep} &nbsp;|&nbsp; 사업자등록번호 {INFO.bizNo}<br />
                    {INFO.address}<br />
                    Tel. {INFO.tel} &nbsp;|&nbsp; {INFO.email}
                </Typography>
            </Container>
        </Box>
    );
}
