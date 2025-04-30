import { Button, Paper, Typography, Box, Alert } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import { motion } from "framer-motion";

interface ErrorFallbackProps {
  error: Error; // Simplified to just Error type
  resetError?: () => void;
  fullPage?: boolean;
}

export default function ErrorFallback({ error, resetError, fullPage = false }: Readonly<ErrorFallbackProps>) {
  const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred. Please try again.";

  if (fullPage) {
    return (
      <Box
        sx={{
          minHeight: fullPage ? '100vh' : 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 3,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            textAlign: 'center',
            p: 4,
            borderRadius: 2,
            maxWidth: 500,
          }}
        >
          <ErrorOutlineIcon
            color="error"
            sx={{ fontSize: 64, mb: 2 }}
          />

          <Typography variant="h5" gutterBottom color="error">
            Something went wrong
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {errorMessage}
          </Typography>

          {resetError && (
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={resetError}
              sx={{ mt: 1 }}
            >
              Try Again
            </Button>
          )}
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ my: 3 }}>
      <Alert
        severity="error"
        variant="outlined"
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
        icon={
          <ErrorOutlineIcon
            component={motion.svg}
            animate={{
              rotate: [0, 10, -10, 10, -10, 0]
            }}
            transition={{
              duration: 0.5,
              delay: 0.3,
            }}
          />
        }
        sx={{ borderRadius: 2 }}
      >
        <Typography variant="subtitle2">Something went wrong</Typography>
        <Typography variant="body2">
          {errorMessage}
        </Typography>
      </Alert>
    </Box>
  );
}
