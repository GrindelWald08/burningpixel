import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getWhatsAppUrl } from '@/lib/whatsapp';

const CTASection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(166_85%_63%/0.1)_0%,_transparent_50%)]" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />

      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
            <MessageCircle className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground/80">Konsultasi Gratis</span>
          </div>

          {/* Headline */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Siap Bikin Website{' '}
            <span className="text-gradient">Profesional</span>?
          </h2>

          {/* Description */}
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Konsultasikan kebutuhan website bisnis Anda dengan tim kami. Gratis, tanpa komitmen.
          </p>

          {/* CTA Button */}
          <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer">
            <Button variant="cta" size="xl" className="animate-pulse-glow">
              <MessageCircle className="w-5 h-5" />
              Hubungi Kami Sekarang
            </Button>
          </a>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-muted-foreground text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span>Respon Cepat</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span>Konsultasi Gratis</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span>Tanpa Komitmen</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
