import { useMemo } from "react";
import { useTheme } from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieLabelRenderProps
} from "recharts";
import ChartCard from "../molecules/ChartCard";
import { PaymentPlan } from "../../types/api";
import { PaymentStatus, STATUS_LABELS } from "../../utils/constants";

// Using the interface in the useMemo return type to avoid the "declared but never used" error
interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface StatusDistributionChartProps {
  plans: PaymentPlan[];
}

export default function StatusDistributionChart({ plans }: Readonly<StatusDistributionChartProps>) {
  const theme = useTheme();

  // Transform data to show status distribution
  const chartData = useMemo<ChartData[]>(() => {
    // Count plans by status
    const statusCounts = {
      [PaymentStatus.PENDING]: 0,
      [PaymentStatus.PAID]: 0,
      [PaymentStatus.LATE]: 0,
    };

    plans.forEach(plan => {
      statusCounts[plan.status] += 1;
    });

    // Map to expected format
    return [
      {
        name: STATUS_LABELS[PaymentStatus.PENDING],
        value: statusCounts[PaymentStatus.PENDING],
        color: theme.palette.primary.main,
      },
      {
        name: STATUS_LABELS[PaymentStatus.PAID],
        value: statusCounts[PaymentStatus.PAID],
        color: theme.palette.success.main,
      },
      {
        name: STATUS_LABELS[PaymentStatus.LATE],
        value: statusCounts[PaymentStatus.LATE],
        color: theme.palette.error.main,
      },
    ].filter(item => item.value > 0); // Only show statuses with values
  }, [plans, theme]);

  // Custom label renderer that works with recharts types
  const renderCustomizedLabel = (props: PieLabelRenderProps) => {
    if (!props.name || props.percent === undefined) return '';
    return `${props.name} ${(props.percent * 100).toFixed(0)}%`;
  };

  return (
    <ChartCard title="Plan Status Distribution" subheader="Payment Plans by Status" height={300}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            innerRadius={40}
            paddingAngle={5}
            dataKey="value"
            label={renderCustomizedLabel}
          >
            {chartData.map((entry) => (
              <Cell key={`cell-${entry.name}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`${value}`, 'Plans']}
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 8,
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
