import { ReactNode } from 'react';
import { Path, FieldValues, UseFormReturn, Control } from 'react-hook-form';
import { LucideIcon } from 'lucide-react';
import { ZodType } from 'zod';

export type FormFieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'custom';

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface FormFieldConfig<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  type: FormFieldType;
  placeholder?: string;
  helperText?: string;
  icon?: LucideIcon | ReactNode;
  options?: SelectOption[];
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
  rows?: number;
  badge?: string;
  className?: string;
  inputClassName?: string;
  render?: (props: {
    field: any;
    error?: string;
    control: Control<T>;
  }) => ReactNode;
}

export interface GenericFormProps<T extends FieldValues> {
  schema: ZodType<T, any, any>;
  fields: FormFieldConfig<T>[];
  onSubmit: (data: T, methods: UseFormReturn<T>) => Promise<void> | void;
  defaultValues?: Partial<T>;
  submitText?: string;
  submitIcon?: ReactNode;
  submitClassName?: string;
  isLoading?: boolean;
  error?: string | null;
  success?: string | null;
  gridCols?: 1 | 2;
  className?: string;
  secondaryAction?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode | ((methods: UseFormReturn<T>) => ReactNode);
  resetOnSubmit?: boolean;
}
