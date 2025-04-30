import { Box, Typography, Button, SxProps, Theme } from "@mui/material";
import { ReactNode } from "react";
import { motion } from "framer-motion";

interface EmptyStateProps {
  title: string;
  description: string;
  icon: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  sx?: SxProps<Theme>;
}

export default function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  sx = {},
}: Readonly<EmptyStateProps>) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 4,
        borderRadius: 2,
        bgcolor: "background.paper",
        textAlign: "center",
        minHeight: 300,
        ...sx,
      }}
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box
        sx={{ color: "text.secondary", mb: 3 }}
        component={motion.div}
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, 0, -5, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      >
        {icon}
      </Box>

      <Typography variant="h5" gutterBottom fontWeight={500}>
        {title}
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ maxWidth: 500, mb: 4 }}
      >
        {description}
      </Typography>

      {actionLabel && onAction && (
        <Button
          variant="contained"
          onClick={onAction}
          component={motion.button}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
