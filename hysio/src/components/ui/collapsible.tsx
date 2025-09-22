'use client';

import * as React from 'react';

interface CollapsibleProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

interface CollapsibleTriggerProps {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}

interface CollapsibleContentProps {
  children: React.ReactNode;
  className?: string;
}

const CollapsibleContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
} | null>(null);

export function Collapsible({
  open,
  defaultOpen = false,
  onOpenChange,
  children,
  className = ''
}: CollapsibleProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);

  const currentOpen = open !== undefined ? open : internalOpen;

  const handleOpenChange = React.useCallback((newOpen: boolean) => {
    if (open === undefined) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  }, [open, onOpenChange]);

  return (
    <CollapsibleContext.Provider value={{ open: currentOpen, onOpenChange: handleOpenChange }}>
      <div className={className}>
        {children}
      </div>
    </CollapsibleContext.Provider>
  );
}

export function CollapsibleTrigger({
  children,
  className = '',
  asChild = false
}: CollapsibleTriggerProps) {
  const context = React.useContext(CollapsibleContext);

  if (!context) {
    throw new Error('CollapsibleTrigger must be used within Collapsible');
  }

  const handleClick = () => {
    context.onOpenChange(!context.open);
  };

  if (asChild) {
    return React.cloneElement(children as React.ReactElement, {
      onClick: handleClick,
      'aria-expanded': context.open,
      'data-state': context.open ? 'open' : 'closed',
    });
  }

  return (
    <button
      type="button"
      className={className}
      onClick={handleClick}
      aria-expanded={context.open}
      data-state={context.open ? 'open' : 'closed'}
    >
      {children}
    </button>
  );
}

export function CollapsibleContent({
  children,
  className = ''
}: CollapsibleContentProps) {
  const context = React.useContext(CollapsibleContext);

  if (!context) {
    throw new Error('CollapsibleContent must be used within Collapsible');
  }

  if (!context.open) {
    return null;
  }

  return (
    <div
      className={className}
      data-state={context.open ? 'open' : 'closed'}
    >
      {children}
    </div>
  );
}