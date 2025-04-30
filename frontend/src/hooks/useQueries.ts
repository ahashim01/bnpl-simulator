import {
  useQuery,
  useMutation,
  UseQueryResult,
  UseMutationResult,
  useQueryClient
} from "@tanstack/react-query";
import apiService from "../services/api";
import { CreatePlanRequest, PaymentPlan, User, PaymentStatus } from "../types/api";

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
    onSuccess: (newPlan) => {
      // Update cache with the new plan
      queryClient.setQueryData<PaymentPlan[]>(["plans"], (old = []) => {
        return [...old, newPlan];
      });
    },
  });
}

// Hook for paying an installment with optimistic updates
export function usePayInstallment(): UseMutationResult<void, Error, number> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (installmentId: number) => apiService.payInstallment(installmentId),
    // Implement optimistic updates
    onMutate: async (installmentId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["plans"] });

      // Snapshot the previous value
      const previousPlans = queryClient.getQueryData<PaymentPlan[]>(["plans"]);

      // Optimistically update to the new value
      if (previousPlans) {
        queryClient.setQueryData<PaymentPlan[]>(["plans"], (old = []) => {
          return old.map(plan => {
            // Find the plan containing this installment
            const hasInstallment = plan.installments.some(inst => inst.id === installmentId);

            if (hasInstallment) {
              // Update the installment status
              const updatedInstallments = plan.installments.map(inst =>
                inst.id === installmentId
                  ? { ...inst, status: PaymentStatus.PAID }
                  : inst
              );

              // Calculate if all installments are now paid
              const allPaid = updatedInstallments.every(inst => inst.status === PaymentStatus.PAID);

              // Return updated plan
              return {
                ...plan,
                installments: updatedInstallments,
                paid_installments: plan.paid_installments + 1,
                status: allPaid ? PaymentStatus.PAID : plan.status
              };
            }

            return plan;
          });
        });
      }

      // Return the snapshot so we can rollback if needed
      return { previousPlans };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (_err, _, context) => {
      if (context?.previousPlans) {
        queryClient.setQueryData(["plans"], context.previousPlans);
      }
    },
    // Always refetch after error or success to ensure data is correct
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
  });
}
