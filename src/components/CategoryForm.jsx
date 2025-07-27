// src/components/CategoryForm.jsx
import React, { useEffect, useState } from 'react';

const CategoryForm = ({ onSave, selected, cancelEdit }) => {
    const [form, setForm] = useState({ name: '', description: '' });

    useEffect(() => {
        if (selected) setForm(selected);
        else setForm({ name: '', description: '' });
    }, [selected]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(form);
    };

    return (
        <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
            <input name="name" value={form.name} onChange={handleChange} placeholder="카테고리명" required />
            <input name="description" value={form.description} onChange={handleChange} placeholder="설명" />
            <button type="submit">{selected ? '수정' : '등록'}</button>
            {selected && <button type="button" onClick={cancelEdit}>취소</button>}
        </form>
    );
};

export default CategoryForm;
