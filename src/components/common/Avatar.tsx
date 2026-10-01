'use client';

import React from 'react';
import Image from 'next/image';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  className = ''
}) => {
  const [imageError, setImageError] = React.useState(false);

  const getInitials = (n: string) => {
    if (!n) return 'CT';
    const parts = n.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return n.substring(0, 2).toUpperCase();
  };

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl'
  }[size];

  const dimension = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80
  }[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden bg-[#FAF3E0] text-[#343131] border border-[#EAE6DF] font-medium shrink-0 select-none shadow-xs ${sizeClasses} ${className}`}
    >
      {src && !imageError ? (
        <Image
          src={src}
          alt={name}
          width={dimension}
          height={dimension}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
          unoptimized
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
};
