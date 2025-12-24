import { Layout, Building2, ShoppingCart, Search, Share2 } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const services = [
  {
    icon: Layout,
    title: 'Landing Page',
    description: 'Halaman penjualan yang didesain untuk mengkonversi pengunjung menjadi pembeli.',
  },
  {
    icon: Building2,
    title: 'Website Company Profile',
    description: 'Tampilkan kredibilitas bisnis Anda dengan website profesional.',
  },
  {
    icon: ShoppingCart,
    title: 'Website Toko Online',
    description: 'Jualan online 24/7 dengan toko online yang mudah dikelola.',
  },
  {
    icon: Search,
    title: 'Optimasi SEO',
    description: 'Tingkatkan peringkat website Anda di Google dan dapatkan lebih banyak traffic.',
  },
  {
    icon: Share2,
    title: 'Social Media Management',
    description: 'Kelola dan tingkatkan kehadiran brand Anda di media sosial.',
  },
];

const ServicesSection = () => {
  return (
    <section id="layanan" className="py-24 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="container relative z-10">
        {/* Section Header */}
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-primary text-sm font-semibold tracking-wider uppercase mb-4 block">
              Layanan
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Layanan <span className="text-gradient">Kami</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Solusi digital lengkap untuk kebutuhan bisnis Anda.
            </p>
          </div>
        </ScrollReveal>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <ScrollReveal key={index} delay={index * 0.08}>
              <div className="group relative p-6 rounded-2xl glass hover:border-primary/40 transition-all duration-300 hover:shadow-[0_0_30px_hsl(166_85%_63%/0.1)] h-full">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                    <service.icon className="w-6 h-6 text-primary" />
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                      {service.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>

                {/* Hover Border Effect */}
                <div className="absolute inset-0 rounded-2xl border border-primary/0 group-hover:border-primary/30 transition-all duration-300" />
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
