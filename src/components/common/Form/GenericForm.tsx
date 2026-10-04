'use client';

import React from 'react';
import { useForm, FieldValues, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { GenericFormProps } from './types';
import { FormField } from './FormField';

export const GenericForm = <T extends FieldValues>({
  schema,
  fields,
  onSubmit,
  defaultValues,
  submitText = 'Submit',
  submitIcon,
  submitClassName = '',
  isLoading = false,
  error = null,
  success = null,
  gridCols = 1,
  className = '',
  secondaryAction,
  footer,
  children,
  resetOnSubmit = false,
}: GenericFormProps<T>) => {
  const methods = useForm<T>({
    resolver: zodResolver(schema as any),
    defaultValues: defaultValues as any,
    mode: 'onTouched',
  });

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = methods;

  const handleFormSubmit: SubmitHandler<T> = async (data) => {
    try {
      await onSubmit(data, methods);
      if (resetOnSubmit) {
        reset();
      }
    } catch {
      // Errors are surfaced through the error prop or field errors
    }
  };

  const gridColClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }[gridCols];

  const loading = isLoading || isSubmitting;

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      noValidate
      className={`space-y-5 ${className}`}
    >
      {/* Global Server / API Error Banner */}
      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <span className="font-medium leading-relaxed">{error}</span>
        </div>
      )}

      {/* Global Success Banner */}
      {success && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start space-x-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
          <span className="font-medium leading-relaxed">{success}</span>
        </div>
      )}

      {/* Mapped Form Fields */}
      <div className={`grid ${gridColClasses} gap-4`}>
        {fields.map((fieldConfig) => {
          const fieldError = errors[fieldConfig.name]?.message as string | undefined;
          return (
            <FormField
              key={fieldConfig.name}
              config={fieldConfig}
              control={control}
              error={fieldError}
            />
          );
        })}
      </div>

      {/* Custom Children or Injected Slots */}
      {typeof children === 'function' ? children(methods) : children}

      {/* Submit and Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className={`
            inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl 
            text-xs font-bold uppercase tracking-wider bg-[#343131] text-[#FAF8F5] 
            hover:bg-[#FF8F00] hover:text-white transition-all shadow-xs 
            disabled:opacity-60 disabled:cursor-not-allowed
            ${submitClassName || 'w-full'}
          `}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span>{submitText}</span>
              {submitIcon ?? <ArrowRight className="w-3.5 h-3.5" />}
            </>
          )}
        </button>

        {secondaryAction}
      </div>

      {/* Footer Content */}
      {footer && <div className="pt-2">{footer}</div>}
    </form>
  );
};
