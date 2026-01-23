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

    //비동기
    //LIST
    //백단에서 return json 배열 , 앞단에서 [] 배열 처리후 세터함수로 화면 렌더
    const load = async () => {
        try {
            const data = await api.getCategories();                                      //서버에서 응답된 데이터 할당, json 배열만 들어옴
            const list = Array.isArray(data) ? data : (data?.content ?? []);   //방어코드 어떠한 형태로오든 결국 list => [] 배열로 만듬, content 페이징처리 미리예방
            setRows(list);                                                              //list에 담긴 데이터를 useState로 상태값 변경
            console.log('categories:', list, list.length);
        } catch {
            setRows([]);                                                          //화면이 터지지 않게 아닐시 빈배열로 만들어둠
        }
    };

    //useEffect는 첫 렌더링이 끝난 뒤에 (해야 할 일을) 지시하는 훅이다. => 1.서버에서 데이터 요청 2.자동으로 수행해야될 다음작업 
    //의존성 배열이 빈 배열이면 useEffect 안의 함수는 한 번만 실행되고, 의존성 배열 안에 변수가 있으면 그 변수가 바뀔 때마다 실행된다.
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
