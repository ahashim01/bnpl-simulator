import { useMemo } from "react";
import { useTheme } from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import ChartCard from "../molecules/ChartCard";
import { PaymentPlan } from "../../types/api";
import { PaymentStatus } from "../../utils/constants";
import dayjs from "dayjs";

interface MonthData {
  name: string;
  total: number;
  collected: number;
  pending: number;
}

interface RevenueChartProps {
  plans: PaymentPlan[];
}

export default function RevenueChart({ plans }: Readonly<RevenueChartProps>) {
  const theme = useTheme();

  // Transform data to show monthly revenue
  const chartData = useMemo(() => {
    // Create map of months
    const months: Record<string, MonthData> = {};

    // Process each plan
    plans.forEach(plan => {
      // Get month and year from start date
      const startDate = dayjs(plan.start_date);
      const monthKey = startDate.format("MMM YYYY");

      // Initialize month data if it doesn't exist
      if (!months[monthKey]) {
        months[monthKey] = {
          name: monthKey,
          total: 0,
          collected: 0,
          pending: 0
        };
      }

      // Add to total revenue
      const amount = parseFloat(plan.total_amount);
      months[monthKey].total += amount;

      // Add to collected or pending based on status
      if (plan.status === PaymentStatus.PAID) {
        months[monthKey].collected += amount;
      } else {
        // Calculate the already collected amount for this plan
        const collected = plan.installments
          .filter(i => i.status === PaymentStatus.PAID)
          .reduce((sum, i) => sum + parseFloat(i.amount), 0);

        months[monthKey].collected += collected;
        months[monthKey].pending += (amount - collected);
      }
    });

    // Convert to array and sort by date
    return Object.values(months)
      .sort((a, b) => {
        const dateA = dayjs(a.name, "MMM YYYY");
        const dateB = dayjs(b.name, "MMM YYYY");
        return dateA.diff(dateB);
      });
  }, [plans]);

  // Custom formatter for tooltips that properly types the value parameter
  const formatTooltip = (value: any) => [`${value.toLocaleString()} SAR`, undefined];

  // Custom tick formatter for Y axis
  const formatYAxisTick = (value: any) => `${value.toLocaleString()} SAR`;

  return (
    <ChartCard title="Monthly Revenue" subheader="Total vs. Collected Revenue" height={300}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis
            dataKey="name"
            stroke={theme.palette.text.secondary}
            tick={{ fontSize: '12px' }}
          />
          <YAxis
            stroke={theme.palette.text.secondary}
            tick={{ fontSize: '12px' }}
            tickFormatter={formatYAxisTick}
          />
          <Tooltip
            formatter={formatTooltip}
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 8,
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="total"
            name="Total Revenue"
            stroke={theme.palette.primary.main}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="collected"
            name="Collected Revenue"
            stroke={theme.palette.success.main}
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="pending"
            name="Pending Revenue"
            stroke={theme.palette.warning.main}
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
