'use client';

import * as React from 'react';
import { SessionHistory } from '@/components/session/session-history';
import { useSessionState } from '@/hooks/useSessionState';
import { SessionExporter } from '@/lib/utils/session-export';
import { PrivacyManager } from '@/lib/utils/privacy-handler';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  Plus,
  Clock,
  TrendingUp,
  Users,
  FileText,
  MessageSquare,
  Mail,
  Bot,
  Brain,
  Zap,
  BarChart3,
  Calendar,
  Search,
  Filter,
  Download,
  ArrowRight,
  Sparkles,
  Target,
  ClipboardList
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const sessionState = useSessionState();

  const [sessions, setSessions] = React.useState<Array<{id: string, status: string, createdAt?: string, patientName?: string, sessionType?: string}>>([]);
  const [currentTime, setCurrentTime] = React.useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isClientMounted, setIsClientMounted] = React.useState(false);

  React.useEffect(() => {
    // Set initial time and load sessions on client mount to avoid hydration mismatch
    setCurrentTime(new Date());
    setIsClientMounted(true);
    setSessions(sessionState.getSavedSessions());

    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Remove the second useEffect as sessions are loaded in the first one

  const stats = React.useMemo(() => {
    // Only calculate stats if client is mounted to prevent hydration issues
    if (!isClientMounted) {
      return {
        totalSessions: 0,
        completedSessions: 0,
        activeSessions: 0,
        todaySessions: 0,
        avgSessionsPerDay: '0',
        completionRate: 0,
        timeSavedHours: 0
      };
    }

    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.status === 'completed').length;
    const activeSessions = sessions.filter(s => s.status === 'in-progress' || s.status === 'paused').length;

    // Only calculate today's sessions if currentTime is available (client-side)
    const todaySessions = currentTime ? sessions.filter(s => {
      const sessionDate = new Date(s.createdAt || Date.now()).toDateString();
      return sessionDate === currentTime.toDateString();
    }).length : 0;

    // Calculate efficiency metrics
    const avgSessionsPerDay = totalSessions > 0 ? (totalSessions / 7).toFixed(1) : '0';
    const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

    // Estimate time saved (assuming 15 minutes saved per session)
    const timeSavedHours = Math.round(completedSessions * 0.25);

    return {
      totalSessions,
      completedSessions,
      activeSessions,
      todaySessions,
      avgSessionsPerDay,
      completionRate,
      timeSavedHours
    };
  }, [sessions, currentTime, isClientMounted]);

  const filteredSessions = React.useMemo(() => {
    if (!searchQuery) return sessions;
    return sessions.filter(session =>
      session.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.sessionType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sessions, searchQuery]);

  const refreshSessions = React.useCallback(() => {
    const savedSessions = sessionState.getSavedSessions();
    setSessions(savedSessions);
  }, [sessionState]);

  const getGreeting = () => {
    if (!currentTime) return 'Welkom';
    const hour = currentTime.getHours();
    if (hour < 12) return 'Goedemorgen';
    if (hour < 17) return 'Goedemiddag';
    return 'Goedenavond';
  };

  const handleSessionLoad = (sessionId: string) => {
    const success = sessionState.loadSession(sessionId);
    if (success) {
      router.push('/scribe');
    } else {
      alert('Fout bij laden van sessie');
    }
  };

  const handleSessionDelete = async (sessionId: string) => {
    if (confirm('Weet u zeker dat u deze sessie wilt verwijderen?')) {
      sessionState.deleteSession(sessionId);
      PrivacyManager.logAuditEvent('delete', 'session', sessionId, 'Session deleted by user');
      refreshSessions();
      alert('Sessie succesvol verwijderd');
    }
  };

  const handleSessionExport = async (sessionId: string, format: 'pdf' | 'docx' | 'txt') => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) {
      alert('Sessie niet gevonden');
      return;
    }

    try {
      const result = await SessionExporter.exportSession(session, { format });
      if (result.success) {
        SessionExporter.downloadExportedFile(result);
        PrivacyManager.logAuditEvent('export', 'session', sessionId, `Session exported as ${format}`);
      } else {
        alert(`Export mislukt: ${result.error}`);
      }
    } catch (error) {
      alert(`Export fout: ${error instanceof Error ? error.message : 'Onbekende fout'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-hysio-mint/10 via-white to-hysio-mint/5">
      {/* Hero Header */}
      <header className="bg-gradient-to-r from-hysio-mint to-hysio-mint-dark border-b border-white/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            {/* Welcome Section */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Sparkles size={24} className="text-hysio-deep-green" />
                </div>
                <h1 className="text-3xl font-bold text-hysio-deep-green">
                  {getGreeting()}
                </h1>
              </div>
              <p className="text-hysio-deep-green-900/80 text-lg">
                Welkom in uw intelligente Hysio commandocentrum
              </p>
              <p className="text-hysio-deep-green-900/60 text-sm mt-1">
                {currentTime ? currentTime.toLocaleDateString('nl-NL', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'Loading...'}
              </p>
            </div>

            {/* Primary Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button
                onClick={() => router.push('/scribe')}
                size="lg"
                className="bg-hysio-deep-green hover:bg-hysio-deep-green-900 text-white shadow-lg"
              >
                <Plus size={20} className="mr-2" />
                Nieuwe Intake
              </Button>

              <Button
                onClick={() => router.push('/scribe')}
                size="lg"
                variant="outline"
                className="border-hysio-deep-green/20 hover:bg-hysio-deep-green/10"
              >
                <Clock size={20} className="mr-2" />
                Vervolg Consult
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Key Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-hysio-deep-green bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-hysio-deep-green-900">Vandaag</CardTitle>
              <Calendar size={16} className="text-hysio-deep-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-hysio-deep-green">{stats.todaySessions}</div>
              <p className="text-xs text-hysio-deep-green-900/60 flex items-center gap-1 mt-1">
                <TrendingUp size={12} />
                {stats.avgSessionsPerDay} gem. per dag
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-500 bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-hysio-deep-green-900">Voltooiingsgraad</CardTitle>
              <Target size={16} className="text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{stats.completionRate}%</div>
              <p className="text-xs text-hysio-deep-green-900/60">
                {stats.completedSessions} van {stats.totalSessions} sessies
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-hysio-deep-green-900">Actieve Sessies</CardTitle>
              <Activity size={16} className="text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.activeSessions}</div>
              <p className="text-xs text-hysio-deep-green-900/60">
                Wachten op voltooiing
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500 bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-hysio-deep-green-900">Tijd Bespaard</CardTitle>
              <Zap size={16} className="text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{stats.timeSavedHours}u</div>
              <p className="text-xs text-hysio-deep-green-900/60">
                ~15 min per sessie
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Hysio Toolkit Hub */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 bg-gradient-to-br from-white/90 to-hysio-mint/10 backdrop-blur-sm border-hysio-mint/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-hysio-deep-green">
                <Bot size={20} />
                Hysio Toolkit
              </CardTitle>
              <CardDescription>
                Toegang tot alle Hysio intelligente functies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <Link href="/scribe">
                  <Button variant="outline" className="w-full h-20 flex-col gap-2 hover:bg-hysio-mint/10 border-hysio-mint/30">
                    <FileText size={20} className="text-hysio-deep-green" />
                    <span className="text-sm font-medium">Medical Scribe</span>
                  </Button>
                </Link>

                <Link href="/assistant">
                  <Button variant="outline" className="w-full h-20 flex-col gap-2 hover:bg-sky-50 border-sky-200">
                    <MessageSquare size={20} className="text-sky-600" />
                    <span className="text-sm font-medium">Hysio Assistant</span>
                  </Button>
                </Link>

                <Link href="/smartmail">
                  <Button variant="outline" className="w-full h-20 flex-col gap-2 hover:bg-purple-50 border-purple-200">
                    <Mail size={20} className="text-purple-600" />
                    <span className="text-sm font-medium">SmartMail</span>
                  </Button>
                </Link>

                <Link href="/diagnosecode">
                  <Button variant="outline" className="w-full h-20 flex-col gap-2 hover:bg-emerald-50 border-emerald-200">
                    <Brain size={20} className="text-emerald-600" />
                    <span className="text-sm font-medium">Diagnose Code</span>
                  </Button>
                </Link>

                <Link href="/edupack">
                  <Button variant="outline" className="w-full h-20 flex-col gap-2 hover:bg-orange-50 border-orange-200">
                    <Target size={20} className="text-orange-600" />
                    <span className="text-sm font-medium">EduPack</span>
                  </Button>
                </Link>

                <Link href="/pre-intake">
                  <Button variant="outline" className="w-full h-20 flex-col gap-2 hover:bg-emerald-50 border-emerald-200">
                    <ClipboardList size={20} className="text-emerald-600" />
                    <span className="text-sm font-medium">Pre-intake</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-hysio-deep-green">
                <BarChart3 size={20} />
                Snelle Inzichten
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-hysio-mint/10 rounded-lg">
                <div>
                  <p className="font-medium text-sm text-hysio-deep-green">Meest actieve dag</p>
                  <p className="text-xs text-hysio-deep-green-900/60">Deze week</p>
                </div>
                <Badge variant="secondary" className="bg-hysio-mint/20 text-hysio-deep-green">
                  Vandaag
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm text-emerald-800">Gemiddelde sessietijd</p>
                  <p className="text-xs text-emerald-600">Per voltooide sessie</p>
                </div>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                  8 min
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Sessions Alert */}
        {stats.activeSessions > 0 && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-200/50 p-4 rounded-xl backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <Activity size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-blue-900">Actieve Sessies</h3>
                  <p className="text-blue-700 text-sm">
                    U heeft {stats.activeSessions} sessie(s) die voltooiing behoeven
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
                onClick={() => {
                  const activeSession = sessions.find(s => s.status === 'in-progress' || s.status === 'paused');
                  if (activeSession) handleSessionLoad(activeSession.id);
                }}
              >
                Hervatten
                <ArrowRight size={14} className="ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Interactive Session Archive */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-hysio-deep-green">
                  <Users size={20} />
                  Sessie Archief
                </CardTitle>
                <CardDescription>
                  Doorzoekbaar overzicht van alle patiëntsessies
                </CardDescription>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-hysio-deep-green-900/40" />
                  <input
                    type="text"
                    placeholder="Zoek sessies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 text-sm border border-hysio-mint/30 rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-hysio-mint/50 focus:border-hysio-mint"
                  />
                </div>

                <Button variant="outline" size="sm" className="gap-2">
                  <Filter size={14} />
                  Filter
                </Button>

                <Button variant="outline" size="sm" className="gap-2">
                  <Download size={14} />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredSessions.length === 0 ? (
              <div className="text-center py-8">
                <Users size={48} className="mx-auto text-hysio-deep-green-900/30 mb-3" />
                <p className="text-hysio-deep-green-900/60 text-sm">
                  {searchQuery ? 'Geen sessies gevonden met uw zoekcriteria' : 'Begin met uw eerste patiëntsessie'}
                </p>
                {!searchQuery && (
                  <Button
                    className="mt-4"
                    onClick={() => router.push('/scribe')}
                    variant="outline"
                  >
                    <Plus size={16} className="mr-2" />
                    Eerste Sessie Starten
                  </Button>
                )}
              </div>
            ) : (
              <SessionHistory
                sessions={filteredSessions as any}
                onSessionLoad={handleSessionLoad}
                onSessionDelete={handleSessionDelete}
                onSessionExport={handleSessionExport}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-r from-hysio-deep-green to-hysio-deep-green-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-hysio-mint rounded-lg flex items-center justify-center">
                <span className="text-hysio-deep-green font-bold text-sm">H</span>
              </div>
              <div>
                <p className="font-medium">Hysio Intelligent Command Center</p>
                <p className="text-sm text-white/70">
                  Verhoog uw productiviteit met Hysio intelligente fysiotherapie tools
                </p>
              </div>
            </div>

            <div className="text-sm text-white/60 text-center md:text-right">
              <p>Veilig • Compliant • Intelligent</p>
              <p className="text-xs mt-1">
                Voldoet aan AVG/GDPR en Nederlandse zorgstandaarden
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}