import { Box, Pagination } from '@mui/material';

export default function CommonPagination({ count, page, onChange }) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination
                count={count}
                page={page}
                onChange={onChange}
                color="primary"
                showFirstButton
                showLastButton
            />
        </Box>
    );
}
