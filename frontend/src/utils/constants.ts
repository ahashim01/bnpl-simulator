export enum PaymentStatus {
    PENDING = "P",
    PAID = "D",
    LATE = "L"
  }

export const STATUS_LABELS = {
[PaymentStatus.PENDING]: "Pending",
[PaymentStatus.PAID]: "Paid",
[PaymentStatus.LATE]: "Late"
};

export const PLAN_STATUS_LABELS = {
[PaymentStatus.PENDING]: "In Progress",
[PaymentStatus.PAID]: "Paid",
[PaymentStatus.LATE]: "Late"
};

export const STATUS_COLORS: Record<PaymentStatus, "success" | "warning" | "primary" | "error"> = {
[PaymentStatus.PENDING]: "primary",
[PaymentStatus.PAID]: "success",
[PaymentStatus.LATE]: "error"
};
