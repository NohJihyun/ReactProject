import { useEffect, useState, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { getPopularKeywords } from '../api/clientApi';

const CYCLE_MS = 2000;

const RANK_COLORS = ['#e53935', '#e53935', '#e53935', '#1565c0', '#1565c0', '#424242', '#424242', '#424242', '#424242', '#424242'];

export default function RealTimeKeywords({ onKeywordClick }) {
    const [keywords, setKeywords] = useState([]);
    const [idx, setIdx]           = useState(0);
    const [visible, setVisible]   = useState(true);
    const timerRef                = useRef(null);

    useEffect(() => {
        getPopularKeywords(10)
            .then(data => { if (data.length > 0) setKeywords(data); })
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (keywords.length < 2) return;
        timerRef.current = setInterval(() => {
            setVisible(false);
            setTimeout(() => {
                setIdx(prev => (prev + 1) % keywords.length);
                setVisible(true);
            }, 250);
        }, CYCLE_MS);
        return () => clearInterval(timerRef.current);
    }, [keywords]);

    if (keywords.length === 0) return null;

    const current  = keywords[idx];
    const maxCount = keywords[0]?.searchCount ?? 1;
    const barWidth = Math.max(10, Math.round((current.searchCount / maxCount) * 100));

    return (
        <Box sx={{ minWidth: 150, maxWidth: 200, flexShrink: 0 }}>
            {/* 헤더 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.4 }}>
                <Box sx={{
                    width: 6, height: 6, borderRadius: '50%', bgcolor: '#e53935',
                    animation: 'pulse 1.4s ease-in-out infinite',
                    '@keyframes pulse': {
                        '0%, 100%': { opacity: 1 },
                        '50%': { opacity: 0.3 },
                    },
                }} />
                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ fontSize: '0.68rem', letterSpacing: 0.3 }}>
                    인기 검색어
                </Typography>
            </Box>

            {/* 키워드 슬롯 */}
            <Box
                onClick={() => onKeywordClick?.(current.keyword)}
                sx={{
                    cursor: 'pointer',
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateY(0)' : 'translateY(4px)',
                    transition: 'opacity 0.25s ease, transform 0.25s ease',
                    '&:hover .kw-text': { color: '#1976d2' },
                }}
            >
                {/* 순위 + 키워드 */}
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.6 }}>
                    <Typography
                        variant="caption"
                        fontWeight={800}
                        sx={{ fontSize: '0.72rem', color: RANK_COLORS[idx] ?? '#424242', minWidth: 22 }}
                    >
                        {idx + 1}위
                    </Typography>
                    <Typography
                        className="kw-text"
                        variant="body2"
                        fontWeight={700}
                        noWrap
                        sx={{ fontSize: '0.85rem', transition: 'color 0.2s' }}
                    >
                        {current.keyword}
                    </Typography>
                </Box>

                {/* 인기도 바 */}
                <Box sx={{ mt: 0.4, height: 3, borderRadius: 2, bgcolor: '#f0f0f0', overflow: 'hidden' }}>
                    <Box sx={{
                        height: '100%',
                        width: `${barWidth}%`,
                        borderRadius: 2,
                        bgcolor: RANK_COLORS[idx] ?? '#424242',
                        opacity: 0.7,
                        transition: 'width 0.4s ease',
                    }} />
                </Box>
            </Box>
        </Box>
    );
}
