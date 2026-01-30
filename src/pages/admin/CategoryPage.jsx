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
    const [selected, setSelected] = useState(null);   // 등록 OR 수정을 체크하는 상태, NULL 수정대상이 없다, 선택된 카테고리가 없음.
    const [open, setOpen] = useState(false);  // 폼 UI 제어자 Dialog 초기상태 열고,닫힘 컨트롤
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
    //초기상태 선언은 selected === null
    //등록인지, 수정인지 체크하는 모드설정
    //즉 !!는 "이 값이 의미 있는 값인가 ?" 를 true/false로 바꾸기위한 js 문법
    //null은 JS에서 ‘없음’을 의미하는 falsy 값이고, !!는 그걸 boolean으로 바꿔주는 도구다.
    const isEdit = !!selected;

    const [form, setForm] = useState({
        depth: 1,
        parentId: null,
        categoryCode: '',
        categoryName: '',
        sortOrder: 0,
        isActive: 'Y'
    });

    //selected 값이 변경될때 마다 실행
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
    }, [selected]); // [selected] : selected 값 변경될시에만 useEffect 실행
    
    //입력변경
    //초기 form state 객체 {}
    //...form 기존폼 state 복사 (불변성유지)
    //[e.target.name] 입력폼에 key : e.target.value 값  key : 값 형태
    //입력 필드의 name에 해당하는 값만 새 value로 변경
    const change = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    //카테고리 목록중 부모 체크
    //filter 배열에서 조건 만족하는것만 골라서 새배열로 만든다.
    //[ {}, {} ] => r: 알은 배열안 객체 요소하나를 의미
    //대분류이면서 사용 중인 카테고리를 의미
    //상위카테고리에 사용될 목록
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
                                    setSelected(null); // 수정상태없음 -> 등록폼
                                    setForm({
                                        depth: 1,
                                        parentId: null,
                                        categoryCode: '',
                                        categoryName: '',
                                        sortOrder: 0,
                                        isActive: 'Y'
                                    });
                                    setOpen(true); // Dialog 열고,닫힘 초기상태 컨트롤함
                                }}
                            >
                                카테고리 등록
                            </Button>
                        </Box>

                        <Box sx={{ width:'100%', overflowX:'auto' }}>
                            <CategoryList
                                categories={rows}
                                onEdit={(row) => {
                                    setSelected(row);    // useEffect 실행 (값이변경됨.)
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
                        name="depth"            //key 
                        label="분류"
                        value={form.depth}     //화면에 보이는 값이 => state => value 보여짐
                        onChange={change}
                        fullWidth
                        margin="normal"
                        disabled={isEdit}
                    >
                        <MenuItem value={1}>대분류</MenuItem>
                        <MenuItem value={2}>소분류</MenuItem>
                    </TextField>

                    {/* parent
                        depth : 2 소분류
                    */}
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
                            {/*
                                “객체 배열 데이터를 select box에서 사용할 수 있는 UI 구조(JSX)로 변환했다.”
                                parents.map <MenuItem> 옵션들로 변경
                                즉, 배열에 들어있는 카테고리 객체 항목을
                                [
                                  { categoryId: 1, categoryName: '전자제품', depth: 1 },
                                  { categoryId: 2, categoryName: '가구', depth: 1 }
                                ]

                                selectbox 안에 들어갈 메뉴 항목 하나씩 변경 => UI 표현만 변경.
                                [
                                    <MenuItem value={1}>전자제품</MenuItem>,
                                    <MenuItem value={2}>가구</MenuItem>
                                ]
                            */}
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
