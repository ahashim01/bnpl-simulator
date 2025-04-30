import { Alert, Button, Box, Typography } from "@mui/material";
import RefreshIcon from '@mui/icons-material/Refresh';

interface ErrorFallbackProps {
  error: Error | null;
  resetError?: () => void;
}

export default function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <Box sx={{ my: 3 }}>
      <Alert
        severity="error"
        action={
          resetError && (
            <Button
              color="inherit"
              size="small"
              onClick={resetError}
              startIcon={<RefreshIcon />}
            >
              Retry
            </Button>
          )
        }
      >
        <Typography variant="subtitle2">Something went wrong</Typography>
        <Typography variant="body2">
          {error?.message || "An unexpected error occurred. Please try again."}
        </Typography>
      </Alert>
    </Box>
  );
}
