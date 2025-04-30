import { LinearProgress, Box, Typography } from "@mui/material";

interface PlanProgressProps {
  paid: number;
  total: number;
}

export default function PlanProgress({ paid, total }: PlanProgressProps) {
  const percentage = total > 0 ? (paid / total) * 100 : 0;

  return (
    <Box sx={{ my: 1 }}>
      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{ height: 8, borderRadius: 1 }}
      />
      <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
        {paid}/{total} installments paid
      </Typography>
    </Box>
  );
}
