import React from 'react';
import { Button, Stack } from '@mui/material';

/* 자식 page */
const CategoryList = ({ categories = [], startIndex = 0, onEdit, onDeactivate, onDelete  }) => {
    return (
        <table
            style={{
                width: '100%',
                borderCollapse: 'collapse',
                boxSizing: 'border-box'
            }}
            border="1"
            cellPadding="8"
        >
            <thead>
            <tr>
                <th style={{ textAlign: 'center' }}>#</th>
                <th style={{ textAlign: 'left' }}>상품 코드</th>
                <th style={{ textAlign: 'left' }}>이름</th>
                <th style={{ textAlign: 'center' }}>Depth</th>
                <th style={{ textAlign: 'center' }}>상위</th>
                <th style={{ textAlign: 'center' }}>정렬</th>
                <th style={{ textAlign: 'center' }}>사용</th>
                <th style={{ width: '220px', textAlign: 'center' }}>관리</th>
            </tr>
            </thead>

            <tbody>
            {categories.length === 0 && (
                <tr>
                    <td colSpan={8} align="center">
                        데이터가 없습니다.
                    </td>
                </tr>
            )}

            {categories.map((cat, idx) => (
                <tr
                    key={cat.categoryId}
                    style={
                        cat.depth === 1
                            ? {
                                backgroundColor: '#f3f6f3',
                                fontWeight: 600
                            }
                            : {}
                    }
                >
                    <td style={{ textAlign: 'center' }}>{startIndex + idx + 1}</td>
                    <td style={{ textAlign: 'left' }}>{cat.categoryCode}</td>
                    <td style={{ textAlign: 'left' }}>{cat.categoryName}</td>
                    <td style={{ textAlign: 'center' }}>{cat.depth === 1 ? '대분류' : '소분류'}</td>
                    <td style={{ textAlign: 'center' }}>{cat.parentId ?? '-'}</td>
                    <td style={{ textAlign: 'center' }}>{cat.sortOrder}</td>
                    <td style={{ textAlign: 'center' }}>{cat.isActive === 'Y' ? 'Y' : 'N'}</td>
                    <td style={{ textAlign: 'center' }}>
                        <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="center"
                        >
                            <Button
                                variant="contained"
                                size="small"
                                onClick={() => onEdit(cat)}
                            >
                                수정
                            </Button>
                            {/* 삭제 버튼 추가 */}
                            <Button
                                variant="contained"
                                size="small"
                                onClick={() => onDelete(cat.categoryId)}
                            >
                                삭제
                            </Button>
                            {/* 비활성화 버튼 추가 */}
                            {cat.isActive === 'Y' && (
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => onDeactivate(cat.categoryId)}
                                >
                                    비활성화
                                </Button>
                            )}

                        </Stack>
                    </td>

                </tr>
            ))}
            </tbody>
        </table>
    );
};

export default CategoryList;
