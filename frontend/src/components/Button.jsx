export function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  ...props
}) {
  const baseClassName =
    'inline-flex items-center justify-center rounded-full border font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60';

  const variantClassName = {
    primary:
      'border-leaf-600 bg-leaf-600 text-white shadow-soft hover:bg-leaf-700 focus:ring-leaf-300',
    secondary:
      'border-mist-200 bg-white text-mist-800 hover:border-mist-300 hover:bg-mist-50 focus:ring-mist-200',
    danger:
      'border-orange-700 bg-orange-700 text-white hover:bg-orange-800 focus:ring-orange-300',
    ghost:
      'border-transparent bg-transparent text-mist-700 hover:bg-mist-100 focus:ring-mist-200',
  }[variant];

  const sizeClassName = {
    sm: 'min-h-9 px-3 text-sm',
    md: 'min-h-11 px-4 text-sm',
    lg: 'min-h-12 px-5 text-base',
  }[size];

  return (
    <button
      type={type}
      className={[baseClassName, variantClassName, sizeClassName, className].filter(Boolean).join(' ')}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
