import Grid from '@mui/material/Grid';
import {
    Box, Paper, Snackbar, Alert, Typography,
    Button, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem, Switch, FormControlLabel
} from '@mui/material';
import { useEffect, useState } from 'react';
import CategoryList from '../../components/CategoryList';
import CategoryForm from '../../components/CategoryForm';
import * as api from '../../api/categoryApi';

export default function CategoryPage() {
    const [rows, setRows] = useState([]);       // 카테고리 목록
    const [selected, setSelected] = useState(null);   // 등록 OR 수정을 체크하는 상태, NULL 수정대상이 없다.
    const [open, setOpen] = useState(false);  // 폼 UI 제어자 
    const [toast, setToast] = useState({ open:false, msg:'', sev:'success' }); // 서버응답

    //비동기 통신
    /* =========================
     LIST API
    ========================= */
    //백단에서 return json 배열 , 앞단에서 [] 배열 처리후 세터함수로 화면 렌더
    const load = async () => {
        try {
            const data = await api.getCategories();                                      //서버에서 응답된 데이터 할당, json 배열만 들어옴
            const list = Array.isArray(data) ? data : (data?.content ?? []);     //방어코드 어떠한 형태로오든 결국 list => [] 배열로 만듬, content 페이징처리 미리예방
            setRows(list);                                                              //list에 담긴 데이터를 useState로 상태값 변경
            console.log('categories:', list, list.length);
        } catch {
            setRows([]);                                                          //화면이 터지지 않게 아닐시 빈배열로 만들어둠
        }
    };

    //useEffect는 첫 렌더링이 끝난 뒤에 (해야 할 일을) 지시하는 훅이다. => 1.서버에서 데이터 요청 2.자동으로 수행해야될 다음작업 
    //의존성 배열이 빈 배열이면 useEffect 안의 함수는 한 번만 실행되고, 의존성 배열 안에 변수가 있으면 그 변수가 바뀔 때마다 실행된다.
    useEffect(() => { load(); }, []);

    /* =========================
     SAVE (CREATE / UPDATE) API
  ========================= */
    const handleSave = async (form) => {
        try {
            if (selected?.categoryId) {
                await api.updateCategory(selected.categoryId, form);
            } else {
                await api.createCategory(form);
            }                        // 함수의 판단 기준은 데이터가 아닌 상태 STATE
            setSelected(null); // NULL은 수정대상 없음을 의미 -> 등록
            setOpen(false);    // 작업 종료 선언
            await load();
            setToast({ open:true, msg:'저장 완료', sev:'success' });
        } catch {
            setToast({ open:true, msg:'저장 실패', sev:'error' });
        }
    };

    //DELETE
    //카테고리 삭제 x
    //비활성화로 변경
    /* =========================
     DEACTIVATE (is_active = N) API
  ========================= */
    const handleDeactivate = async (id) => {
        if (!window.confirm('비활성화 하시겠습니까?')) return;
        try {
            await api.deactivateCategory(id);
            await load();
            setToast({ open:true, msg:'비활성화 완료', sev:'success' });
        } catch {
            setToast({ open:true, msg:'비활성화 실패', sev:'error' });
        }
    };

    /* =========================
      FORM STATE
   ========================= */
    const isEdit = !!selected;

    const [form, setForm] = useState({
        depth: 1,
        parentId: null,
        categoryCode: '',
        categoryName: '',
        sortOrder: 0,
        isActive: 'Y'
    });

    useEffect(() => {
        if (selected) {
            setForm({
                depth: selected.depth,
                parentId: selected.parentId,
                categoryCode: selected.categoryCode,
                categoryName: selected.categoryName,
                sortOrder: selected.sortOrder,
                isActive: selected.isActive
            });
        }
    }, [selected]);

    const change = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const parents = rows.filter(r => r.depth === 1 && r.isActive === 'Y');

    /* =========================
    RENDER
 ========================= */
    return (
        <>
            <Grid container direction="column" spacing={2}>
                <Grid item>
                    <Paper sx={{ p:2 }}>
                        <Box sx={{ display:'flex', justifyContent:'space-between', mb:1 }}>
                            <Typography variant="h6">
                                카테고리{' '}리스트 {/* {' '} JSX 공백을 따로 추가 해야함 */}
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={() => {
                                    setSelected(null);
                                    setForm({
                                        depth: 1,
                                        parentId: null,
                                        categoryCode: '',
                                        categoryName: '',
                                        sortOrder: 0,
                                        isActive: 'Y'
                                    });
                                    setOpen(true);
                                }}
                            >
                                카테고리 등록
                            </Button>
                        </Box>

                        <Box sx={{ width:'100%', overflowX:'auto' }}>
                            <CategoryList
                                categories={rows}
                                onEdit={(row) => {
                                    setSelected(row);
                                    setOpen(true);
                                }}
                                onDeactivate={handleDeactivate}
                            />
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* =========================
               CATEGORY FORM (DIALOG) , 등록폼
            ========================= */}
            <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
                <DialogTitle>{isEdit ? '카테고리 수정' : '카테고리 등록'}</DialogTitle>
                <DialogContent>

                    {/* depth */}
                    <TextField
                        select
                        name="depth"
                        label="분류"
                        value={form.depth}
                        onChange={change}
                        fullWidth
                        margin="normal"
                        disabled={isEdit}
                    >
                        <MenuItem value={1}>대분류</MenuItem>
                        <MenuItem value={2}>소분류</MenuItem>
                    </TextField>

                    {/* parent */}
                    {form.depth === 2 && (
                        <TextField
                            select
                            name="parentId"
                            label="상위 카테고리"
                            value={form.parentId ?? ''}
                            onChange={change}
                            fullWidth
                            margin="normal"
                            disabled={isEdit}
                        >
                            {parents.map(p => (
                                <MenuItem key={p.categoryId} value={p.categoryId}>
                                    {p.categoryName}
                                </MenuItem>
                            ))}
                        </TextField>
                    )}

                    {/* code */}
                    <TextField
                        name="categoryCode"
                        label="카테고리 코드"
                        value={form.categoryCode}
                        onChange={change}
                        fullWidth
                        margin="normal"
                        disabled={isEdit}
                    />

                    {/* name */}
                    <TextField
                        name="categoryName"
                        label="카테고리명"
                        value={form.categoryName}
                        onChange={change}
                        fullWidth
                        margin="normal"
                    />

                    {/* sort */}
                    <TextField
                        name="sortOrder"
                        label="정렬 순서"
                        type="number"
                        value={form.sortOrder}
                        onChange={change}
                        fullWidth
                        margin="normal"
                    />

                    {/* active */}
                    <FormControlLabel
                        control={
                            <Switch
                                checked={form.isActive === 'Y'}
                                onChange={(e) =>
                                    setForm({ ...form, isActive: e.target.checked ? 'Y' : 'N' })
                                }
                            />
                        }
                        label="사용 여부"
                    />

                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>취소</Button>
                    <Button variant="contained" onClick={() => handleSave(form)}>
                        저장
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={toast.open}
                autoHideDuration={2000}
                onClose={()=>setToast(s=>({ ...s, open:false }))}
            >
                <Alert severity={toast.sev} variant="filled">
                    {toast.msg}
                </Alert>
            </Snackbar>
        </>
    );
}
