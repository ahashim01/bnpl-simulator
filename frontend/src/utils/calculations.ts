import { PaymentStatus } from "./constants";

export const calculateTotalAmount = (
    installments: Array<{ amount: string; status?: PaymentStatus }>
  ): number => {
    return installments.reduce((sum, inst) => sum + parseFloat(inst.amount), 0);
  };

  export const calculatePaidAmount = (
    installments: Array<{ amount: string; status: PaymentStatus }>
  ): number => {
    return installments
      .filter(inst => inst.status === PaymentStatus.PAID)
      .reduce((sum, inst) => sum + parseFloat(inst.amount), 0);
  };
