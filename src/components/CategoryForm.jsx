// src/components/CategoryForm.jsx
import React, { useEffect, useState } from 'react';
// mui
import {
    Button,
    TextField,
    Container,
    Typography,
    Paper,
    Stack,
} from '@mui/material';

const CategoryForm = ({ onSave, selected, cancelEdit }) => {
    const [form, setForm] = useState({ name: '', description: '' });

    useEffect(() => {
        if (selected) setForm({ name: selected.name ?? '', description: selected.description ?? '' });
        else setForm({ name: '', description: '' });
    }, [selected]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(form);
    };

    const handleCancel = () => {
        cancelEdit?.();
    };

    return (
        <Container maxWidth={false} disableGutters sx={{ mb: 2 }}>
            <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    {selected ? '카테고리 수정' : '카테고리 등록'}
                </Typography>

                <form onSubmit={handleSubmit} noValidate>
                    <Stack spacing={2}>
                        <TextField
                            label="카테고리명"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            fullWidth
                        />

                        <TextField
                            label="설명"
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            fullWidth
                            multiline
                            minRows={2}
                        />

                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                            {selected && (
                                <Button variant="outlined" type="button" onClick={handleCancel}>
                                    취소
                                </Button>
                            )}
                            <Button variant="contained" type="submit">
                                {selected ? '수정' : '등록'}
                            </Button>
                        </Stack>
                    </Stack>
                </form>
            </Paper>
        </Container>
    );
};

export default CategoryForm;
