import React, { forwardRef } from 'react';

export const Input = forwardRef(function Input({ className = '', ...props }, ref) {
  return (
    <input
      ref={ref}
      className={[
        'min-h-11 w-full rounded-2xl border border-mist-200 bg-white px-4 py-3 text-sm text-mist-800 outline-none transition placeholder:text-mist-400 focus:border-leaf-400 focus:ring-4 focus:ring-leaf-100',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  );
});
