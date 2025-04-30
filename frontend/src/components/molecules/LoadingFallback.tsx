import { Box, CircularProgress, Typography } from "@mui/material";

interface LoadingFallbackProps {
  message?: string;
}

export default function LoadingFallback({ message = "Loading..." }: LoadingFallbackProps) {
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '200px'
    }}>
      <CircularProgress size={40} />
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        {message}
      </Typography>
    </Box>
  );
}
