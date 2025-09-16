'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, Menu, X, ArrowRight } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

export interface MarketingNavigationProps {
  className?: string;
}

const MarketingNavigation: React.FC<MarketingNavigationProps> = ({ className }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isToolkitOpen, setIsToolkitOpen] = React.useState(false);
  const router = useRouter();

  const toolkitItems = [
    { name: 'Hysio Scribe', href: '/scribe', description: 'AI-ondersteunde documentatie' },
    { name: 'Assistant', href: '/assistant', description: 'Intelligente fysiotherapie-assistent' },
    { name: 'SmartMail', href: '/smartmail-demo', description: 'Geautomatiseerde communicatie' },
    { name: 'Diagnosecode', href: '/diagnosecode', description: 'Slimme diagnose herkenning' },
    { name: 'Dashboard', href: '/dashboard', description: 'Overzicht en analytics' },
  ];

  const mainNavItems = [
    { name: 'Over Ons', href: '/over-ons' },
    { name: 'Blog', href: '/blog' },
    { name: 'Prijzen', href: '/prijzen' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <nav className={cn(
      'sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-hysio-mint/20 shadow-sm',
      className
    )}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-hysio-mint/20 rounded-lg flex items-center justify-center">
              <span className="text-hysio-deep-green font-bold text-lg">H</span>
            </div>
            <span className="text-2xl font-bold text-hysio-deep-green">Hysio</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {/* Hysio Toolkit Dropdown */}
            <div className="relative group">
              <button
                onMouseEnter={() => setIsToolkitOpen(true)}
                onMouseLeave={() => setIsToolkitOpen(false)}
                className="flex items-center gap-1 text-hysio-deep-green hover:text-hysio-mint-dark transition-colors py-2"
              >
                <span>Hysio Toolkit</span>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isToolkitOpen && "rotate-180"
                )} />
              </button>

              {/* Dropdown Menu */}
              <div
                className={cn(
                  "absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-hysio-mint/20 transition-all duration-200",
                  isToolkitOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"
                )}
                onMouseEnter={() => setIsToolkitOpen(true)}
                onMouseLeave={() => setIsToolkitOpen(false)}
              >
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-hysio-deep-green mb-3">Ontdek onze tools</h3>
                  <div className="space-y-2">
                    {toolkitItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="block p-3 rounded-md hover:bg-hysio-mint/10 transition-colors group"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium text-hysio-deep-green group-hover:text-hysio-mint-dark transition-colors">
                              {item.name}
                            </div>
                            <div className="text-sm text-hysio-deep-green/70 mt-1">
                              {item.description}
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-hysio-mint-dark opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Navigation Items */}
            {mainNavItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-hysio-deep-green hover:text-hysio-mint-dark transition-colors"
              >
                {item.name}
              </Link>
            ))}

            {/* CTA Button */}
            <Button
              onClick={() => router.push('/scribe')}
              className="bg-hysio-mint hover:bg-hysio-mint-dark text-hysio-deep-green font-semibold px-6"
            >
              Start Nu
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 border-t border-hysio-mint/20 pt-4">
            <div className="space-y-4">
              {/* Mobile Toolkit Section */}
              <div>
                <h3 className="text-sm font-semibold text-hysio-deep-green mb-2 px-2">Hysio Toolkit</h3>
                <div className="space-y-1">
                  {toolkitItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="block p-3 rounded-md hover:bg-hysio-mint/10 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="font-medium text-hysio-deep-green">{item.name}</div>
                      <div className="text-sm text-hysio-deep-green/70">{item.description}</div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Mobile Main Navigation */}
              <div className="border-t border-hysio-mint/20 pt-4">
                <div className="space-y-1">
                  {mainNavItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="block p-3 text-hysio-deep-green hover:text-hysio-mint-dark hover:bg-hysio-mint/10 rounded-md transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Mobile CTA */}
              <div className="border-t border-hysio-mint/20 pt-4">
                <Button
                  onClick={() => {
                    router.push('/scribe');
                    setIsMenuOpen(false);
                  }}
                  className="w-full bg-hysio-mint hover:bg-hysio-mint-dark text-hysio-deep-green font-semibold"
                >
                  Start Nu
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export { MarketingNavigation };