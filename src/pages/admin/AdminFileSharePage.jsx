import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    Box, Typography, Paper, Button, IconButton, List, ListItemButton,
    ListItemText, ListItemIcon, Collapse, Table, TableHead, TableRow,
    TableCell, TableBody, Chip, CircularProgress, Alert, Snackbar,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Tooltip, Divider
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import HistoryIcon from '@mui/icons-material/History';
import {
    getFolders, createFolder, renameFolder, deleteFolder,
    getFiles, getVersions, uploadFile, uploadVersion, downloadFile, deleteFile
} from '../../api/fileShareApi';

const formatSize = (bytes) => {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const formatDate = (dt) => {
    if (!dt) return '-';
    return new Date(dt).toLocaleString('ko-KR', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
    });
};

function FolderTreeItem({ folder, selectedId, onSelect, onRename, onDelete, depth = 0 }) {
    const [open, setOpen] = useState(false);
    const hasChildren = folder.children && folder.children.length > 0;
    const isSelected = selectedId === folder.id;

    return (
        <>
            <ListItemButton
                selected={isSelected}
                onClick={() => { onSelect(folder); if (hasChildren) setOpen(o => !o); }}
                sx={{ pl: 2 + depth * 2, py: 0.8, borderRadius: 1, mb: 0.3 }}
            >
                <ListItemIcon sx={{ minWidth: 32 }}>
                    {isSelected
                        ? <FolderOpenIcon color="warning" fontSize="small" />
                        : <FolderIcon color="action" fontSize="small" />}
                </ListItemIcon>
                <ListItemText
                    primary={folder.name}
                    primaryTypographyProps={{ fontSize: 14, fontWeight: isSelected ? 700 : 400 }}
                />
                <Box sx={{ display: 'flex', gap: 0.3, opacity: 0.6 }}>
                    <Tooltip title="이름 변경">
                        <IconButton size="small" onClick={e => { e.stopPropagation(); onRename(folder); }}>
                            <EditIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="폴더 삭제">
                        <IconButton size="small" onClick={e => { e.stopPropagation(); onDelete(folder); }}>
                            <DeleteIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                    </Tooltip>
                </Box>
                {hasChildren && (open ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />)}
            </ListItemButton>
            {hasChildren && (
                <Collapse in={open}>
                    {folder.children.map(child => (
                        <FolderTreeItem
                            key={child.id}
                            folder={child}
                            selectedId={selectedId}
                            onSelect={onSelect}
                            onRename={onRename}
                            onDelete={onDelete}
                            depth={depth + 1}
                        />
                    ))}
                </Collapse>
            )}
        </>
    );
}

export default function AdminFileSharePage() {
    const [folders, setFolders] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [files, setFiles] = useState([]);
    const [expandedGroups, setExpandedGroups] = useState({});
    const [versions, setVersions] = useState({});
    const [loading, setLoading] = useState(false);
    const [fileLoading, setFileLoading] = useState(false);
    const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

    const [folderDialog, setFolderDialog] = useState({ open: false, mode: 'create', folder: null, name: '', parentId: null });
    const [deleteDialog, setDeleteDialog] = useState({ open: false, type: '', target: null });

    const fileInputRef = useRef();
    const versionInputRef = useRef();
    const [versionTarget, setVersionTarget] = useState(null);

    const showSnack = (msg, severity = 'success') => setSnack({ open: true, msg, severity });

    // silent=true → 로딩 스피너·상태 초기화 없이 데이터만 갱신 (폴링용)
    const loadFolders = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const data = await getFolders();
            setFolders(data);
        } catch {
            if (!silent) showSnack('폴더 목록을 불러오지 못했습니다.', 'error');
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    const loadFiles = useCallback(async (folderId, silent = false) => {
        if (!silent) {
            setFileLoading(true);
            setExpandedGroups({});
            setVersions({});
        }
        try {
            const data = await getFiles(folderId);
            setFiles(data);
        } catch {
            if (!silent) showSnack('파일 목록을 불러오지 못했습니다.', 'error');
        } finally {
            if (!silent) setFileLoading(false);
        }
    }, []);

    // 초기 로드
    useEffect(() => { loadFolders(); }, [loadFolders]);

    // 파일 폴링 — 15초마다 현재 폴더 파일 목록 갱신 (탭 숨김 시 스킵)
    useEffect(() => {
        if (!selectedFolder) return;
        const id = setInterval(() => {
            if (document.visibilityState === 'visible') {
                loadFiles(selectedFolder.id, true);
            }
        }, 15000);
        return () => clearInterval(id);
    }, [selectedFolder, loadFiles]);

    // 폴더 폴링 — 30초마다 폴더 트리 갱신
    useEffect(() => {
        const id = setInterval(() => {
            if (document.visibilityState === 'visible') {
                loadFolders(true);
            }
        }, 30000);
        return () => clearInterval(id);
    }, [loadFolders]);

    const handleSelectFolder = (folder) => {
        setSelectedFolder(folder);
        loadFiles(folder.id);
    };

    // ===== FOLDER ACTIONS =====

    const handleOpenCreateFolder = (parentId = null) => {
        setFolderDialog({ open: true, mode: 'create', folder: null, name: '', parentId });
    };

    const handleOpenRenameFolder = (folder) => {
        setFolderDialog({ open: true, mode: 'rename', folder, name: folder.name, parentId: null });
    };

    const handleFolderDialogConfirm = async () => {
        const { mode, folder, name, parentId } = folderDialog;
        if (!name.trim()) return;
        try {
            if (mode === 'create') {
                await createFolder(name.trim(), parentId);
                showSnack('폴더가 생성되었습니다.');
            } else {
                await renameFolder(folder.id, name.trim());
                showSnack('폴더 이름이 변경되었습니다.');
                if (selectedFolder?.id === folder.id) setSelectedFolder(f => ({ ...f, name: name.trim() }));
            }
            setFolderDialog(d => ({ ...d, open: false }));
            loadFolders();
        } catch {
            showSnack('처리 중 오류가 발생했습니다.', 'error');
        }
    };

    const handleDeleteConfirm = async () => {
        const { type, target } = deleteDialog;
        try {
            if (type === 'folder') {
                await deleteFolder(target.id);
                showSnack('폴더가 삭제되었습니다.');
                if (selectedFolder?.id === target.id) { setSelectedFolder(null); setFiles([]); }
                loadFolders();
            } else {
                await deleteFile(target.id);
                showSnack('파일이 삭제되었습니다.');
                loadFiles(selectedFolder.id);
            }
        } catch {
            showSnack('삭제 중 오류가 발생했습니다.', 'error');
        } finally {
            setDeleteDialog({ open: false, type: '', target: null });
        }
    };

    // ===== FILE ACTIONS =====

    const handleUploadFile = async (e) => {
        const file = e.target.files[0];
        if (!file || !selectedFolder) return;
        e.target.value = '';
        const duplicate = files.find(f => f.displayName === file.name);
        if (duplicate) {
            showSnack(`"${file.name}" 파일이 이미 존재합니다. 새 버전 업로드(↑ 초록색)를 이용해주세요.`, 'warning');
            return;
        }
        try {
            await uploadFile(selectedFolder.id, file);
            showSnack('파일이 업로드되었습니다.');
            loadFiles(selectedFolder.id);
        } catch {
            showSnack('업로드 중 오류가 발생했습니다.', 'error');
        }
    };

    const handleUploadVersion = async (e) => {
        const file = e.target.files[0];
        if (!file || !versionTarget) return;
        e.target.value = '';
        try {
            await uploadVersion(versionTarget.groupId, versionTarget.folderId, file);
            showSnack('새 버전이 업로드되었습니다.');
            loadFiles(selectedFolder.id);
            setExpandedGroups({});
            setVersions({});
        } catch {
            showSnack('업로드 중 오류가 발생했습니다.', 'error');
        }
        setVersionTarget(null);
    };

    const handleDownload = async (fileItem) => {
        try {
            const response = await downloadFile(fileItem.id);
            const url = URL.createObjectURL(response.data);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileItem.originalName;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            showSnack('다운로드 중 오류가 발생했습니다.', 'error');
        }
    };

    const toggleVersions = async (groupId) => {
        const next = !expandedGroups[groupId];
        setExpandedGroups(p => ({ ...p, [groupId]: next }));
        if (next && !versions[groupId]) {
            try {
                const data = await getVersions(groupId);
                setVersions(p => ({ ...p, [groupId]: data }));
            } catch {
                showSnack('버전 목록을 불러오지 못했습니다.', 'error');
            }
        }
    };

    return (
        <Box>
            {/* 헤더 */}
            <Box sx={{ mb: 2 }}>
                <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>파일 공유</Typography>
                <Alert severity="info" sx={{ py: 0.5, '& .MuiAlert-message': { fontSize: { xs: 12, sm: 13 }, lineHeight: 1.6 } }}>
                    <strong>↑ 파란색</strong> 파일업로드 &nbsp;|&nbsp;
                    <strong>↑ 초록색</strong> 버전업로드 &nbsp;|&nbsp;
                    <strong>↓</strong> 다운로드 &nbsp;|&nbsp;
                    <strong>🗑</strong> 삭제
                    <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                        &nbsp;|&nbsp; <strong>v칩</strong> 클릭 시 버전 히스토리 펼침
                    </Box>
                    <Box sx={{ display: { xs: 'block', sm: 'none' }, mt: 0.3, fontSize: 11, color: 'text.secondary' }}>
                        v칩 클릭 → 버전 히스토리 | 15초마다 자동 동기화
                    </Box>
                    <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>
                        &nbsp;|&nbsp; 15초마다 자동 동기화
                    </Box>
                </Alert>
            </Box>

            {/* 2컬럼 레이아웃: xs → 세로 stacked, md+ → 가로 side-by-side */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexDirection: { xs: 'column', md: 'row' } }}>

                {/* 폴더 트리 */}
                <Paper
                    variant="outlined"
                    sx={{
                        width: { xs: '100%', md: 240 },
                        flexShrink: 0,
                        p: 1.5,
                        maxHeight: { xs: 200, md: 'none' },
                        overflowY: { xs: 'auto', md: 'visible' },
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle2" fontWeight={700} color="text.secondary">폴더</Typography>
                        <Tooltip title="새 폴더">
                            <IconButton size="small" onClick={() => handleOpenCreateFolder(null)}>
                                <AddIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                    <Divider sx={{ mb: 1 }} />
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                            <CircularProgress size={24} />
                        </Box>
                    ) : folders.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                            폴더가 없습니다
                        </Typography>
                    ) : (
                        <List dense disablePadding>
                            {folders.map(f => (
                                <FolderTreeItem
                                    key={f.id}
                                    folder={f}
                                    selectedId={selectedFolder?.id}
                                    onSelect={handleSelectFolder}
                                    onRename={handleOpenRenameFolder}
                                    onDelete={(folder) => setDeleteDialog({ open: true, type: 'folder', target: folder })}
                                />
                            ))}
                        </List>
                    )}
                </Paper>

                {/* 파일 목록 */}
                <Paper variant="outlined" sx={{ flex: 1, p: { xs: 1.5, sm: 2 }, width: { xs: '100%', md: 'auto' }, minWidth: 0 }}>
                    {!selectedFolder ? (
                        <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
                            <FolderIcon sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
                            <Typography variant="body2">
                                {window.innerWidth < 600 ? '위에서 폴더를 선택하세요' : '왼쪽에서 폴더를 선택하세요'}
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            {/* 파일 패널 헤더 */}
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                mb: 2,
                                gap: 1,
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <FolderOpenIcon color="warning" />
                                    <Typography variant="subtitle1" fontWeight={700}>{selectedFolder.name}</Typography>
                                    <Tooltip title="하위 폴더 추가">
                                        <IconButton size="small" onClick={() => handleOpenCreateFolder(selectedFolder.id)}>
                                            <AddIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<UploadIcon />}
                                    onClick={() => fileInputRef.current.click()}
                                    sx={{ flexShrink: 0 }}
                                >
                                    파일 업로드
                                </Button>
                                <input ref={fileInputRef} type="file" hidden onChange={handleUploadFile} />
                                <input ref={versionInputRef} type="file" hidden onChange={handleUploadVersion} />
                            </Box>

                            {fileLoading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                    <CircularProgress size={28} />
                                </Box>
                            ) : files.length === 0 ? (
                                <Alert severity="info">파일이 없습니다. 파일을 업로드해보세요.</Alert>
                            ) : (
                                <Box sx={{ overflowX: 'auto' }}>
                                    <Table size="small" sx={{ minWidth: 520 }}>
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                                <TableCell>파일명</TableCell>
                                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>올린 사람</TableCell>
                                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>날짜</TableCell>
                                                <TableCell>크기</TableCell>
                                                <TableCell align="center">버전</TableCell>
                                                <TableCell align="center">액션</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {files.map(f => (
                                                <React.Fragment key={f.id}>
                                                    <TableRow hover>
                                                        <TableCell sx={{ fontWeight: 600, fontSize: { xs: 12, sm: 14 } }}>{f.displayName}</TableCell>
                                                        <TableCell sx={{ fontSize: 13, display: { xs: 'none', sm: 'table-cell' } }}>{f.uploadedBy}</TableCell>
                                                        <TableCell sx={{ fontSize: 13, display: { xs: 'none', sm: 'table-cell' } }}>{formatDate(f.uploadedAt)}</TableCell>
                                                        <TableCell sx={{ fontSize: 13 }}>{formatSize(f.fileSize)}</TableCell>
                                                        <TableCell align="center">
                                                            <Chip
                                                                label={`v${f.version}`}
                                                                size="small"
                                                                color="primary"
                                                                variant="outlined"
                                                                icon={<HistoryIcon />}
                                                                onClick={() => toggleVersions(f.groupId)}
                                                                sx={{ cursor: 'pointer', fontWeight: 700 }}
                                                            />
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                                                <Tooltip title="다운로드">
                                                                    <IconButton size="small" color="primary" onClick={() => handleDownload(f)}>
                                                                        <DownloadIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="새 버전 업로드">
                                                                    <IconButton size="small" color="success" onClick={() => { setVersionTarget(f); versionInputRef.current.click(); }}>
                                                                        <UploadIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="삭제">
                                                                    <IconButton size="small" color="error" onClick={() => setDeleteDialog({ open: true, type: 'file', target: f })}>
                                                                        <DeleteIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                    {expandedGroups[f.groupId] && versions[f.groupId]?.map(v => (
                                                        <TableRow key={v.id} sx={{ bgcolor: '#fafafa' }}>
                                                            <TableCell sx={{ pl: { xs: 2, sm: 4 }, fontSize: 12, color: 'text.secondary' }}>
                                                                └ {v.originalName}
                                                            </TableCell>
                                                            <TableCell sx={{ fontSize: 12, color: 'text.secondary', display: { xs: 'none', sm: 'table-cell' } }}>{v.uploadedBy}</TableCell>
                                                            <TableCell sx={{ fontSize: 12, color: 'text.secondary', display: { xs: 'none', sm: 'table-cell' } }}>{formatDate(v.uploadedAt)}</TableCell>
                                                            <TableCell sx={{ fontSize: 12, color: 'text.secondary' }}>{formatSize(v.fileSize)}</TableCell>
                                                            <TableCell align="center">
                                                                <Chip label={`v${v.version}`} size="small" variant="outlined" sx={{ fontSize: 11 }} />
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                                                    <Tooltip title="다운로드">
                                                                        <IconButton size="small" color="primary" onClick={() => handleDownload(v)}>
                                                                            <DownloadIcon sx={{ fontSize: 14 }} />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                    <Tooltip title="이 버전 삭제">
                                                                        <IconButton size="small" color="error" onClick={() => setDeleteDialog({ open: true, type: 'file', target: v })}>
                                                                            <DeleteIcon sx={{ fontSize: 14 }} />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </Box>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </React.Fragment>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Box>
                            )}
                        </>
                    )}
                </Paper>
            </Box>

            {/* 폴더 생성/이름변경 다이얼로그 */}
            <Dialog
                open={folderDialog.open}
                onClose={() => setFolderDialog(d => ({ ...d, open: false }))}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>{folderDialog.mode === 'create' ? '새 폴더' : '이름 변경'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus fullWidth size="small" label="폴더 이름" sx={{ mt: 1 }}
                        value={folderDialog.name}
                        onChange={e => setFolderDialog(d => ({ ...d, name: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && handleFolderDialogConfirm()}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setFolderDialog(d => ({ ...d, open: false }))}>취소</Button>
                    <Button variant="contained" onClick={handleFolderDialogConfirm}>확인</Button>
                </DialogActions>
            </Dialog>

            {/* 삭제 확인 다이얼로그 */}
            <Dialog
                open={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false, type: '', target: null })}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>삭제 확인</DialogTitle>
                <DialogContent>
                    <Typography>
                        {deleteDialog.type === 'folder'
                            ? `"${deleteDialog.target?.name}" 폴더와 모든 파일이 삭제됩니다.`
                            : `"${deleteDialog.target?.displayName || deleteDialog.target?.originalName}" 파일을 삭제하시겠습니까?`}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, type: '', target: null })}>취소</Button>
                    <Button variant="contained" color="error" onClick={handleDeleteConfirm}>삭제</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snack.open}
                autoHideDuration={3000}
                onClose={() => setSnack(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))}>
                    {snack.msg}
                </Alert>
            </Snackbar>
        </Box>
    );
}
