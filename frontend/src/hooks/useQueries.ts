import { useQuery, useMutation, UseQueryResult, UseMutationResult, useQueryClient } from "@tanstack/react-query";
import apiService from "../services/api";
import { CreatePlanRequest, PaymentPlan, User } from "../types/api";

// Hook for fetching payment plans
export function usePlans(): UseQueryResult<PaymentPlan[], Error> {
  return useQuery({
    queryKey: ["plans"],
    queryFn: () => apiService.getPlans(),
    refetchOnWindowFocus: false,
    staleTime: 60000, // 1 minute
  });
}

// Hook for fetching customers (for merchants only)
export function useCustomers(): UseQueryResult<User[], Error> {
  return useQuery({
    queryKey: ["customers"],
    queryFn: () => apiService.getCustomers(),
    refetchOnWindowFocus: false,
    staleTime: 300000, // 5 minutes
  });
}

// Hook for creating a payment plan
export function useCreatePlan(): UseMutationResult<PaymentPlan, Error, CreatePlanRequest> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planData: CreatePlanRequest) => apiService.createPlan(planData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
  });
}

// Hook for paying an installment
export function usePayInstallment(): UseMutationResult<void, Error, number> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (installmentId: number) => apiService.payInstallment(installmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
  });
}
