import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { ReactNode } from "react";
import { motion } from "framer-motion";

interface Column<T> {
  id: keyof T | string;
  label: string;
  render?: (item: T) => ReactNode;
  align?: "left" | "right" | "center";
  hideOnMobile?: boolean;
}

interface ResponsiveTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  emptyMessage?: string;
}

export default function ResponsiveTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = "No data available",
}: ResponsiveTableProps<T>) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Helper function to render cell content
  const renderCellContent = (item: T, column: Column<T>): ReactNode => {
    if (column.render) {
      return column.render(item);
    }

    if (typeof column.id === "string") {
      return "—";
    }

    return String(item[column.id] ?? "—");
  };

  // Mobile card view
  const renderMobileView = () => {
    if (data.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary">
            {emptyMessage}
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ mt: 2 }}>
        {data.map((item, index) => (
          <Card
            key={keyExtractor(item)}
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            sx={{
              mb: 2,
              borderRadius: 2,
              transition: "all 0.2s",
              "&:hover": {
                boxShadow: theme.shadows[4],
                transform: "translateY(-4px)",
              },
            }}
          >
            <CardContent sx={{ p: 2 }}>
              {columns
                .filter((col) => !col.hideOnMobile)
                .map((column, colIndex) => {
                  const value = renderCellContent(item, column);

                  return (
                    <Box
                      key={`${String(column.id)}-${colIndex}`}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        py: 1,
                        ...(colIndex < columns.length - 1 && {
                          borderBottom: `1px solid ${theme.palette.divider}`,
                        }),
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontWeight: 500 }}
                      >
                        {column.label}
                      </Typography>
                      <Box>{value}</Box>
                    </Box>
                  );
                })}
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  };

  // Desktop table view
  const renderTableView = () => {
    return (
      <TableContainer
        component={Paper}
        sx={{ borderRadius: 2, boxShadow: theme.shadows[1] }}
      >
        <Table aria-label="responsive table">
          <TableHead>
            <TableRow sx={{ backgroundColor: "rgba(0,0,0,0.02)" }}>
              {columns.map((column) => (
                <TableCell
                  key={String(column.id)}
                  align={column.align ?? "left"}
                  sx={{ fontWeight: 500 }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length > 0 ? (
              data.map((item, index) => (
                <TableRow
                  key={keyExtractor(item)}
                  component={motion.tr}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                    transition: "background-color 0.2s",
                    "&:hover": {
                      backgroundColor: "rgba(0,0,0,0.02)",
                    },
                  }}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={`${keyExtractor(item)}-${String(column.id)}`}
                      align={column.align ?? "left"}
                    >
                      {renderCellContent(item, column)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <Typography variant="body1" sx={{ py: 2 }}>
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return isMobile ? renderMobileView() : renderTableView();
}
