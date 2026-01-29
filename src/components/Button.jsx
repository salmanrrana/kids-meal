/**
 * Button Component - Luxury styling with design tokens
 *
 * Variants: primary, secondary, tertiary
 * States: default, hover, active, disabled
 * Sizes: sm, md, lg
 *
 * Usage:
 * <Button variant="primary">Click me</Button>
 * <Button variant="secondary" size="lg" disabled>Disabled</Button>
 */

import React from 'react';
import './Button.css';

const Button = React.forwardRef(
  (
    {
      variant = 'primary',
      size = 'md',
      disabled = false,
      children,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    const classes = [
      'btn',
      `btn-${variant}`,
      `btn-${size}`,
      disabled && 'btn-disabled',
      className
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={classes}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
