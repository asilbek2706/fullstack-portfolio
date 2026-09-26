import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';
const variants = cva('sp-button', {
  variants: {
    variant: {
      default: 'sp-button-primary',
      outline: 'sp-button-outline',
      ghost: 'sp-button-ghost',
    },
    size: { default: '', icon: 'sp-button-icon' },
  },
  defaultVariants: { variant: 'default', size: 'default' },
});
export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof variants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      data-slot="button"
      className={cn(variants({ variant, size }), className)}
      {...props}
    />
  );
}
