import { Box, Typography, Button, Paper, SxProps, Theme } from "@mui/material";
import { ReactNode } from "react";
import { motion } from "framer-motion";

interface NoDataPlaceholderProps {
  icon: ReactNode;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  sx?: SxProps<Theme>;
}

export default function NoDataPlaceholder({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  sx = {},
}: NoDataPlaceholderProps) {
  return (
    <Paper
      sx={{
        p: 4,
        textAlign: "center",
        borderRadius: 2,
        ...sx,
      }}
      component={motion.div}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Box
        component={motion.div}
        animate={{
          y: [0, -10, 0],
          scale: [1, 1.05, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
        sx={{ mb: 2, color: "text.secondary" }}
      >
        {icon}
      </Box>

      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {message}
      </Typography>

      {actionLabel && onAction && (
        <Button
          variant="contained"
          onClick={onAction}
          sx={{ minWidth: 120 }}
          component={motion.button}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {actionLabel}
        </Button>
      )}
    </Paper>
  );
}
