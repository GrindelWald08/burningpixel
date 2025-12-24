import { useEffect, useState } from 'react';
import { Rocket, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const stats = [
  { icon: Rocket, value: 150, suffix: '+', label: 'Project Selesai' },
  { icon: Users, value: 120, suffix: '+', label: 'Client Puas' },
  { icon: Clock, value: 99, suffix: '%', label: 'Tepat Waktu' },
];

const CounterAnimation = ({ target, suffix }: { target: number; suffix: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [target]);

  return (
    <span className="text-4xl md:text-5xl font-bold text-primary">
      {count}{suffix}
    </span>
  );
};

const HeroSection = () => {
  return (
    <section id="home" className="min-h-screen flex flex-col justify-center pt-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(166_85%_63%/0.08)_0%,_transparent_50%)]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />

      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-fade-up">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm text-foreground/80">Jasa Pembuatan Website Profesional</span>
          </div>

          {/* Headline */}
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-tight mb-6 animate-fade-up"
            style={{ animationDelay: '0.1s' }}
          >
            Bantu Bisnis Kamu{' '}
            <span className="text-gradient">Jualan Online</span>{' '}
            Lewat Website.
          </h1>

          {/* Sub-headline */}
          <p 
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up"
            style={{ animationDelay: '0.2s' }}
          >
            Jasa Pembuatan Website Profesional & Mobile-Friendly. Mulai dari company profile, landing page, hingga toko online.
          </p>

          {/* Buttons */}
          <div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-up"
            style={{ animationDelay: '0.3s' }}
          >
            <Button variant="hero" size="lg">
              Konsultasi via WhatsApp
            </Button>
            <Button variant="heroOutline" size="lg">
              Lihat Portofolio
            </Button>
          </div>

          {/* Stats */}
          <div 
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto animate-fade-up"
            style={{ animationDelay: '0.4s' }}
          >
            {stats.map((stat, index) => (
              <div
                key={index}
                className="flex flex-col items-center p-6 rounded-2xl glass hover:border-primary/30 transition-all duration-300"
              >
                <stat.icon className="w-8 h-8 text-primary mb-3" />
                <CounterAnimation target={stat.value} suffix={stat.suffix} />
                <span className="text-muted-foreground mt-2">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-primary/50 flex justify-center pt-2">
          <div className="w-1 h-3 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
