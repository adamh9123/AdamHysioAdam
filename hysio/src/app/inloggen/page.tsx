'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ArrowLeft,
  Mail,
  Eye,
  EyeOff,
  Lock,
  AlertTriangle,
  LogIn,
  UserCheck
} from 'lucide-react';

export default function Inloggen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  // Form state
  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.email.trim()) newErrors.email = 'E-mailadres is verplicht';
    if (!formData.password) newErrors.password = 'Wachtwoord is verplicht';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Voer een geldig e-mailadres in';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Simulate login API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // TODO: Implement actual login logic here
      console.log('Login data:', formData);

      // For now, redirect to dashboard
      router.push('/dashboard');

    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'Inloggen mislukt. Controleer uw gegevens en probeer opnieuw.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    setIsLoading(true);

    // TODO: Implement social login
    console.log(`Social login with ${provider}`);

    // Simulate social login
    setTimeout(() => {
      setIsLoading(false);
      router.push('/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-hysio-mint">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-hysio-mint/20 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-hysio-mint/20 rounded-lg flex items-center justify-center">
                <span className="text-hysio-deep-green font-bold text-lg">H</span>
              </div>
              <span className="text-2xl font-bold text-hysio-deep-green">Hysio</span>
            </Link>

            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="text-hysio-deep-green hover:text-hysio-mint-dark"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Terug naar Home
            </Button>
          </div>
        </div>
      </nav>

      {/* Login Section */}
      <section className="py-12">
        <div className="container mx-auto px-6 max-w-2xl">
          <Card className="bg-hysio-off-white border-white/20 shadow-xl">
            <CardHeader className="text-center pb-8">
              <div className="w-20 h-20 bg-hysio-mint/20 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <UserCheck className="h-10 w-10 text-hysio-mint-dark" />
              </div>
              <CardTitle className="text-3xl font-bold text-hysio-deep-green mb-4">
                Welkom terug
              </CardTitle>
              <CardDescription className="text-lg text-hysio-deep-green-900/80">
                Log in op uw Hysio account om verder te gaan met uw AI-ondersteunde documentatie
              </CardDescription>
            </CardHeader>

            <CardContent className="p-8">
              {/* General Error */}
              {errors.general && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <AlertTriangle size={16} />
                    {errors.general}
                  </p>
                </div>
              )}

              {/* Social Login Buttons */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-hysio-deep-green text-center mb-3">
                  Snel inloggen met
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleSocialLogin('google')}
                    disabled={isLoading}
                    className="border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-4"
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handleSocialLogin('apple')}
                    disabled={isLoading}
                    className="border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-4"
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
                    </svg>
                    Apple
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handleSocialLogin('facebook')}
                    disabled={isLoading}
                    className="border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-4"
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handleSocialLogin('linkedin')}
                    disabled={isLoading}
                    className="border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-4"
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path fill="#0077B5" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    LinkedIn
                  </Button>
                </div>
              </div>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-hysio-mint/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-hysio-off-white text-hysio-deep-green-900/60">
                    Of log in met e-mail
                  </span>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-hysio-deep-green">
                      E-mailadres
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-hysio-deep-green-900/50" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="uweemail@praktijk.nl"
                        disabled={isLoading}
                        className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                        autoComplete="email"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertTriangle size={14} />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-hysio-deep-green">
                        Wachtwoord
                      </Label>
                      <Link
                        href="/wachtwoord-vergeten"
                        className="text-sm text-hysio-mint-dark hover:underline"
                      >
                        Wachtwoord vergeten?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-hysio-deep-green-900/50" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="Uw wachtwoord"
                        disabled={isLoading}
                        className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                        autoComplete="current-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </Button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertTriangle size={14} />
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="rememberMe"
                      checked={formData.rememberMe}
                      onCheckedChange={(checked) => handleInputChange('rememberMe', checked as boolean)}
                      disabled={isLoading}
                    />
                    <Label htmlFor="rememberMe" className="text-sm text-hysio-deep-green cursor-pointer">
                      Ingelogd blijven
                    </Label>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isLoading}
                    className="w-full bg-hysio-deep-green hover:bg-hysio-deep-green-900 text-white font-semibold text-lg py-6"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Inloggen...
                      </>
                    ) : (
                      <>
                        <LogIn className="mr-2 h-5 w-5" />
                        Inloggen
                      </>
                    )}
                  </Button>
                </div>

                {/* Register Link */}
                <div className="text-center pt-4">
                  <p className="text-sm text-hysio-deep-green-900/70">
                    Nog geen account?{' '}
                    <Link
                      href="/registreer"
                      className="text-hysio-mint-dark hover:underline font-medium"
                    >
                      Gratis registreren
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Trust Indicators */}
          <div className="mt-8 text-center">
            <div className="flex justify-center items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-hysio-deep-green-900/70">
                <Lock className="h-4 w-4 text-hysio-emerald" />
                <span>Beveiligde verbinding</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-hysio-deep-green-900/70">
                <UserCheck className="h-4 w-4 text-hysio-emerald" />
                <span>AVG-compliant</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}