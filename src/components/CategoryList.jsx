import React from 'react';

const CategoryList = ({ categories = [], onEdit, onDeactivate }) => {
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
                <th>ID</th>
                <th>코드</th>
                <th>이름</th>
                <th>Depth</th>
                <th>상위</th>
                <th>정렬</th>
                <th>사용</th>
                <th>관리</th>
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

            {categories.map(cat => (
                <tr key={cat.categoryId}>
                    <td>{cat.categoryId}</td>
                    <td>{cat.categoryCode}</td>
                    <td>{cat.categoryName}</td>
                    <td>{cat.depth === 1 ? '대분류' : '소분류'}</td>
                    <td>{cat.parentId ?? '-'}</td>
                    <td>{cat.sortOrder}</td>
                    <td>{cat.isActive === 'Y' ? 'Y' : 'N'}</td>
                    <td>
                        <button onClick={() => onEdit(cat)}>
                            수정
                        </button>
                        {' '}
                        {cat.isActive === 'Y' && (
                            <button onClick={() => onDeactivate(cat.categoryId)}>
                                비활성화
                            </button>
                        )}
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    );
};

export default CategoryList;
