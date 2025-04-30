import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Search as SearchIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import { useState } from "react";
import { useCustomers } from "../hooks/useQueries";
import DashboardLayout from "../components/layouts/DashboardLayout";
import { User } from "../types/api";
import ErrorFallback from "../components/molecules/ErrorFallback";

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: customers = [], isLoading, error, refetch } = useCustomers();

  // Filter customers based on search term
  const filteredCustomers = customers.filter((customer) => {
    const term = searchTerm.toLowerCase();
    return (
      customer.username.toLowerCase().includes(term) ||
      customer.email.toLowerCase().includes(term) ||
      customer.id.toString().includes(term)
    );
  });

  if (error) {
    return (
      <DashboardLayout>
        <ErrorFallback error={error} resetError={() => refetch()} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="500">
            Customers
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage your customers
          </Typography>
        </Box>
        <Box>
          <IconButton color="primary" onClick={() => refetch()} title="Refresh list">
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      <Card sx={{ mb: 4, p: 2 }}>
        <TextField
          fullWidth
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Card>

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={24} />
                  <Typography variant="body2" sx={{ ml: 2 }}>
                    Loading customers...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1">
                    {searchTerm ? "No customers match your search" : "No customers found"}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow key={customer.id} hover>
                  <TableCell>{customer.id}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          mr: 1,
                          bgcolor: customer.isMerchant ? 'primary.main' : 'success.main'
                        }}
                      >
                        {customer.username.charAt(0).toUpperCase()}
                      </Avatar>
                      {customer.username}
                    </Box>
                  </TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={customer.isMerchant ? "Merchant" : "Customer"}
                      color={customer.isMerchant ? "primary" : "success"}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {/* Implement view customer details */}}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </DashboardLayout>
  );
}
