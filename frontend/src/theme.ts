import { createTheme, responsiveFontSizes } from "@mui/material/styles";

// Create a customized theme
const baseTheme = createTheme({
  palette: {
    primary: {
      main: "#2563eb", // Vibrant blue
      light: "#93c5fd",
      dark: "#1e40af",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#8b5cf6", // Purple
      light: "#c4b5fd",
      dark: "#6d28d9",
      contrastText: "#ffffff",
    },
    success: {
      main: "#10b981", // Green
      light: "#d1fae5",
      dark: "#059669",
    },
    error: {
      main: "#ef4444", // Red
      light: "#fee2e2",
      dark: "#b91c1c",
    },
    warning: {
      main: "#f59e0b", // Amber
      light: "#fef3c7",
      dark: "#d97706",
    },
    info: {
      main: "#3b82f6", // Blue
      light: "#dbeafe",
      dark: "#2563eb",
    },
    background: {
      default: "#f8fafc", // Very light blue-gray
      paper: "#ffffff",
    },
    text: {
      primary: "#111827", // Near black
      secondary: "#6b7280", // Gray
    },
  },
  typography: {
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
    button: {
      fontWeight: 500,
      textTransform: "none", // Avoid ALL CAPS for buttons
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "8px 16px",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 2px 10px 0 rgba(0,0,0,0.12)",
          },
        },
        sizeSmall: {
          padding: "6px 12px",
        },
        sizeLarge: {
          padding: "12px 20px",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 4px 12px 0 rgba(0,0,0,0.05)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          "&:before, &:after": {
            display: "none",
          },
          "&.Mui-focused": {
            backgroundColor: "rgba(0, 0, 0, 0.04)",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: "#3b82f6",
        },
      },
    },
  },
});

// Make fonts responsive
const theme = responsiveFontSizes(baseTheme);

export default theme;
