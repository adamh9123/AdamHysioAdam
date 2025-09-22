import { MarketingNavigation } from '@/components/ui/marketing-navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, ArrowRight, Tag } from 'lucide-react';
import Link from 'next/link';

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  publishDate: string;
  readTime: string;
  category: string;
  featured: boolean;
}

const blogPosts: BlogPost[] = [
  {
    slug: 'ai-revolutie-fysiotherapie-2024',
    title: 'De AI-Revolutie in Fysiotherapie: Wat 2024 Brengt voor Uw Praktijk',
    excerpt: 'Ontdek hoe kunstmatige intelligentie de fysiotherapie transformeert en welke concrete voordelen AI-tools zoals Hysio bieden voor moderne praktijken.',
    author: 'Dr. Sarah van Bergen',
    publishDate: '2024-01-15',
    readTime: '5 min',
    category: 'Technologie',
    featured: true
  },
  {
    slug: 'optimaliseren-documentatie-workflow',
    title: 'Documentatie-Workflow Optimaliseren: Van 30 naar 5 Minuten per Patiënt',
    excerpt: 'Praktische tips en strategieën om uw documentatieproces drastisch te verkorten zonder kwaliteitsverlies, met real-world voorbeelden uit Nederlandse praktijken.',
    author: 'Mark Jansen, Fysiotherapeut',
    publishDate: '2024-01-08',
    readTime: '7 min',
    category: 'Praktijkmanagement',
    featured: true
  },
  {
    slug: 'avg-compliance-fysiotherapie-ai-tools',
    title: 'AVG-Compliance bij AI-Tools in de Fysiotherapie: Complete Gids',
    excerpt: 'Alles wat u moet weten over privacy, gegevensbescherming en AVG-compliance wanneer u AI-tools implementeert in uw fysiotherapiepraktijk.',
    author: 'Laura Koster, Privacy Expert',
    publishDate: '2024-01-02',
    readTime: '8 min',
    category: 'Compliance',
    featured: true
  }
];

export default function Blog() {
  const featuredPosts = blogPosts.filter(post => post.featured);
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-hysio-mint">
      <MarketingNavigation />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-hysio-mint to-hysio-mint/80">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-hysio-deep-green mb-6">
              Fysiotherapie Blog
            </h1>
            <p className="text-xl text-hysio-deep-green/80 mb-8 leading-relaxed">
              Evidence-based inzichten, praktische tips en cutting-edge ontwikkelingen
              voor de moderne fysiotherapeut. Ontdek hoe AI uw praktijk transformeert
              en uw patiëntenzorg naar een hoger niveau tilt.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="px-4 py-2 bg-hysio-mint/20 rounded-full text-hysio-deep-green text-sm font-medium">
                AI & Technologie
              </span>
              <span className="px-4 py-2 bg-hysio-mint/20 rounded-full text-hysio-deep-green text-sm font-medium">
                Praktijkmanagement
              </span>
              <span className="px-4 py-2 bg-hysio-mint/20 rounded-full text-hysio-deep-green text-sm font-medium">
                Compliance
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-16 bg-hysio-off-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-hysio-deep-green mb-12 text-center">
              Uitgelichte Artikelen
            </h2>
            <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
              {featuredPosts.map((post) => (
                <Card
                  key={post.slug}
                  className="border-hysio-mint/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <CardHeader>
                    <div className="flex items-center gap-2 text-sm text-hysio-deep-green/60 mb-2">
                      <Tag className="h-4 w-4" />
                      <span>{post.category}</span>
                    </div>
                    <CardTitle className="text-xl leading-tight text-hysio-deep-green hover:text-hysio-mint-dark transition-colors">
                      <Link href={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-hysio-deep-green/70 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-hysio-deep-green/60 mb-4">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(post.publishDate)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>

                    <Link href={`/blog/${post.slug}`}>
                      <Button
                        variant="ghost"
                        className="w-full justify-between text-hysio-deep-green hover:text-hysio-mint-dark hover:bg-hysio-mint/10 group"
                      >
                        <span>Lees verder</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-hysio-deep-green text-center mb-12">
              Blog Categorieën
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-hysio-mint/20 shadow-lg hover:shadow-xl transition-all duration-300 text-center">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-hysio-mint/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Tag className="h-8 w-8 text-hysio-deep-green" />
                  </div>
                  <h3 className="text-xl font-semibold text-hysio-deep-green mb-3">AI & Technologie</h3>
                  <p className="text-hysio-deep-green/70 mb-4">
                    Praktische implementatie van AI-tools, evidence-based onderzoek en
                    ROI-metingen voor uw fysiotherapiepraktijk.
                  </p>
                  <Button
                    variant="outline"
                    className="border-hysio-mint text-hysio-deep-green hover:bg-hysio-mint hover:text-hysio-deep-green"
                  >
                    Bekijk Artikelen
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-hysio-mint/20 shadow-lg hover:shadow-xl transition-all duration-300 text-center">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-hysio-mint/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-8 w-8 text-hysio-deep-green" />
                  </div>
                  <h3 className="text-xl font-semibold text-hysio-deep-green mb-3">Praktijkmanagement</h3>
                  <p className="text-hysio-deep-green/70 mb-4">
                    Workflow-optimalisatie, patiëntbetrokkenheid en praktijkgroei strategieën
                    voor de moderne fysiotherapeut.
                  </p>
                  <Button
                    variant="outline"
                    className="border-hysio-mint text-hysio-deep-green hover:bg-hysio-mint hover:text-hysio-deep-green"
                  >
                    Bekijk Artikelen
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-hysio-mint/20 shadow-lg hover:shadow-xl transition-all duration-300 text-center">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-hysio-mint/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-hysio-deep-green" />
                  </div>
                  <h3 className="text-xl font-semibold text-hysio-deep-green mb-3">Compliance & Privacy</h3>
                  <p className="text-hysio-deep-green/70 mb-4">
                    AVG-compliance, cybersecurity en risicomanagementin de digitale
                    fysiotherapie-omgeving.
                  </p>
                  <Button
                    variant="outline"
                    className="border-hysio-mint text-hysio-deep-green hover:bg-hysio-mint hover:text-hysio-deep-green"
                  >
                    Bekijk Artikelen
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-hysio-off-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-hysio-deep-green mb-6">
              Blijf Voorop in de Fysiotherapie
            </h2>
            <p className="text-xl text-hysio-deep-green/80 mb-8">
              Ontvang wekelijks evidence-based inzichten, praktijktips en
              AI-innovaties die uw behandelresultaten verbeteren.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="uw.email@praktijk.nl"
                className="flex-1 px-4 py-3 border border-hysio-mint/30 rounded-md focus:border-hysio-mint focus:outline-none"
              />
              <Button className="bg-hysio-mint hover:bg-hysio-mint-dark text-hysio-deep-green font-semibold px-6">
                Abonneren
              </Button>
            </div>
            <p className="text-hysio-deep-green/60 text-sm mt-4">
              Geen spam, alleen waardevolle inzichten. Afmelden kan altijd.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-hysio-deep-green text-white py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-8 h-8 bg-hysio-mint rounded-lg flex items-center justify-center">
                <span className="text-hysio-deep-green font-bold">H</span>
              </div>
              <span className="text-2xl font-bold">Hysio</span>
            </div>
            <p className="text-white/80 mb-6">
              Intelligente fysiotherapie-oplossingen voor de moderne praktijk.
            </p>
            <div className="text-white/60 text-sm">
              © 2024 Hysio. Alle rechten voorbehouden.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}