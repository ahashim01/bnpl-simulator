import { LinearProgress, Box, Typography } from "@mui/material";

export default function PlanProgress({ paid, total }: { paid: number; total: number }) {
  const pct = (paid / total) * 100;
  return (
    <Box sx={{ my: 1 }}>
      <LinearProgress variant="determinate" value={pct} />
      <Typography variant="caption">{paid}/{total} installments paid</Typography>
    </Box>
  );
}
