import { Pencil, Shield, Headphones } from 'lucide-react';

const features = [
  {
    icon: Pencil,
    title: 'Free Copywriting',
    description: 'Kami bantu siapkan kata-kata yang menjual untuk website Anda. Tidak perlu pusing mikirin konten.',
  },
  {
    icon: Shield,
    title: 'Kualitas Terjamin',
    description: 'Website cepat, mobile-friendly, dan SEO-ready. Dibangun dengan teknologi terbaru.',
  },
  {
    icon: Headphones,
    title: 'Full Support',
    description: 'Siap bantu maintenance dan support setelah website jadi. Tim kami selalu siap membantu.',
  },
];

const AboutSection = () => {
  return (
    <section id="tentang" className="py-24 relative">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(207_19%_46%/0.05)_0%,_transparent_70%)]" />

      <div className="container relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-primary text-sm font-semibold tracking-wider uppercase mb-4 block">
            Mengapa Kami?
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Kenapa Harus <span className="text-gradient">Burning Pixel</span>?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Kami tidak hanya membuat website, tapi membantu bisnis Anda berkembang di dunia digital.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-500 hover:-translate-y-2"
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Corner Accent */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/10 to-transparent rounded-tr-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
