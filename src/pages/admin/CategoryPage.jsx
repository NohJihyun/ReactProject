import Grid from '@mui/material/Grid';
import { Box, Paper, Snackbar, Alert, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import CategoryList from '../../components/CategoryList';
import CategoryForm from '../../components/CategoryForm';
import * as api from '../../api/categoryApi';

export default function CategoryPage() {
    const [rows, setRows] = useState([]);
    const [selected, setSelected] = useState(null);
    const [toast, setToast] = useState({ open:false, msg:'', sev:'success' });

    //LIST
    const load = async () => {
        try {
            const data = await api.getCategories();               // <-- 배열만 들어옴
            const list = Array.isArray(data) ? data : (data?.content ?? []);
            setRows(list);
            console.log('categories:', list, list.length);
        } catch {
            setRows([]);
        }
    };

    useEffect(() => { load(); }, []);
   //INSERT
    const handleSave = async (form) => {
        try {
            if (selected?.categoryId) await api.updateCategory(selected.categoryId, form);
            else await api.createCategory(form);
            setSelected(null);
            await load();
            setToast({ open:true, msg:'저장 완료', sev:'success' });
        } catch {
            setToast({ open:true, msg:'저장 실패', sev:'error' });
        }
    };
    //DELETE
    const handleDelete = async (id) => {
        if (!window.confirm('삭제하시겠습니까?')) return;
        try {
            await api.deleteCategory(id);
            await load();
            setToast({ open:true, msg:'삭제 완료', sev:'success' });
        } catch {
            setToast({ open:true, msg:'삭제 실패', sev:'error' });
        }
    };

    return (
        <>
            {/* 위: 리스트 / 아래: 폼 — 세로 배치 */}
            <Grid container direction="column" spacing={2}>
                <Grid item>
                    <Paper sx={{ p:2 }}>
                        <Typography variant="h6" sx={{ mb:1 }}>카테고리 리스트</Typography>
                        {/* 가로 잘림 방지 */}
                        <Box sx={{ width:'100%', overflowX:'auto' }}>
                            <CategoryList
                                categories={rows}
                                onEdit={setSelected}
                                onDelete={handleDelete}
                            />
                        </Box>
                    </Paper>
                </Grid>
                {/* CategoryForm */}
                <Grid item>
                    {/* CategoryForm 안에 Paper가 이미 있으므로 바깥엔 Paper 안 씌움 */}
                    <CategoryForm
                        selected={selected}
                        onSave={handleSave}
                        cancelEdit={() => setSelected(null)}
                    />
                </Grid>
            </Grid>

            <Snackbar
                open={toast.open}
                autoHideDuration={2000}
                onClose={()=>setToast(s=>({ ...s, open:false }))}
            >
                <Alert severity={toast.sev} variant="filled">{toast.msg}</Alert>
            </Snackbar>
        </>
    );
}
