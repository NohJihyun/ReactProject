import Grid from '@mui/material/Grid';
import {
    Box, Paper, Snackbar, Alert, Typography,
    Button, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem, Switch, FormControlLabel, Stack
} from '@mui/material';
import { useEffect, useState } from 'react';
import CategoryList from '../../components/CategoryList';
import * as api from '../../api/categoryApi';
import Pagination from '@mui/material/Pagination';

export default function CategoryPage() {
    /* STATE 영역 */
    const [rows, setRows] = useState([]);       // 카테고리 목록
    const [selected, setSelected] = useState(null);   // 등록 OR 수정을 체크하는 상태, NULL 수정대상이 없다, 선택된 카테고리가 없음.
    const [toast, setToast] = useState({ open:false, msg:'', sev:'success' }); // 서버응답
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState(null); //Dialog 타이틀 상태 등록,수정,검색을 컨트롤
    const [pageInfo, setPageInfo] = useState({
        page: 1,
        size: 10,
        totalPages: 0,
        totalElements: 0
    }); // 페이지네이션 상태
    //대분류 상태
    const [parentOptions, setParentOptions] = useState([]);
    /* =========================
        SEARCH STATE
   ========================= */
    const [search, setSearch] = useState({
        depth: '',
        parentId: '',   // 소분류 선택시 내부적으로만 사용
        categoryId: '', // depth=1 이면 대분류, depth=2이면 소분류
        isActive: '',
        keyword: ''
    });
    /* =========================
      FORM STATE
   ========================= */
    //초기상태 선언은 selected === null
    //등록인지, 수정인지 체크하는 모드설정
    //즉 !!는 "이 값이 의미 있는 값인가 ?" 를 true/false로 바꾸기위한 js 문법
    //null은 JS에서 ‘없음’을 의미하는 falsy 값이고, !!는 그걸 boolean으로 바꿔주는 도구다.
    //const isEdit = !!selected;
    const [form, setForm] = useState({
        depth: 1,
        parentId: null,
        categoryCode: '',
        categoryName: '',
        sortOrder: 0,
        isActive: 'Y'
    });
    /* =========================
     초기화 STATE
  ========================= */
    const initialSearch = {
        depth: '',
        parentId: '',
        categoryId: '',
        isActive: '',
        keyword: ''
    };

    /* API 영역 */
    /* =========================
     LIST API
     및
     검색조건 => searchParam
     페이지네이션 => 페이지 정보
    ========================= */
    //백단에서 return json 배열 , 앞단에서 [] 배열 처리후 세터함수로 화면 렌더
    const load = async (searchParam = search, page = 1) => {
        try {
            const cleanedSearch = Object.fromEntries(
                Object.entries(searchParam)
                    .filter(([_, v]) => v !== '' && v !== null)
            );

            const data = await api.getCategories({
                ...cleanedSearch,
                page,
                size: pageInfo.size
            });

            //  여기 핵심
            setRows(data.list ?? []);

            setPageInfo({
                page: data.page,
                size: data.size,
                totalPages: data.totalPage,
                totalElements: data.totalCount
            });

        } catch (e) {
            console.error(e);
            setRows([]);
        }
    };


    //최조진입
    //useEffect는 첫 렌더링이 끝난 뒤에 (해야 할 일을) 지시하는 훅이다. => 1.서버에서 데이터 요청 2.자동으로 수행해야될 다음작업
    //의존성 배열이 빈 배열이면 useEffect 안의 함수는 한 번만 실행되고, 의존성 배열 안에 변수가 있으면 그 변수가 바뀔 때마다 실행된다.
    //페이지네이션
    useEffect(() => {
        load(search, 1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 검색다이얼로그 => rows 변화와 무관 => 초기1회 로딩
    useEffect(() => {
        (async () => {
            try {
                const data = await api.getCategories({
                    depth: 1,
                    isActive: 'Y',
                    page: 1,
                    size: 1000
                });
                setParentOptions(data.list ?? []);
            } catch (e) {
                console.error(e);
                setParentOptions([]);
            }
        })();
    }, []);

    /* =========================
     SAVE (CREATE / UPDATE) API
  ========================= */
    const handleSave = async (form) => {
        // 0) 프론트 기본 검증
        const msg = validateForm(form);
        if (msg) {
            setToast({ open: true, msg, sev: "warning" });
            return;
        }

        // ********* 저장 모드 고정
        const editing = !!selected?.categoryId;

        try {
            // 1) 서버 중복 체크 (categoryCode + sortOrder)
            // 수정일 때는 자기 자신 제외(excludeId)
            await api.checkCategoryDuplicate({
                depth: Number(form.depth),
                parentId: form.depth === 2 ? form.parentId : null,
                sortOrder: Number(form.sortOrder),
                excludeId: editing ? selected?.categoryId : null
            });
            // 2)저장
            if (editing) {
                await api.updateCategory(selected.categoryId, form);
            } else {
                await api.createCategory(form);
            }                        // 함수의 판단 기준은 데이터가 아닌 상태 STATE
            setSelected(null); // NULL은 수정대상 없음을 의미 -> 등록
            setDialogOpen(false);
            await load(search);      //검색조건유지
            setToast({
                open: true,
                msg: editing ? '카테고리가 수정되었습니다.' : '카테고리가 등록되었습니다.',
                sev: 'success'
            });
        } catch (error) {
            // 3) 중복이면 서버가 409를 주도록 만들 거야
            const status = error?.response?.status;
            const serverMsg = error?.response?.data?.message;

            if (status === 409) {
                setToast({
                    open: true,
                    msg: serverMsg || "해당 카테고리에서 이미 사용 중인 정렬 순서입니다.",
                    sev: "error"
                });
                return;
            }

            setToast({
                open: true,
                msg: '저장에 실패했습니다.',
                sev: 'error'
            });
        }
    };

    //DELETE 비활성화 논리
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
    //등록,수정 대분류 = > 상위카테고리 사용할 목록
    //const parents = rows.filter(r => r.depth === 1 && r.isActive === 'Y');

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
        const fixedSearch = { ...search };

        //  카테고리 선택 = 항상 하위 검색
        if (fixedSearch.categoryId) {
            fixedSearch.parentId = fixedSearch.categoryId;
            delete fixedSearch.categoryId;

            // depth가 없거나 대분류면 → 소분류로 자동 전환
            if (!fixedSearch.depth || Number(fixedSearch.depth) === 1) {
                fixedSearch.depth = 2;
            }
        }

        load(fixedSearch, 1);
    };

    /* =========================
       카테고리페이지 다이얼로그  HANDLER
    ========================= */
    const closeDialog = () => {
        setDialogOpen(false);
        setDialogMode(null);
    };

    const modeHelp =
        dialogMode === 'edit' ? '카테고리 정보를 수정합니다.' :
        dialogMode === 'search' ? '조건을 선택해서 검색합니다.' : '';

    /* =========================
       카테고리페이지 삭제 HANDLER
    ========================= */
    const handleDelete = async (id) => {
        if (!window.confirm('정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            return;
        }

        try {
            await api.deleteCategory(id);
            await load(search); // 현재 검색 조건 유지
            setToast({ open: true, msg: '삭제되었습니다.', sev: 'success' });
        } catch {
            setToast({ open: true, msg: '삭제에 실패했습니다.', sev: 'error' });
        }
    };

    /* =========================
       카테고리페이지 벨리데인션 검증 HANDLER
    ========================= */
    // 기본 검증 함수 추가 (CategoryPage 내부)
    const validateForm = (f) => {
        // 1) depth
        if (![1, 2].includes(Number(f.depth))) {
            return "분류(depth)를 선택해주세요";
        }

        // 2) 소분류면 parentId 필수
        if (Number(f.depth) === 2 && (f.parentId === null || f.parentId === "")) {
            return "소분류는 상위 카테고리를 선택해야 합니다";
        }

        // 3) categoryCode 필수 (등록 시에만 입력 가능하지만, 안전하게)
        if (!String(f.categoryCode ?? "").trim()) {
            return "카테고리 코드를 입력해주세요";
        }

        // 4) categoryName 필수
        if (!String(f.categoryName ?? "").trim()) {
            return "카테고리명을 입력해주세요";
        }

        // 5) sortOrder 숫자/범위 체크
        const so = Number(f.sortOrder);
        if (!Number.isInteger(so) || so < 1) {
            return "정렬 순서는 1 이상의 정수만 가능합니다";
        }

        return null; // 문제 없음
    };
    /* =========================
        검색조건 화면 초기화  HANDLER
    ========================= */
    const handleResetSearch = () => {
        setSearch(initialSearch);   // 검색 조건 초기화
        load(initialSearch, 1);     // 전체 리스트 다시 조회
    };
    /* =========================
        검색 다이얼로그 선택값 초기화  HANDLER
    ========================= */
    const handleDialogReset = () => {
        setSearch(initialSearch);
    };
    /* =========================
    RENDER
 ========================= */
    return (
        /* div translate 활용해 번역 비활성화 시킴 */
        <div translate="no">
            <Grid container direction="column" spacing={2}>
                <Grid>
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
                            {/* 초기화 추가 */}
                            <Button
                                variant="contained"
                                onClick={handleResetSearch}
                            >
                                초기화
                            </Button>

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
                                등록
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
                                onDelete={handleDelete}
                            />
                            {/*  페이지네이션은 여기 */}
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                <Pagination
                                    count={pageInfo.totalPages}   // 전체 페이지 수
                                    page={pageInfo.page}           // 현재 페이지
                                    onChange={(e, value) => {
                                        load(search, value);       // value = 클릭한 페이지 번호
                                    }}
                                    color="primary"
                                    showFirstButton
                                    showLastButton
                                />
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
           {/* =========================
            DIALOG
            ========================= */}
            <Dialog
                translate="no"
                key={dialogMode} // dialogMode가 변경될때마다 기존 dialog를 완전 지우고 새로생성 충돌해결
                open={dialogOpen}
                onClose={closeDialog}
                fullWidth
            >
                {/* ===== Dialog Title ===== */}
                <DialogTitle>
                    카테고리 관리
                </DialogTitle>

                {/* ===== Dialog Content ===== */}
                <DialogContent>
                    {/* ===== 보조 문구 ===== */}
                    {modeHelp && (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 2 }}
                        >
                            {modeHelp}
                        </Typography>
                    )}

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
                                            {parentOptions.map(p => (
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
                                        label="카테고리"
                                        name="categoryId"
                                        value={search.categoryId}
                                        onChange={handleSearchChange}
                                    >
                                        <MenuItem value="">전체</MenuItem>
                                        {parentOptions.map(p => (
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
                    <Button variant="contained" onClick={closeDialog}>취소</Button>

                    {(dialogMode === 'create' || dialogMode === 'edit') && (
                        <Button variant="contained" onClick={() => handleSave(form)}>
                            저장
                        </Button>
                    )}

                    {dialogMode === 'search' && (
                        <>
                            <Button
                                variant="contained"
                                onClick={handleDialogReset}
                            >
                                초기화
                            </Button>

                            <Button
                                variant="contained"
                                onClick={() => {
                                    handleSearch();
                                    closeDialog();
                                }}
                            >
                                검색
                            </Button>
                        </>
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
