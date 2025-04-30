import { useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid as MuiGrid,
  Paper,
  useTheme,
} from "@mui/material";
import { Installment } from "../../types/api";
import { PaymentStatus } from "../../utils/constants";
import { formatCurrency } from "../../utils/formatting";
import dayjs from "dayjs";

// Create a properly typed wrapper for Grid item
const Grid = MuiGrid as React.ComponentType<any>;

interface PaymentCalendarProps {
  installments: Installment[];
}

interface DayInfo {
  date: dayjs.Dayjs;
  installments: Installment[];
  isCurrentMonth: boolean;
  isToday: boolean;
}

export default function PaymentCalendar({ installments }: Readonly<PaymentCalendarProps>) {
  const theme = useTheme();
  const today = dayjs();

  // Filter only pending installments
  const pendingInstallments = installments.filter(
    inst => inst.status === PaymentStatus.PENDING
  );

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const daysInMonth = today.daysInMonth();
    const firstDayOfMonth = today.startOf('month');
    const startDay = firstDayOfMonth.day(); // 0-6 (Sunday-Saturday)

    // Get days from previous month to fill the first week
    const prevMonthDays: DayInfo[] = [];
    for (let i = startDay - 1; i >= 0; i--) {
      const date = firstDayOfMonth.subtract(i + 1, 'day');
      prevMonthDays.push({
        date,
        installments: pendingInstallments.filter(inst =>
          dayjs(inst.due_date).format('YYYY-MM-DD') === date.format('YYYY-MM-DD')
        ),
        isCurrentMonth: false,
        isToday: date.format('YYYY-MM-DD') === today.format('YYYY-MM-DD'),
      });
    }

    // Current month days
    const currentMonthDays: DayInfo[] = [];
    for (let i = 0; i < daysInMonth; i++) {
      const date = firstDayOfMonth.add(i, 'day');
      currentMonthDays.push({
        date,
        installments: pendingInstallments.filter(inst =>
          dayjs(inst.due_date).format('YYYY-MM-DD') === date.format('YYYY-MM-DD')
        ),
        isCurrentMonth: true,
        isToday: date.format('YYYY-MM-DD') === today.format('YYYY-MM-DD'),
      });
    }

    // Next month days to complete the grid (to make it 6 rows)
    const nextMonthDays: DayInfo[] = [];
    const totalDays = prevMonthDays.length + currentMonthDays.length;
    const remainingDays = 42 - totalDays; // 6 rows × 7 days

    for (let i = 0; i < remainingDays; i++) {
      const date = firstDayOfMonth.add(daysInMonth + i, 'day');
      nextMonthDays.push({
        date,
        installments: pendingInstallments.filter(inst =>
          dayjs(inst.due_date).format('YYYY-MM-DD') === date.format('YYYY-MM-DD')
        ),
        isCurrentMonth: false,
        isToday: false, // Next month can't be today
      });
    }

    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  }, [pendingInstallments, today]);

  // Day names
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Function to determine cell background color to avoid nested ternary
  const getCellBackgroundColor = (dayInfo: DayInfo) => {
    if (dayInfo.isToday) {
      return theme.palette.primary.light;
    }
    if (dayInfo.installments.length > 0) {
      return theme.palette.warning.light;
    }
    return 'transparent';
  };

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            Payment Calendar
          </Typography>
          <Typography variant="subtitle1" color="primary.main">
            {today.format('MMMM YYYY')}
          </Typography>
        </Box>

        <Grid container spacing={1}>
          {/* Day names */}
          {dayNames.map(day => (
            <Grid item xs={12/7} key={`header-${day}`}>
              <Box sx={{ textAlign: 'center', py: 1 }}>
                <Typography variant="body2" fontWeight={500}>
                  {day}
                </Typography>
              </Box>
            </Grid>
          ))}

          {/* Calendar days */}
          {calendarDays.map((dayInfo) => (
            <Grid item xs={12/7} key={`day-${dayInfo.date.format('YYYY-MM-DD')}`}>
              <Paper
                elevation={0}
                sx={{
                  p: 1,
                  height: '100%',
                  opacity: dayInfo.isCurrentMonth ? 1 : 0.5,
                  backgroundColor: getCellBackgroundColor(dayInfo),
                  border: dayInfo.isToday
                    ? `2px solid ${theme.palette.primary.main}`
                    : '1px solid transparent',
                  borderRadius: 1,
                }}
              >
                <Typography
                  variant="body2"
                  textAlign="center"
                  fontWeight={dayInfo.isToday ? 700 : 400}
                  color={dayInfo.isToday ? theme.palette.primary.dark : 'inherit'}
                >
                  {dayInfo.date.date()}
                </Typography>

                {dayInfo.installments.length > 0 && (
                  <Box sx={{ mt: 0.5 }}>
                    {dayInfo.installments.map(inst => (
                      <Typography
                        key={inst.id}
                        variant="caption"
                        sx={{
                          display: 'block',
                          textAlign: 'center',
                          backgroundColor: dayInfo.isToday
                            ? theme.palette.primary.main
                            : theme.palette.warning.main,
                          color: '#fff',
                          p: 0.5,
                          borderRadius: 0.5,
                          mt: 0.5,
                          fontSize: '0.65rem',
                        }}
                      >
                        {formatCurrency(inst.amount)}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}
