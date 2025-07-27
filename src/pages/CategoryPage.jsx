// 전체 컨테이너
// React 라이브러리와 훅(Hook) 불러오기
import React, { useState, useEffect } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api/categoryApi';
import CategoryForm from '../components/CategoryForm';
import CategoryList from '../components/CategoryList';

// 카테고리페이지 컴포넌트 
const CategoryPage = () => {
    // 즉, 사용자 입력이나 서버 응답에 따라 UI가 바뀐다.
    // STATE : **React 컴포넌트 안에서 "변경되면 화면이 다시 렌더링되는 값"**을 말해요.
    // 그래서 React는 useState()를 사용해서 "반응형 데이터"를 만들어요.
    // state	컴포넌트 내에서 화면 렌더링에 영향을 주는 변수
    // useState()	상태를 만들기 위한 React Hook
    // setState 함수	상태를 업데이트하면, 컴포넌트가 자동으로 다시 렌더링됨
    // state는 값이 바뀌면 자동으로 화면(UI)을 다시 그려주는 특별한 변수이다.
    // 1. 사용자 입력값 2. 서버응답값 3. UI상태값 모달열기 4. 내부 계산 값 카운트 값
    // 초기값 [] , NULL 선택된 카테고리 (수정할 항목) 저장하는 선택
    // 초기값: 컴포넌트가 처음 렌더링될 때 state로 사용할 기본값
    //✅ **useState(초기값)은 그냥 "처음에 상태값을 무엇으로 시작할지 셋팅하는 것"**이라고 생각하시면 됩니다.

    const [categories, setCategories] = useState([]);
    const [selected, setSelected] = useState(null);

    // ✅ 비동기 api 통신  ==> 목록 불러오기 axios GET 요청
    // ✅ <CategoryList /> ==> 리스트를 리스트 컴포넌트에게 전달.
    const fetchCategories = async () => {
        const res = await getCategories();
        setCategories(res.data);
    };
    //✅ handleSave – 등록 또는 수정 처리
    const handleSave = async (data) => {
        if (selected) {
            await updateCategory({ ...data, category_id: selected.category_id });
        } else {
            await createCategory(data);
        }
        setSelected(null);
        fetchCategories();
    };
    //✅ handleSave – 삭제 처리
        const handleDelete = async (id) => {
        await deleteCategory(id);
        fetchCategories();
    };

    // ✅ 화면이 처음 나타났을때 실행할 코드
    // useEffect(() => {}, [])	컴포넌트가 처음 마운트될 때 1번 실행
    // []"의존성 배열" → 아무것도 없으면 딱 1번만 실행됨
    // ✅ 클래스형 컴포넌트에서의 라이프사이클 메서드들을
    // ✅ 함수형 컴포넌트에서는 useEffect Hook을 사용해서 처리합니다.

    //📘 정리: 클래스형 vs 함수형
    // 라이프사이클 시점	            클래스형 컴포넌트 메서드	    함수형 컴포넌트 대체 방법
    // 컴포넌트가 처음 마운트될 때	    componentDidMount()	        useEffect(() => { ... }, [])
    // 컴포넌트가 업데이트될 때	        componentDidUpdate()	    useEffect(() => { ... }, [의존성])
    // 컴포넌트가 언마운트될 때 (제거)	componentWillUnmount()      useEffect(() => { return () => {...} }, [])

    useEffect(() => {
        fetchCategories();
    }, []);

    // ✅ 바로 지금 말씀하신 게 **React에서 핵심 개념 중 하나인 props(프롭스)**입니다.
    // ✅ props는 부모 컴포넌트가 자식 컴포넌트에게 데이터를 전달하는 방법입니다.
    // ✅ 🔽 props는 "값"이라면 뭐든지 내려줄 수 있습니다. , 상태, 함수, 리터럴 값, 객체, 배열, 블린, 컴포넌트자체, 함수 결과값
    // ✅ 여기 JSX 에서 내려준 PROPS 는 handleSave 함수, selected 상태 , cancelEdit 화살표 함수
    return (
        <div style={{ padding: 20 }}>
            <h2>📁 카테고리 관리</h2>
            <CategoryForm onSave={handleSave} selected={selected} cancelEdit={() => setSelected(null)} />
            <CategoryList categories={categories} onEdit={setSelected} onDelete={handleDelete} />
        </div>
    );
};

export default CategoryPage;

