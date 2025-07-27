// 목록/수정/삭제
import React from 'react';

const CategoryList = ({ categories, onEdit, onDelete }) => {
    return (
        <table border="1" cellPadding="8">
            <thead>
            <tr><th>ID</th><th>이름</th><th>설명</th><th>작업</th></tr>
            </thead>
            <tbody>
            {categories.map(cat => (
                <tr key={cat.categoryId}>
                    <td>{cat.categoryId}</td>
                    <td>{cat.name}</td>
                    <td>{cat.description}</td>
                    <td>
                        <button onClick={() => onEdit(cat)}>수정</button>
                        <button onClick={() => onDelete(cat.category_id)}>삭제</button>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    );
};

export default CategoryList;
