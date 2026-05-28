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
import { useEffect, useRef, useState, useCallback } from 'react';
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
    return new Date(dt).toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
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
                    {isSelected ? <FolderOpenIcon color="warning" fontSize="small" /> : <FolderIcon color="action" fontSize="small" />}
                </ListItemIcon>
                <ListItemText primary={folder.name} primaryTypographyProps={{ fontSize: 14, fontWeight: isSelected ? 700 : 400 }} />
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

    // Dialog states
    const [folderDialog, setFolderDialog] = useState({ open: false, mode: 'create', folder: null, name: '', parentId: null });
    const [deleteDialog, setDeleteDialog] = useState({ open: false, type: '', target: null });

    const fileInputRef = useRef();
    const versionInputRef = useRef();
    const [versionTarget, setVersionTarget] = useState(null);

    const showSnack = (msg, severity = 'success') => setSnack({ open: true, msg, severity });

    const loadFolders = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getFolders();
            setFolders(data);
        } catch {
            showSnack('폴더 목록을 불러오지 못했습니다.', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadFolders(); }, [loadFolders]);

    const loadFiles = useCallback(async (folderId) => {
        setFileLoading(true);
        setExpandedGroups({});
        setVersions({});
        try {
            const data = await getFiles(folderId);
            setFiles(data);
        } catch {
            showSnack('파일 목록을 불러오지 못했습니다.', 'error');
        } finally {
            setFileLoading(false);
        }
    }, []);

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
            showSnack(`"${file.name}" 파일이 이미 존재합니다. 새 버전 업로드(↑ 초록색 버튼)를 이용해주세요.`, 'warning');
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <Typography variant="h5" fontWeight={700}>파일 공유</Typography>
                <Alert severity="info" sx={{ py: 0.3, flex: 1 }}>
                    1. 버튼 안내: <strong>↑(파란색)</strong> 파일 업로드 &nbsp;|&nbsp; <strong>↑(초록색)</strong> 새 버전 업로드 &nbsp;|&nbsp; <strong>↓</strong> 다운로드 &nbsp;|&nbsp; <strong>🗑</strong> 삭제<br />
                    2. 버전 안내: <strong>v숫자 칩</strong> 클릭 시 이전 버전 목록 펼침 → 각 버전별 다운로드 가능<br />
                    3. 파일 내려받고 다시 업로드 시 파일명 버전을 업그레이드 해주세요
                </Alert>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>

                {/* 폴더 트리 */}
                <Paper variant="outlined" sx={{ width: 240, flexShrink: 0, p: 1.5 }}>
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
                <Paper variant="outlined" sx={{ flex: 1, p: 2 }}>
                    {!selectedFolder ? (
                        <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
                            <FolderIcon sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
                            <Typography>왼쪽에서 폴더를 선택하세요</Typography>
                        </Box>
                    ) : (
                        <>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
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
                                    <Table size="small" sx={{ minWidth: 500 }}>
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                                <TableCell>파일명</TableCell>
                                                <TableCell>올린 사람</TableCell>
                                                <TableCell>날짜</TableCell>
                                                <TableCell>크기</TableCell>
                                                <TableCell align="center">버전</TableCell>
                                                <TableCell align="center">액션</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {files.map(f => (
                                                <>
                                                    <TableRow key={f.id} hover>
                                                        <TableCell sx={{ fontWeight: 600 }}>{f.displayName}</TableCell>
                                                        <TableCell sx={{ fontSize: 13 }}>{f.uploadedBy}</TableCell>
                                                        <TableCell sx={{ fontSize: 13 }}>{formatDate(f.uploadedAt)}</TableCell>
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
                                                            <TableCell sx={{ pl: 4, fontSize: 13, color: 'text.secondary' }}>
                                                                └ {v.originalName}
                                                            </TableCell>
                                                            <TableCell sx={{ fontSize: 12, color: 'text.secondary' }}>{v.uploadedBy}</TableCell>
                                                            <TableCell sx={{ fontSize: 12, color: 'text.secondary' }}>{formatDate(v.uploadedAt)}</TableCell>
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
                                                </>
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
            <Dialog open={folderDialog.open} onClose={() => setFolderDialog(d => ({ ...d, open: false }))} maxWidth="xs" fullWidth>
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
            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, type: '', target: null })} maxWidth="xs" fullWidth>
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
