import { Box, Skeleton, Paper, useTheme } from "@mui/material";

interface PlaceholderSkeletonProps {
  type: 'card' | 'table' | 'chart' | 'stats';
  count?: number;
}

export default function PlaceholderSkeleton({ type, count = 1 }: PlaceholderSkeletonProps) {
  const theme = useTheme();

  // Card placeholder
  const renderCard = () => (
    <Paper
      sx={{
        p: 3,
        borderRadius: 2,
        mb: 3,
        backgroundColor: theme.palette.mode === 'dark'
          ? 'rgba(255,255,255,0.05)'
          : 'rgba(0,0,0,0.02)',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Skeleton variant="text" width={150} height={30} />
        <Skeleton variant="rounded" width={80} height={24} />
      </Box>
      <Skeleton variant="text" width={120} />
      <Skeleton variant="text" width={200} sx={{ mb: 2 }} />
      <Skeleton variant="rounded" height={8} sx={{ mb: 3 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Skeleton variant="rounded" width={100} height={36} />
        <Skeleton variant="rounded" width={100} height={36} />
      </Box>
    </Paper>
  );

  // Table placeholder
  const renderTable = () => (
    <Paper
      sx={{
        p: 3,
        borderRadius: 2,
        mb: 3,
        backgroundColor: theme.palette.mode === 'dark'
          ? 'rgba(255,255,255,0.05)'
          : 'rgba(0,0,0,0.02)',
      }}
    >
      <Skeleton variant="text" width={200} height={30} sx={{ mb: 2 }} />
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Skeleton variant="text" width={120} />
          <Skeleton variant="text" width={80} />
          <Skeleton variant="text" width={100} />
          <Skeleton variant="text" width={80} />
        </Box>
        <Box sx={{ height: 1, backgroundColor: 'divider', my: 2 }} />
        {Array.from(new Array(5)).map((_, index) => (
          <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Skeleton variant="text" width={120} />
            <Skeleton variant="text" width={80} />
            <Skeleton variant="text" width={100} />
            <Skeleton variant="rounded" width={80} height={36} />
          </Box>
        ))}
      </Box>
    </Paper>
  );

  // Chart placeholder
  const renderChart = () => (
    <Paper
      sx={{
        p: 3,
        borderRadius: 2,
        mb: 3,
        backgroundColor: theme.palette.mode === 'dark'
          ? 'rgba(255,255,255,0.05)'
          : 'rgba(0,0,0,0.02)',
      }}
    >
      <Skeleton variant="text" width={200} height={30} sx={{ mb: 2 }} />
      <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 1 }} />
    </Paper>
  );

  // Stats placeholder
  const renderStats = () => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
      {Array.from(new Array(4)).map((_, index) => (
        <Paper
          key={index}
          sx={{
            p: 3,
            borderRadius: 2,
            flex: '1 1 calc(25% - 16px)',
            minWidth: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(25% - 16px)' },
            backgroundColor: theme.palette.mode === 'dark'
              ? 'rgba(255,255,255,0.05)'
              : 'rgba(0,0,0,0.02)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="text" width={80} sx={{ ml: 2 }} />
          </Box>
          <Skeleton variant="text" width={80} height={40} />
          <Skeleton variant="text" width={120} />
        </Paper>
      ))}
    </Box>
  );

  // Render appropriate skeleton type
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return renderCard();
      case 'table':
        return renderTable();
      case 'chart':
        return renderChart();
      case 'stats':
        return renderStats();
      default:
        return renderCard();
    }
  };

  return (
    <>
      {Array.from(new Array(count)).map((_, index) => (
        <Box key={index}>{renderSkeleton()}</Box>
      ))}
    </>
  );
}
