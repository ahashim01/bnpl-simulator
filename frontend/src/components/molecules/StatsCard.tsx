import { Card, CardContent, Box, Typography, SxProps, Theme } from "@mui/material";
import React from "react";

interface StatsCardProps {
  icon: React.ReactElement<{ color?: string }>;
  title: string;
  value: string;
  subtitle?: string;
  iconBgColor?: string;
  iconColor?: string;
  sx?: SxProps<Theme>;
}

const StatsCard: React.FC<Readonly<StatsCardProps>> = ({
  icon,
  title,
  value,
  subtitle,
  iconBgColor = "primary.light",
  iconColor = "primary.main",
  sx = {},
}) => {
  return (
    <Card
      sx={{
        height: "100%",
        transition: "all 0.3s ease-in-out",
        borderRadius: 2,
        boxShadow: 1,
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: 3,
        },
        ...sx,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: "50%",
              bgcolor: iconBgColor,
              mr: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 48,
            }}
          >
            {React.cloneElement(icon, { color: iconColor })}
          </Box>
          <Typography variant="h6">{title}</Typography>
        </Box>
        <Typography variant="h5" fontWeight="500">
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;
