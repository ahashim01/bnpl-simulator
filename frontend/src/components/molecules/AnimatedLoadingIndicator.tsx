import { Box, Typography, CircularProgress, useTheme } from "@mui/material";
import { motion } from "framer-motion";

interface AnimatedLoadingIndicatorProps {
  message?: string;
  fullPage?: boolean;
}

export default function AnimatedLoadingIndicator({
  message = "Loading...",
  fullPage = false
}: AnimatedLoadingIndicatorProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: fullPage ? '100vh' : 200,
        width: '100%',
      }}
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Box
        component={motion.div}
        animate={{
          rotate: 360,
          scale: [1, 1.1, 1],
        }}
        transition={{
          rotate: { duration: 1.5, repeat: Infinity, ease: "linear" },
          scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
        }}
        sx={{ position: 'relative', mb: 2 }}
      >
        <CircularProgress size={48} thickness={4} />
        <Box
          component={motion.div}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: theme.palette.primary.light,
            opacity: 0.2,
          }}
        />
      </Box>

      <Typography
        variant="body1"
        color="text.secondary"
        component={motion.p}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {message}
      </Typography>
    </Box>
  );
}
