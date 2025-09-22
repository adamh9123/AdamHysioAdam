'use client';

import * as React from 'react';

interface TabsProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

const TabsContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
} | null>(null);

export function Tabs({
  value,
  defaultValue,
  onValueChange,
  children,
  className = ''
}: TabsProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || '');

  const currentValue = value !== undefined ? value : internalValue;

  const handleValueChange = React.useCallback((newValue: string) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  }, [value, onValueChange]);

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  children,
  className = ''
}: TabsListProps) {
  return (
    <div
      className={`inline-flex h-10 items-center justify-center rounded-md bg-hysio-mint/10 p-1 text-hysio-deep-green-900 ${className}`}
      role="tablist"
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  className = '',
  disabled = false
}: TabsTriggerProps) {
  const context = React.useContext(TabsContext);

  if (!context) {
    throw new Error('TabsTrigger must be used within Tabs');
  }

  const isActive = context.value === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hysio-mint focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
        isActive
          ? 'bg-white text-hysio-deep-green shadow-sm'
          : 'text-hysio-deep-green-900/70 hover:text-hysio-deep-green'
      } ${className}`}
      onClick={() => !disabled && context.onValueChange(value)}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  children,
  className = ''
}: TabsContentProps) {
  const context = React.useContext(TabsContext);

  if (!context) {
    throw new Error('TabsContent must be used within Tabs');
  }

  if (context.value !== value) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      className={`mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hysio-mint focus-visible:ring-offset-2 ${className}`}
    >
      {children}
    </div>
  );
}