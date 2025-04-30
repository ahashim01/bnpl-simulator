import { ReactNode } from "react";
import { Card, CardContent, CardHeader, Box } from "@mui/material";

interface ChartCardProps {
  title: string;
  subheader?: string;
  children: ReactNode;
  height?: number;
}

export default function ChartCard({ title, subheader, children, height = 300 }: Readonly<ChartCardProps>) {
  return (
    <Card sx={{ height: "100%", mb: 4 }}>
      <CardHeader
        title={title}
        subheader={subheader}
        sx={{
          '& .MuiCardHeader-title': {
            typography: 'h6',
            fontSize: '1.125rem',
          },
          '& .MuiCardHeader-subheader': {
            typography: 'body2',
          }
        }}
      />
      <CardContent sx={{ height: height, p: 2 }}>
        <Box sx={{ width: "100%", height: "100%" }}>
          {children}
        </Box>
      </CardContent>
    </Card>
  );
}
