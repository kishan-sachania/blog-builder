'use client';

import React, { useState } from 'react';
import { Controller, Control, FieldValues } from 'react-hook-form';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { FormFieldConfig } from './types';

interface FormFieldProps<T extends FieldValues> {
  config: FormFieldConfig<T>;
  control: Control<T>;
  error?: string;
}

export const FormField = <T extends FieldValues>({
  config,
  control,
  error,
}: FormFieldProps<T>) => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    name,
    label,
    type,
    placeholder,
    helperText,
    icon: IconComponent,
    options = [],
    disabled,
    required,
    autoComplete,
    rows = 4,
    badge,
    className = '',
    inputClassName = '',
    render,
  } = config;

  const renderIcon = () => {
    if (!IconComponent) return null;
    if (React.isValidElement(IconComponent)) {
      return IconComponent;
    }
    const Icon = IconComponent as React.ComponentType<{ className?: string }>;
    return <Icon className="w-4 h-4 text-[#96918B]" />;
  };

  const hasError = Boolean(error);

  const baseInputStyles = `
    w-full text-xs text-[#343131] placeholder-[#96918B] bg-white border rounded-xl 
    transition-all duration-150 focus:outline-none focus:ring-2 disabled:bg-[#F5EFE6] 
    disabled:cursor-not-allowed
    ${hasError ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20' : 'border-[#EAE6DF] focus:border-[#FFB22C] focus:ring-[#FFB22C]/20'}
    ${inputClassName}
  `;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Label and Optional Badge Row */}
      {(label || badge) && (
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={name}
              className="block text-xs font-semibold text-[#343131]"
            >
              {label}
              {required && <span className="text-rose-500 ml-1">*</span>}
            </label>
          )}
          {badge && (
            <span className="text-[11px] text-[#96918B] font-normal">{badge}</span>
          )}
        </div>
      )}

      {/* Field Input Control */}
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          if (type === 'custom' && render) {
            return <>{render({ field, error, control })}</>;
          }

          if (type === 'checkbox') {
            return (
              <label className="inline-flex items-center space-x-2.5 cursor-pointer select-none">
                <input
                  id={name}
                  type="checkbox"
                  checked={Boolean(field.value)}
                  onChange={(e) => field.onChange(e.target.checked)}
                  disabled={disabled}
                  className="w-4 h-4 rounded-md border-[#D5CFC5] text-[#FF8F00] focus:ring-[#FFB22C] cursor-pointer"
                />
                {placeholder && (
                  <span className="text-xs text-[#6B6661] font-medium">{placeholder}</span>
                )}
              </label>
            );
          }

          if (type === 'select') {
            return (
              <div className="relative">
                {IconComponent && (
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    {renderIcon()}
                  </div>
                )}
                <select
                  id={name}
                  {...field}
                  value={field.value ?? ''}
                  disabled={disabled}
                  className={`
                    ${baseInputStyles} py-2.5
                    ${IconComponent ? 'pl-10 pr-8' : 'px-3.5 pr-8'}
                  `}
                >
                  {placeholder && (
                    <option value="" disabled>
                      {placeholder}
                    </option>
                  )}
                  {options.map((opt) => (
                    <option key={String(opt.value)} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          if (type === 'textarea') {
            return (
              <textarea
                id={name}
                {...field}
                value={field.value ?? ''}
                rows={rows}
                placeholder={placeholder}
                disabled={disabled}
                className={`${baseInputStyles} p-3.5 resize-y`}
              />
            );
          }

          const isPassword = type === 'password';
          const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

          return (
            <div className="relative">
              {IconComponent && (
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  {renderIcon()}
                </div>
              )}

              <input
                id={name}
                type={inputType}
                {...field}
                value={field.value ?? ''}
                placeholder={placeholder}
                disabled={disabled}
                autoComplete={autoComplete}
                className={`
                  ${baseInputStyles} py-2.5
                  ${IconComponent ? 'pl-10' : 'pl-3.5'}
                  ${isPassword ? 'pr-10' : 'pr-3.5'}
                `}
              />

              {isPassword && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#96918B] hover:text-[#343131] transition-colors p-0.5 focus:outline-none cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          );
        }}
      />

      {/* Helper text (when there is no error) */}
      {helperText && !hasError && (
        <p className="text-[11px] text-[#6B6661] leading-normal">{helperText}</p>
      )}

      {/* Human Readable Error Message Display */}
      {hasError && (
        <div className="flex items-center space-x-1.5 text-rose-600 text-xs mt-1 animate-in fade-in">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span className="font-medium text-[11px] leading-tight">{error}</span>
        </div>
      )}
    </div>
  );
};
