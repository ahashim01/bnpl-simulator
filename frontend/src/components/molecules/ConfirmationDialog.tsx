import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Box,
    Typography,
    CircularProgress,
  } from "@mui/material";
  import { ReactNode, useState } from "react";
  import WarningIcon from "@mui/icons-material/Warning";
  import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
  import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
  import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

  type ConfirmationType = "danger" | "warning" | "info" | "question";

  interface ConfirmationDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void> | void;
    title: string;
    description: string | ReactNode;
    type?: ConfirmationType;
    confirmLabel?: string;
    cancelLabel?: string;
  }

  export default function ConfirmationDialog({
    open,
    onClose,
    onConfirm,
    title,
    description,
    type = "question",
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
  }: ConfirmationDialogProps) {
    const [isConfirming, setIsConfirming] = useState(false);

    const handleConfirm = async () => {
      setIsConfirming(true);
      try {
        await onConfirm();
      } finally {
        setIsConfirming(false);
        onClose();
      }
    };

    // Icon based on type
    const getIcon = () => {
      switch (type) {
        case "danger":
          return <ErrorOutlineIcon color="error" sx={{ fontSize: 48 }} />;
        case "warning":
          return <WarningIcon color="warning" sx={{ fontSize: 48 }} />;
        case "info":
          return <InfoOutlinedIcon color="info" sx={{ fontSize: 48 }} />;
        case "question":
        default:
          return <HelpOutlineIcon color="primary" sx={{ fontSize: 48 }} />;
      }
    };

    // Button color based on type
    const getButtonColor = (): "error" | "warning" | "info" | "primary" => {
      switch (type) {
        case "danger":
          return "error";
        case "warning":
          return "warning";
        case "info":
          return "info";
        case "question":
        default:
          return "primary";
      }
    };

    return (
      <Dialog
        open={open}
        onClose={isConfirming ? undefined : onClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          elevation: 3,
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle sx={{ pb: 0 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
              textAlign: "center",
              pt: 1,
            }}
          >
            {getIcon()}
            <Typography variant="h6" sx={{ mt: 2 }}>
              {title}
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <DialogContentText textAlign="center">
            {description}
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, justifyContent: "center" }}>
          <Button
            onClick={onClose}
            disabled={isConfirming}
            variant="outlined"
            sx={{ minWidth: 100 }}
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isConfirming}
            variant="contained"
            color={getButtonColor()}
            sx={{ minWidth: 100 }}
            startIcon={isConfirming ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {isConfirming ? "Processing..." : confirmLabel}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
