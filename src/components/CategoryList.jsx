// 목록/수정/삭제
import React from 'react';

const CategoryList = ({ categories = [], onEdit, onDelete }) => {
    /* 액트에서 배열 데이터를 JSX로 변환해서 화면에 뿌리는 전형적인 패턴
    * 순수자바스크립트 배열 메서드,
    * Map() : 배열메서드, 원본 배열 하나씩 순회하면서 각 요소를 변환한 새 배열로 만드는 함수.
    * 배열 (여기서는 카테고리 목록)
    *  React는 배열을 그대로 렌더링 가능하므로 <tbody> 안에 여러 <tr>이 생김
    *  즉, 브라우저가 jsx 문법을 읽지못해 웹팩+바벨이 먼저 읽어서 브라우저가 읽을수 있게 순수 자바스크립트 코드로 변환시키는것
    * map은 "배열 속 모든 걸 변신시켜서 새 배열로 만들어주는 마법"
    * React에서는 그 “새 배열”이 HTML 태그(=JSX)로 바뀌어 화면에 나온다.
    * 옛방식은 배열 > for 문돌려 데이터를 꺼내서 사용했으면 > Map은 “배열 속 데이터 하나씩 꺼내서 → 가공 → 새 배열에 담는” 과정을 자동으로 해주는 배열 전용 함수다.
    */
    return (
        <table
            style={{ width:'100%', tableLayout:'auto', borderCollapse:'collapse', boxSizing:'border-box' }}
            border="1"
            cellPadding="8"
        >
            <thead>
            <tr><th>ID</th><th>이름</th><th>설명</th><th>작업</th></tr>
            </thead>
            <tbody>
            {(!categories || categories.length === 0) && (
                <tr><td colSpan={4}>데이터가 없습니다.</td></tr>
            )}
            {categories.map(cat => (
                <tr key={cat.categoryId}>
                    <td>{cat.categoryId}</td>
                    <td>{cat.name}</td>
                    <td>{cat.description}</td>
                    <td>
                        <button onClick={() => onEdit(cat)}>수정</button>
                        <button onClick={() => onDelete(cat.categoryId)}>삭제</button>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    );
};

export default CategoryList;
