import { useState, useEffect } from 'react';
import {
    Box, Button, Typography, Stack, Alert,
    CircularProgress, IconButton, Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import * as api from '../../../api/productApi';
import IMG_BASE from '../../../config/imageConfig';

const FILE_TYPE_COLOR = {
    PDF:   'error',
    EXCEL: 'success',
    WORD:  'primary',
    IMAGE: 'warning',
    ETC:   'default',
};

const formatSize = (bytes) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
};

export default function ProductFileTab({ productId, onUpdate, isEdit }) {
    const [files,      setFiles]      = useState([]);
    const [loading,    setLoading]    = useState(false);
    const [error,      setError]      = useState('');
    const [fileSaved,  setFileSaved]  = useState(false);

    const loadFiles = async () => {
        try {
            const data = await api.getProductFiles(productId);
            setFiles(data);
        } catch {
            setError('첨부파일 목록을 불러오지 못했습니다.');
        }
    };

    useEffect(() => { loadFiles(); }, [productId]);

    /* 파일 업로드 */
    const handleUpload = async (e) => {
        const selected = Array.from(e.target.files);
        if (!selected.length) return;
        setLoading(true);
        try {
            for (const file of selected) {
                const fd = new FormData();
                fd.append('file', file);
                await api.uploadProductFile(productId, fd);
            }
            await loadFiles();
            onUpdate?.();
            setFileSaved(true);
        } catch {
            setError('파일 업로드에 실패했습니다.');
        } finally {
            setLoading(false);
            e.target.value = '';
        }
    };

    /* 파일 삭제 */
    const handleDelete = async (fileId) => {
        if (!window.confirm('첨부파일을 삭제하시겠습니까?')) return;
        try {
            await api.deleteProductFile(productId, fileId);
            await loadFiles();
            onUpdate?.();
        } catch {
            setError('파일 삭제에 실패했습니다.');
        }
    };

    return (
        <Box>
            {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
            {fileSaved && (
                <Alert severity="success" onClose={() => setFileSaved(false)} sx={{ mb: 2 }}>
                    {isEdit ? (
                        <>
                            첨부파일 추가 완료되었습니다.&nbsp;
                            <strong>[기본정보]&nbsp;[일정 정보]&nbsp;[메인화면 썸네일 이미지]&nbsp;[유튜브 동영상]</strong>
                            &nbsp;더 이상 수정하실 게 없으면 <strong>수정완료</strong> 버튼을 클릭해주세요.
                        </>
                    ) : (
                        <>
                            파일이 저장되었습니다.&nbsp;
                            모든 탭에 더 이상 저장할 항목이 없으면 <strong>등록완료</strong> 버튼을 클릭해주세요.
                        </>
                    )}
                </Alert>
            )}

            {/* 헤더 */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                    첨부파일 ({files.length}개)
                </Typography>
                <Button variant="contained" component="label" disabled={loading}>
                    {loading ? <CircularProgress size={18} sx={{ mr: 1 }} /> : null}
                    파일 및 추가 저장
                    <input type="file" hidden multiple onChange={handleUpload} />
                </Button>
            </Stack>

            {/* 파일 목록 */}
            {files.length === 0 ? (
                <Box sx={{
                    py: 5, textAlign: 'center', color: 'text.disabled',
                    border: '2px dashed #eee', borderRadius: 2
                }}>
                    <Typography variant="body2">등록된 첨부파일이 없습니다.</Typography>
                    <Typography variant="caption">PDF, Excel, Word 등을 업로드하세요.</Typography>
                </Box>
            ) : (
                <Box sx={{ width: '100%', overflowX: 'auto' }}>
                <table
                    style={{ width: '100%', borderCollapse: 'collapse', minWidth: 360 }}
                    border="1"
                    cellPadding="10"
                >
                    <thead>
                        <tr style={{ backgroundColor: '#f5f5f5' }}>
                            <th style={{ textAlign: 'left' }}>파일명</th>
                            <th style={{ textAlign: 'center', width: 80 }}>유형</th>
                            <th style={{ textAlign: 'center', width: 80 }}>크기</th>
                            <th style={{ textAlign: 'center', width: 100 }}>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {files.map(file => (
                            <tr key={file.id}>
                                <td>{file.fileName}</td>
                                <td style={{ textAlign: 'center' }}>
                                    <Chip
                                        label={file.fileType}
                                        color={FILE_TYPE_COLOR[file.fileType] ?? 'default'}
                                        size="small"
                                    />
                                </td>
                                <td style={{ textAlign: 'center' }}>{formatSize(file.fileSize)}</td>
                                <td style={{ textAlign: 'center' }}>
                                    <Stack direction="row" spacing={0.5} justifyContent="center">
                                        <IconButton
                                            size="small"
                                            href={`${IMG_BASE}${file.filePath}`}
                                            download={file.fileName}
                                            target="_blank"
                                        >
                                            <DownloadIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" color="error" onClick={() => handleDelete(file.id)}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Stack>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </Box>
            )}
        </Box>
    );
}
