import { Snackbar, Alert, Typography, Box } from "@mui/material";
import { createContext, useContext, useState, ReactNode, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastOptions {
  message: string;
  description?: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<(ToastOptions & { id: number })[]>([]);
  const [lastId, setLastId] = useState(0);

  const showToast = useCallback((options: ToastOptions) => {
    const id = lastId + 1;
    setLastId(id);

    const newToast = {
      ...options,
      type: options.type || "info",
      duration: options.duration || 5000,
      id,
    };

    setToasts(prev => [...prev, newToast]);
  }, [lastId]);

  const handleClose = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const contextValue = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      <Box
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: 2000,
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.3 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
              layout
            >
              <Snackbar
                open={true}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                onClose={() => handleClose(toast.id)}
                autoHideDuration={toast.duration}
                sx={{ position: "static", mb: 1 }}
              >
                <Alert
                  severity={toast.type}
                  onClose={() => handleClose(toast.id)}
                  sx={{
                    width: "100%",
                    maxWidth: 500,
                    boxShadow: 3,
                    borderRadius: 2
                  }}
                >
                  {toast.description ? (
                    <>
                      <Typography variant="subtitle2">{toast.message}</Typography>
                      <Typography variant="body2">{toast.description}</Typography>
                    </>
                  ) : (
                    <Typography variant="body1">{toast.message}</Typography>
                  )}
                </Alert>
              </Snackbar>
            </motion.div>
          ))}
        </AnimatePresence>
      </Box>
    </ToastContext.Provider>
  );
}
