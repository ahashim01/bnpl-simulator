import { Box, Typography } from "@mui/material";

interface LogoIconProps {
  size?: number;
  showText?: boolean;
}

export default function LogoIcon({ size = 32, showText = false }: Readonly<LogoIconProps>) {
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: size / 4,
          backgroundColor: "primary.main",
          color: "white",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontWeight: "bold",
          fontSize: size / 2,
        }}
      >
        BP
      </Box>

      {showText && (
        <Typography
          variant="h6"
          sx={{ ml: 1, fontWeight: 600, color: "text.primary" }}
        >
          BNPL
        </Typography>
      )}
    </Box>
  );
}
