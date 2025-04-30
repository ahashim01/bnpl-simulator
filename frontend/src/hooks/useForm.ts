import { useState, ChangeEvent } from "react";

type FormErrors<T> = {
  [K in keyof T]?: string;
};

interface UseFormOptions<T> {
  initialValues: T;
  onSubmit: (values: T) => Promise<void> | void;
  validate?: (values: T) => FormErrors<T>;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  onSubmit,
  validate,
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue = type === "number" ? Number(value) : value;

    setValues(prev => ({ ...prev, [name]: newValue }));

    // Clear field error when value changes
    if (errors[name as keyof T]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof T];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setHasSubmitted(true);

    // Run validation if provided
    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);

      // Don't submit if there are validation errors
      if (Object.keys(validationErrors).length > 0) {
        return;
      }
    }

    setIsSubmitting(true);

    try {
      await onSubmit(values);
    } catch (error: any) {
      // Handle API errors if needed
      if (error.response?.data) {
        const apiErrors: FormErrors<T> = {};

        Object.entries(error.response.data).forEach(([key, value]) => {
          if (key in values) {
            apiErrors[key as keyof T] = Array.isArray(value)
              ? value.join(', ')
              : String(value);
          }
        });

        setErrors(apiErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setHasSubmitted(false);
  };

  return {
    values,
    errors,
    isSubmitting,
    hasSubmitted,
    handleChange,
    handleSubmit,
    setValues,
    setFieldValue: (name: keyof T, value: any) => {
      setValues(prev => ({ ...prev, [name]: value }));

      // Clear field error when value changes
      if (errors[name]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    reset,
  };
}
