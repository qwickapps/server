import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
export function NotFoundPage() {
    const navigate = useNavigate();
    return (_jsxs(Box, { sx: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh',
            textAlign: 'center',
        }, children: [_jsx(Typography, { variant: "h1", sx: { color: 'var(--theme-primary)', mb: 2 }, children: "404" }), _jsx(Typography, { variant: "h5", sx: { color: 'var(--theme-text-primary)', mb: 1 }, children: "Page Not Found" }), _jsx(Typography, { sx: { color: 'var(--theme-text-secondary)', mb: 4 }, children: "The page you're looking for doesn't exist or has been moved." }), _jsx(Button, { variant: "contained", startIcon: _jsx(HomeIcon, {}), onClick: () => navigate('/'), sx: {
                    bgcolor: 'var(--theme-primary)',
                    '&:hover': { bgcolor: 'var(--theme-primary)' },
                }, children: "Back to Dashboard" })] }));
}
//# sourceMappingURL=NotFoundPage.js.map