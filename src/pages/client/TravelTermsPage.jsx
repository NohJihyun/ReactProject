import { Box, Container, Typography, Divider, Table, TableBody, TableCell, TableHead, TableRow, Paper } from '@mui/material';

const INFO = {
    company: '(주)로이투어',
    rep: '노수정',
    bizNo: '845-81-03904',
    tel: '031-466-9600',
    email: 'with@rohitour.com',
    address: '경기도 안양시 만안구 석수로 42, 2층 202호 (석수동, 럭키아파트상가동)',
    insurance: '5,000만원 (피보험자: 한국여행업협회)',
    date: '2026년 5월 18일',
};

// 공정거래위원회 국외여행표준약관 기준 취소수수료 (여행사 유리하게 조정)
const CANCEL_DOMESTIC = [
    { timing: '여행 출발 30일 전 이전 취소', fee: '없음 (계약금 전액 환급)' },
    { timing: '출발 21일 전까지 취소', fee: '여행요금의 5%' },
    { timing: '출발 14일 전까지 취소', fee: '여행요금의 10%' },
    { timing: '출발 7일 전까지 취소', fee: '여행요금의 15%' },
    { timing: '출발 3일 전까지 취소', fee: '여행요금의 20%' },
    { timing: '출발 2일 전까지 취소', fee: '여행요금의 30%' },
    { timing: '출발 1일 전 취소', fee: '여행요금의 50%' },
    { timing: '출발 당일 취소 또는 여행 중도 포기', fee: '여행요금의 100%' },
];

const CANCEL_OVERSEAS = [
    { timing: '여행 출발 30일 전 이전 취소', fee: '없음 (계약금 전액 환급)' },
    { timing: '출발 20일 전까지 취소', fee: '여행요금의 5%' },
    { timing: '출발 10일 전까지 취소', fee: '여행요금의 10%' },
    { timing: '출발 8일 전까지 취소', fee: '여행요금의 15%' },
    { timing: '출발 1일 전까지 취소', fee: '여행요금의 20%' },
    { timing: '출발 당일 취소 또는 여행 중도 포기', fee: '여행요금의 50% (항공권 미발권 기준, 발권 후는 실비 공제 후 환급)' },
];

const SECTIONS = [
    {
        title: '제1조 (목적)',
        body: `본 약관은 (주)로이투어(이하 "여행사")가 기획·판매하는 국내외 여행상품의 예약·계약·이행 및 취소에 관한 여행사와 여행자 간의 권리·의무·책임사항을 규정함을 목적으로 합니다.\n본 약관은 공정거래위원회 소비자분쟁해결기준 및 국외(국내)여행표준약관을 기반으로 작성되었습니다.`,
    },
    {
        title: '제2조 (계약의 성립)',
        body: `① 여행계약은 여행자가 여행 일정, 요금, 조건 등을 확인하고 계약금을 납입하며 여행사가 이를 수락한 시점에 성립됩니다.\n② 웹사이트 내 상품 정보 조회 및 상담 신청만으로는 계약이 성립되지 않습니다.\n③ 여행사는 다음의 경우 계약 체결을 거절하거나 계약을 취소할 수 있습니다.\n  · 단체여행의 경우 최소 출발 인원에 미달한 경우 (출발 7일 전까지 통보)\n  · 여행자가 허위 정보를 제공하거나 계약 이행을 방해하는 경우\n  · 여행자가 여행 목적지 출입국 자격을 갖추지 못한 경우`,
    },
    {
        title: '제3조 (여행 요금)',
        body: `① 여행 요금은 계약 체결 시 확정됩니다. 단, 다음 사유로 인한 비용 증가분은 여행자가 추가 부담합니다.\n  · 계약 후 유류 할증료 인상 또는 신규 부과\n  · 환율 변동으로 인한 현지 비용 증가\n  · 정부의 공항세·출국세·비자비 등 공과금 인상\n② 위 사유로 인한 요금 변경 시 여행사는 출발 10일 전까지 여행자에게 통보합니다.\n③ 여행사의 귀책사유 없이 발생한 현지 추가 비용(선택 관광, 개인 용돈, 팁, 초과 수하물 요금 등)은 여행자 본인이 부담합니다.`,
    },
    {
        title: '제4조 (여행 일정의 변경)',
        body: `① 여행사는 아래 사유 발생 시 여행 일정을 변경할 수 있습니다. 이 경우 여행자에게 사전 또는 즉시 통보합니다.\n  · 천재지변, 기상 악화, 감염병 확산, 전쟁·테러·내란 등 불가항력\n  · 정부의 여행 금지·자제 권고 또는 출입국 규제\n  · 항공기·선박·현지 교통수단의 결항·지연·취소\n  · 현지 파업, 시위, 교통 통제 등 현지 사정\n  · 숙박시설·식당·관광지의 임시 폐쇄 또는 이용 불가\n② 위 사유로 인한 일정 변경 및 추가 비용에 대해 여행사는 책임을 지지 않습니다.\n③ 여행사의 귀책사유로 일정이 변경된 경우 여행자는 손해배상을 청구할 수 있습니다.`,
    },
    {
        title: '제5조 (여행자의 취소 및 환급)',
        body: `① 여행자는 여행 출발 전 언제든지 계약을 취소할 수 있으며, 취소 시점에 따라 아래 취소수수료가 부과됩니다.\n② 취소수수료 산정 기준은 계약금 납입 후 통보한 날을 기준으로 합니다.\n③ 항공권, 크루즈권 등 특수 계약 상품의 경우 해당 공급업체의 취소 정책이 우선 적용될 수 있으며, 이 경우 실비 공제 후 환급합니다.`,
        tables: ['domestic', 'overseas'],
    },
    {
        title: '제6조 (여행사의 계약 해지)',
        body: `① 여행사는 다음 사유 발생 시 여행 출발 전 계약을 해지하고 계약금을 전액 환급할 수 있습니다.\n  · 최소 출발 인원 미달 (국내여행: 출발 7일 전, 국외여행: 출발 14일 전까지 통보)\n  · 천재지변, 전쟁, 감염병 확산 등으로 여행의 안전한 실시가 불가능한 경우\n  · 관할 기관의 여행 금지 조치\n② 최소 인원 미달로 인한 계약 해지 시 여행사는 위약금을 지급하지 않습니다.\n③ 여행사의 귀책사유로 계약을 해지하는 경우 이미 납입한 여행요금을 전액 환급하고 추가 손해배상 책임을 집니다.`,
    },
    {
        title: '제7조 (불가항력 및 면책)',
        body: `① 여행사는 다음의 불가항력적 사유로 인하여 여행 계약의 이행이 불가능하거나 현저히 곤란하게 된 경우 책임을 지지 않습니다.\n  · 자연재해(지진, 태풍, 홍수, 화산 폭발 등)\n  · 전쟁, 내란, 테러, 폭동\n  · 신종 감염병 확산 및 이에 따른 정부·기관의 여행 제한 조치\n  · 항공기·선박의 결항·지연 (항공사·선박사의 귀책사유)\n  · 현지 파업, 소요 사태\n② 여행자 본인의 질병, 부상, 과실로 인한 손해는 여행사가 책임을 지지 않습니다.\n③ 여행자가 여행 목적지의 법규를 위반하거나 이로 인해 발생한 손해에 대해 여행사는 책임을 지지 않습니다.\n④ 현지 가이드, 운전기사, 숙박시설, 식당 등 현지 서비스 제공자의 과실로 인한 손해에 대해 여행사의 책임은 상당한 주의를 다한 경우에 한해 면책됩니다.`,
    },
    {
        title: '제8조 (여행자 보험)',
        body: `① 여행사는 여행자의 안전을 위해 여행자 보험 가입을 권장합니다.\n② 여행 상품에 여행자 보험이 포함된 경우 상품 안내서에 명시합니다.\n③ 여행자 보험이 미포함된 상품의 경우 여행자는 개인적으로 여행자 보험에 가입하여야 하며, 미가입으로 인한 불이익은 여행자 본인이 부담합니다.`,
    },
    {
        title: '제9조 (여권·비자 및 출입국 관련)',
        body: `① 여행자는 자신의 여권 유효기간(일반적으로 귀국일 기준 6개월 이상 권장), 비자 취득, 출입국 서류를 스스로 확인하고 준비하여야 합니다.\n② 여권 또는 비자 미비, 출입국 심사 거부 등 여행자 본인의 귀책사유로 여행에 참가하지 못하는 경우 출발 당일 취소에 준하는 취소수수료가 부과됩니다.\n③ 여행사는 비자 취득에 관한 정보를 제공하나 비자 발급 보장을 약속하지 않습니다.`,
    },
    {
        title: '제10조 (손해배상의 한계)',
        body: `① 여행사가 여행자에게 지급하는 손해배상액은 해당 여행 요금을 한도로 합니다.\n② 여행자의 일실(逸失) 수익, 정신적 피해 등 간접 손해에 대해서는 별도로 정한 경우를 제외하고 배상하지 않습니다.\n③ 여행사가 제공한 정보를 근거로 여행자가 독자적으로 결정한 사항(추가 일정, 현지 구매 등)으로 인한 손해에 대해 여행사는 책임을 지지 않습니다.`,
    },
    {
        title: '제11조 (분쟁 해결 및 준거법)',
        body: `① 본 약관과 관련하여 여행사와 여행자 간에 분쟁이 발생한 경우, 우선 상호 협의를 통해 해결합니다.\n② 협의가 이루어지지 않을 경우 소비자분쟁조정위원회 또는 한국여행업협회(KATA) 분쟁조정절차에 따릅니다.\n③ 법적 분쟁이 발생한 경우 대한민국 법령을 적용하며, 여행사의 본점 소재지를 관할하는 법원을 제1심 전속 관할법원으로 합니다.`,
    },
];

function CancelTable({ rows, title }) {
    return (
        <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="caption" fontWeight={700} sx={{ color: '#555', display: 'block', mb: 0.5 }}>
                {title}
            </Typography>
            <Paper variant="outlined" sx={{ overflow: 'auto' }}>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>취소 시점</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>취소수수료</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((r, i) => (
                            <TableRow key={i} sx={{ bgcolor: r.fee === '없음 (계약금 전액 환급)' ? '#f9fff9' : i >= rows.length - 2 ? '#fff5f5' : 'inherit' }}>
                                <TableCell sx={{ fontSize: '0.75rem' }}>{r.timing}</TableCell>
                                <TableCell sx={{ fontSize: '0.75rem', fontWeight: i >= rows.length - 2 ? 700 : 400, color: i >= rows.length - 2 ? '#c62828' : 'inherit' }}>
                                    {r.fee}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>
        </Box>
    );
}

export default function TravelTermsPage() {
    return (
        <Box sx={{ bgcolor: '#f7f8fc', minHeight: '100vh', py: { xs: 5, md: 8 } }}>
            <Container maxWidth="md">
                <Box sx={{ mb: 5 }}>
                    <Typography variant="caption" sx={{ color: '#2e7d32', fontWeight: 700, letterSpacing: 2 }}>
                        ROHITOUR
                    </Typography>
                    <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5, mb: 1 }}>
                        여행약관
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        시행일: {INFO.date} &nbsp;|&nbsp; 공정거래위원회 표준약관 기준
                    </Typography>
                </Box>

                {/* 영업보증보험 안내 */}
                <Box sx={{ bgcolor: '#e3f2fd', borderRadius: 2, px: 3, py: 2, mb: 4, borderLeft: '4px solid #1565c0' }}>
                    <Typography variant="body2" sx={{ color: '#0d47a1', lineHeight: 1.8 }}>
                        <strong>(주)로이투어</strong>는 종합여행업 등록 여행사로, 영업보증보험 <strong>{INFO.insurance}</strong>에 가입되어 있습니다.<br />
                        여행사 폐업 또는 영업 정지 시 피보험자(한국여행업협회)를 통해 여행자 피해를 구제받으실 수 있습니다.
                    </Typography>
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
                            {s.tables?.includes('domestic') && (
                                <CancelTable rows={CANCEL_DOMESTIC} title="▸ 국내여행 취소수수료" />
                            )}
                            {s.tables?.includes('overseas') && (
                                <CancelTable rows={CANCEL_OVERSEAS} title="▸ 국외여행 취소수수료" />
                            )}
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
