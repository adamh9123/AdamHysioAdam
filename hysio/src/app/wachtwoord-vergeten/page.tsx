'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  Mail,
  Send,
  CheckCircle,
  AlertTriangle,
  Lock,
  KeyRound
} from 'lucide-react';

export default function WachtwoordVergeten() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isEmailSent, setIsEmailSent] = React.useState(false);

  // Form state
  const [email, setEmail] = React.useState('');
  const [error, setError] = React.useState('');

  const validateEmail = () => {
    if (!email.trim()) {
      setError('E-mailadres is verplicht');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Voer een geldig e-mailadres in');
      return false;
    }

    return true;
  };

  const handleInputChange = (value: string) => {
    setEmail(value);
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail()) return;

    setIsLoading(true);

    try {
      // Simulate password reset email API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // TODO: Implement actual password reset logic here
      console.log('Password reset email sent to:', email);

      setIsEmailSent(true);

    } catch (error) {
      console.error('Password reset error:', error);
      setError('Er ging iets mis. Probeer het later opnieuw.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-hysio-mint flex flex-col">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-hysio-mint/20 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-hysio-mint/20 rounded-lg flex items-center justify-center">
                <span className="text-hysio-deep-green font-bold text-lg">H</span>
              </div>
              <span className="text-2xl font-bold text-hysio-deep-green">Hysio</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push('/inloggen')}
              className="text-hysio-deep-green hover:text-hysio-mint-dark"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Terug naar inloggen
            </Button>
          </div>

          <Card className="shadow-2xl border-hysio-mint/20">
            <CardHeader className="space-y-2 pb-4">
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 bg-hysio-mint/10 rounded-full">
                  <KeyRound className="h-10 w-10 text-hysio-deep-green" />
                </div>
              </div>
              <CardTitle className="text-3xl text-center text-hysio-deep-green">
                Wachtwoord Vergeten?
              </CardTitle>
              <CardDescription className="text-center text-base">
                {isEmailSent
                  ? 'Controleer je e-mail voor instructies'
                  : 'Geen probleem! We sturen je een herstellink'
                }
              </CardDescription>
            </CardHeader>

            <CardContent>
              {!isEmailSent ? (
                // Email Form
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* General Error */}
                  {error && error !== 'E-mailadres is verplicht' && error !== 'Voer een geldig e-mailadres in' && (
                    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}

                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-hysio-deep-green font-medium">
                      E-mailadres <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-hysio-deep-green/50" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="jouw@email.nl"
                        value={email}
                        onChange={(e) => handleInputChange(e.target.value)}
                        className={`pl-10 border-hysio-mint/40 focus:border-hysio-mint focus:ring-hysio-mint h-11 ${
                          error && (error === 'E-mailadres is verplicht' || error === 'Voer een geldig e-mailadres in')
                            ? 'border-red-300 focus:border-red-400 focus:ring-red-400'
                            : ''
                        }`}
                        disabled={isLoading}
                      />
                    </div>
                    {error && (error === 'E-mailadres is verplicht' || error === 'Voer een geldig e-mailadres in') && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {error}
                      </p>
                    )}
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Lock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Hoe werkt het?</p>
                        <ol className="list-decimal list-inside space-y-1 text-blue-700">
                          <li>Vul je e-mailadres in</li>
                          <li>Ontvang een herstellink per e-mail</li>
                          <li>Klik op de link om je wachtwoord te resetten</li>
                          <li>Kies een nieuw wachtwoord</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-hysio-deep-green hover:bg-hysio-deep-green-900 text-white font-semibold h-12 text-base"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Bezig met versturen...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-5 w-5" />
                        Verstuur Herstellink
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                // Success Message
                <div className="space-y-6">
                  <div className="text-center space-y-4">
                    <div className="flex justify-center">
                      <div className="p-4 bg-hysio-emerald/10 rounded-full">
                        <CheckCircle className="h-16 w-16 text-hysio-emerald" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-hysio-deep-green">
                        E-mail verzonden!
                      </h3>
                      <p className="text-hysio-deep-green-900/80">
                        We hebben een herstellink gestuurd naar:
                      </p>
                      <p className="font-semibold text-hysio-deep-green">
                        {email}
                      </p>
                    </div>

                    <div className="bg-hysio-mint/10 border border-hysio-mint/20 rounded-lg p-4 space-y-3">
                      <p className="text-sm text-hysio-deep-green-900/80">
                        <strong>Controleer je inbox</strong> en klik op de link in de e-mail om je wachtwoord te resetten.
                      </p>
                      <p className="text-sm text-hysio-deep-green-900/70">
                        Geen e-mail ontvangen? Controleer je spam folder of probeer het opnieuw over 5 minuten.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={() => router.push('/inloggen')}
                      className="w-full bg-hysio-deep-green hover:bg-hysio-deep-green-900 text-white font-semibold h-12"
                    >
                      <ArrowLeft className="mr-2 h-5 w-5" />
                      Terug naar Inloggen
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEmailSent(false);
                        setEmail('');
                        setError('');
                      }}
                      className="w-full border-hysio-deep-green text-hysio-deep-green hover:bg-hysio-deep-green hover:text-white font-semibold h-12"
                    >
                      Stuur opnieuw
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Help */}
          <div className="mt-6 text-center">
            <p className="text-sm text-hysio-deep-green-900/70">
              Heb je hulp nodig?{' '}
              <Link
                href="/contact"
                className="font-semibold text-hysio-mint-dark hover:text-hysio-emerald underline"
              >
                Neem contact op
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/95 backdrop-blur-sm border-t border-hysio-mint/20 py-6">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-hysio-deep-green-900/60">
              © 2025 Hysio.nl - Veilig & Betrouwbaar
            </p>
            <div className="flex items-center gap-4 text-sm text-hysio-deep-green-900/60">
              <Link href="/privacybeleid" className="hover:text-hysio-mint-dark transition-colors">
                Privacy
              </Link>
              <span>•</span>
              <Link href="/algemene-voorwaarden" className="hover:text-hysio-mint-dark transition-colors">
                Voorwaarden
              </Link>
              <span>•</span>
              <span>AVG-compliant</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}