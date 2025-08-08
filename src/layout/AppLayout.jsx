import { AppBar, Toolbar, Typography, Drawer, List, ListItemButton, Box, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Outlet, NavLink, useLocation } from 'react-router-dom'; // ← NavLink 사용
import { useState } from 'react';

const drawerWidth = 240;
export default function AppLayout() {
    const [open, setOpen] = useState(false);
    const items = [
        { label: '대시보드', to: '/admin' },
        { label: '카테고리', to: '/admin/categories' },
        { label: '상품',     to: '/admin/products' },
        { label: '주문',     to: '/admin/orders' },
    ];

    return (
        <Box sx={{ display:'flex' }}>
            <AppBar position="fixed" sx={{ zIndex:(t)=>t.zIndex.drawer+1 }}>
                <Toolbar>
                    <IconButton edge="start" onClick={()=>setOpen(true)} sx={{ mr:2, display:{ md:'none' }}}>
                        <MenuIcon/>
                    </IconButton>
                    <Typography variant="h6" sx={{ flex:1 }}>낚시 플랫폼 Admin</Typography>
                </Toolbar>
            </AppBar>

            {/* 영구 드로어 */}
            <Drawer variant="permanent" sx={{
                display:{ xs:'none', md:'block' },
                '& .MuiDrawer-paper':{ width:drawerWidth, boxSizing:'border-box' }
            }}>
                <Toolbar />
                <List>
                    {items.map(i => (
                        <ListItemButton
                            key={i.to}
                            component={NavLink}
                            to={i.to}
                            end                                 // ← 정확히 일치할 때만 active
                            sx={{ '&.active': { bgcolor: 'action.selected' }}} // 활성화 스타일
                        >
                            {i.label}
                        </ListItemButton>
                    ))}
                </List>
            </Drawer>

            {/* 모바일 드로어 */}
            <Drawer open={open} onClose={()=>setOpen(false)} sx={{
                display:{ md:'none' }, '& .MuiDrawer-paper':{ width:drawerWidth }
            }}>
                <List>
                    {items.map(i => (
                        <ListItemButton
                            key={i.to}
                            component={NavLink}
                            to={i.to}
                            end
                            onClick={()=>setOpen(false)}
                            sx={{ '&.active': { bgcolor: 'action.selected' }}}
                        >
                            {i.label}
                        </ListItemButton>
                    ))}
                </List>
            </Drawer>

            {/* 본문은 서랍 폭만큼 밀기 */}
            <Box component="main" sx={{
                flexGrow:1, p:3,
                ml:{ md: `${drawerWidth}px` },
                width:{ md: `calc(100% - ${drawerWidth}px)` }
            }}>
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    );
}
