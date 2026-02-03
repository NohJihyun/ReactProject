import Grid from '@mui/material/Grid';
import {
    Box, Paper, Snackbar, Alert, Typography,
    Button, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem, Switch, FormControlLabel, Stack
} from '@mui/material';
import { useEffect, useState } from 'react';
import CategoryList from '../../components/CategoryList';
//import CategoryForm from '../../components/CategoryForm';
import * as api from '../../api/categoryApi';

export default function CategoryPage() {
    const [rows, setRows] = useState([]);       // 카테고리 목록
    const [selected, setSelected] = useState(null);   // 등록 OR 수정을 체크하는 상태, NULL 수정대상이 없다, 선택된 카테고리가 없음.
    //const [open, setOpen] = useState(false);  // 폼 UI 제어자 Dialog 초기상태 열고,닫힘 컨트롤
    const [toast, setToast] = useState({ open:false, msg:'', sev:'success' }); // 서버응답
    //const [filterOpen, setFilterOpen] = useState(false);  검색필터상태 ＝＞ 인라인토글 방식이 있음 한페이지 안에서 열기／닫기 상태로 제어
    //const [searchOpen, setSearchOpen] = useState(false); //검색상태
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState(null); //Dialog 타이틀 상태 등록,수정,검색을 컨트롤

    /* API 영역 */
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
            setDialogOpen(false);
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

    /* STATE 영역 */
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

    /* =========================
   SEARCH STATE
    ========================= */
    const [search, setSearch] = useState({
        depth: '',
        parentId: '',
        isActive: '',
        keyword: ''
    });

    /* 이벤트 핸들러 영역 */
    /* =========================
       카테고리 등록 대분류, 소분류  HANDLER
    ========================= */
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
       카테고리페이지 검색  HANDLER
    ========================= */
    const handleSearchChange = (e) => {
        setSearch({
            ...search,
            [e.target.name]: e.target.value
        });
    };
    const handleSearch = () => {
        load(); // 다음 단계에서 search 파라미터 연결
    };
    /* =========================
       카테고리페이지 다이얼로그  HANDLER
    ========================= */
    const closeDialog = () => {
        setDialogOpen(false);
        setDialogMode(null);
    };

    /* =========================
    RENDER
 ========================= */
    return (
        /* div translate 활용해 번역 비활성화 시킴 */
        <div translate="no">
            <Grid container direction="column" spacing={2}>
                <Grid item>
                    <Paper sx={{ p:2 }}>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 1
                        }}>
                            <Typography variant="h6">
                                카테고리{' '}리스트 {/* {' '} JSX 공백을 따로 추가 해야함 */}
                            </Typography>

                        <Stack direction="row" spacing={1}>
                            <Button
                                variant="contained"
                                onClick={() => {
                                    setDialogMode('search');
                                    setDialogOpen(true);
                                }}
                            >
                                검색
                            </Button>

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
                                    setDialogMode('create');
                                    setDialogOpen(true);
                                }}
                            >
                                카테고리 등록
                            </Button>
                          </Stack>
                        </Box>

                        {/* 부 -> 자 props  categories -> 데이터 props onEdit -> 함수 props key : value 전달 */}
                        <Box sx={{ width:'100%', overflowX:'auto' }}>
                            <CategoryList
                                categories={rows}
                                onEdit={(row) => {
                                    setSelected(row);    // useEffect 실행 (값이변경됨.)
                                    setDialogMode('edit');
                                    setDialogOpen(true);
                                }}
                                onDeactivate={handleDeactivate}
                            />
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
           {/* =========================
            DIALOG
            ========================= */}
            <Dialog
                key={dialogMode} // dialogMode가 변경될때마다 기존 dialog를 완전 지우고 새로생성 충돌해결
                open={dialogOpen}
                onClose={closeDialog}
                fullWidth
            >
                {/* ===== Dialog Title ===== */}
                <DialogTitle>
                    {dialogMode === 'create' && '카테고리 등록'}
                    {dialogMode === 'edit' && '카테고리 수정'}
                    {dialogMode === 'search' && '카테고리 검색'}
                </DialogTitle>
                {/* ===== Dialog Content ===== */}
                <DialogContent>
                    {/*
                     중요 포인트
                    dialogOpen이 true일 때만 Dialog 내부 콘텐츠를 렌더링한다.
                    → Dialog 닫히는 순간 내부 JSX가 동시에 변경되며
                    removeChild 에러가 나는 문제를 원천 차단
                    */}
                    {dialogOpen && (
                        <>
                            {/* =========================
                                    등록 / 수정
                                    ✔ dialogMode === 'create' | 'edit' 일 때만 렌더
                            ========================= */}
                            {(dialogMode === 'create' || dialogMode === 'edit') && (
                                <>
                                    <TextField
                                        select
                                        name="depth"
                                        label="분류"
                                        value={form.depth}
                                        onChange={change}
                                        fullWidth
                                        margin="normal"
                                        disabled={dialogMode === 'edit'}
                                    >
                                        <MenuItem value={1}>대분류</MenuItem>
                                        <MenuItem value={2}>소분류</MenuItem>
                                    </TextField>

                                    {form.depth === 2 && (
                                        <TextField
                                            select
                                            name="parentId"
                                            label="상위 카테고리"
                                            value={form.parentId ?? ''}
                                            onChange={change}
                                            fullWidth
                                            margin="normal"
                                            disabled={dialogMode === 'edit'}
                                        >
                                            {parents.map(p => (
                                                <MenuItem key={p.categoryId} value={p.categoryId}>
                                                    {p.categoryName}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    )}

                                    <TextField
                                        name="categoryCode"
                                        label="카테고리 코드"
                                        value={form.categoryCode}
                                        onChange={change}
                                        fullWidth
                                        margin="normal"
                                        disabled={dialogMode === 'edit'}
                                    />

                                    <TextField
                                        name="categoryName"
                                        label="카테고리명"
                                        value={form.categoryName}
                                        onChange={change}
                                        fullWidth
                                        margin="normal"
                                    />

                                    <TextField
                                        name="sortOrder"
                                        label="정렬 순서"
                                        type="number"
                                        value={form.sortOrder}
                                        onChange={change}
                                        fullWidth
                                        margin="normal"
                                    />

                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={form.isActive === 'Y'}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        isActive: e.target.checked ? 'Y' : 'N'
                                                    })
                                                }
                                            />
                                        }
                                        label="사용 여부"
                                    />
                                </>
                            )}

                            {/* =========================
                                검색
                                ✔ dialogMode === 'search' 일 때만 렌더
                            ========================= */}
                            {dialogMode === 'search' && (
                                <Stack spacing={2} mt={1}>
                                    <TextField
                                        select
                                        label="분류"
                                        name="depth"
                                        value={search.depth}
                                        onChange={handleSearchChange}
                                    >
                                        <MenuItem value="">전체</MenuItem>
                                        <MenuItem value={1}>대분류</MenuItem>
                                        <MenuItem value={2}>소분류</MenuItem>
                                    </TextField>

                                    <TextField
                                        select
                                        label="상위 카테고리"
                                        name="parentId"
                                        value={search.parentId}
                                        onChange={handleSearchChange}
                                    >
                                        <MenuItem value="">전체</MenuItem>
                                        {parents.map(p => (
                                            <MenuItem key={p.categoryId} value={p.categoryId}>
                                                {p.categoryName}
                                            </MenuItem>
                                        ))}
                                    </TextField>

                                    <TextField
                                        select
                                        label="사용여부"
                                        name="isActive"
                                        value={search.isActive}
                                        onChange={handleSearchChange}
                                    >
                                        <MenuItem value="">전체</MenuItem>
                                        <MenuItem value="Y">사용</MenuItem>
                                        <MenuItem value="N">미사용</MenuItem>
                                    </TextField>

                                    <TextField
                                        label="검색어"
                                        name="keyword"
                                        placeholder="이름 / 코드"
                                        value={search.keyword}
                                        onChange={handleSearchChange}
                                    />
                                </Stack>
                            )}
                        </>
                    )}
                </DialogContent>


                {/* ===== Dialog Actions ===== */}
                <DialogActions>
                    <Button onClick={closeDialog}>취소</Button>

                    {(dialogMode === 'create' || dialogMode === 'edit') && (
                        <Button variant="contained" onClick={() => handleSave(form)}>
                            저장
                        </Button>
                    )}

                    {dialogMode === 'search' && (
                        <Button
                            variant="contained"
                            onClick={() => {
                                handleSearch();
                                closeDialog();
                            }}
                        >
                            검색
                        </Button>
                    )}
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
        </div>
    );
}
