import { useState, ChangeEvent } from "react";
import { z } from 'zod';

type FormErrors<T> = {
  [K in keyof T]?: string;
};

interface UseFormOptions<T, S extends z.ZodType<any, any>> {
  initialValues: T;
  validationSchema?: S;
  onSubmit: (values: z.infer<S>) => Promise<void> | void;
}

export function useForm<
  T extends Record<string, any>,
  S extends z.ZodType<any, any> = z.ZodType<T>
>({
  initialValues,
  validationSchema,
  onSubmit,
}: UseFormOptions<T, S>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    let newValue: any = value;

    // Type conversions
    if (type === "number") {
      newValue = value === '' ? '' : Number(value);
    } else if (type === "checkbox") {
      newValue = (e.target as HTMLInputElement).checked;
    }

    setValues((prev: T) => ({ ...prev, [name]: newValue }));

    // Clear field error when value changes
    if (errors[name as keyof T]) {
      setErrors((prev: FormErrors<T>) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof T];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    if (!validationSchema) return true;

    const result = validationSchema.safeParse(values);

    if (!result.success) {
      const newErrors: FormErrors<T> = {};

      // Convert Zod errors to our format
      result.error.errors.forEach((err: any) => {
        const path = err.path[0] as keyof T;
        newErrors[path] = err.message;
      });

      setErrors(newErrors);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setHasSubmitted(true);

    // Run validation
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // Type assertion is safe because we've validated with the schema
      await onSubmit(values as z.infer<S>);
    } catch (error: any) {
      // Handle API errors
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
      setValues((prev: T) => ({ ...prev, [name]: value }));

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
    validate,
  };
}
