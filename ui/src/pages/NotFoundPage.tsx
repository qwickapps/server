import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        textAlign: 'center',
      }}
    >
      <Typography variant="h1" sx={{ color: 'var(--theme-primary)', mb: 2 }}>
        404
      </Typography>
      <Typography variant="h5" sx={{ color: 'var(--theme-text-primary)', mb: 1 }}>
        Page Not Found
      </Typography>
      <Typography sx={{ color: 'var(--theme-text-secondary)', mb: 4 }}>
        The page you're looking for doesn't exist or has been moved.
      </Typography>
      <Button
        variant="contained"
        startIcon={<HomeIcon />}
        onClick={() => navigate('/')}
        sx={{
          bgcolor: 'var(--theme-primary)',
          '&:hover': { bgcolor: 'var(--theme-primary)' },
        }}
      >
        Back to Dashboard
      </Button>
    </Box>
  );
}
