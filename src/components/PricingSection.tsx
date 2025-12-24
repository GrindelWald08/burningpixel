import { useState } from 'react';
import { Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ScrollReveal from './ScrollReveal';
import { getWhatsAppUrl } from '@/lib/whatsapp';

const categories = [
  { id: 'landing', label: 'Landing Page' },
  { id: 'company', label: 'Company Profile' },
  { id: 'toko', label: 'Toko Online' },
  { id: 'seo', label: 'SEO' },
];

const pricingData: Record<string, Array<{
  name: string;
  price: string;
  popular?: boolean;
  features: string[];
}>> = {
  landing: [
    {
      name: 'Basic',
      price: 'Rp 1.500.000',
      features: ['Free Domain .com', 'Hosting 3 Bulan', '1 Halaman', '1x Revisi', 'Mobile Responsive'],
    },
    {
      name: 'Professional',
      price: 'Rp 2.500.000',
      popular: true,
      features: ['Free Domain .com', 'Hosting 6 Bulan', '1 Halaman Extended', '3x Revisi', 'Mobile Responsive', 'SEO Basic', 'Copywriting'],
    },
    {
      name: 'Premium',
      price: 'Rp 4.000.000',
      features: ['Free Domain .com', 'Hosting 1 Tahun', 'Multi Section', 'Unlimited Revisi', 'Mobile Responsive', 'SEO Advanced', 'Copywriting', 'Speed Optimization'],
    },
  ],
  company: [
    {
      name: 'Starter',
      price: 'Rp 2.500.000',
      features: ['Free Domain .com', 'Hosting 6 Bulan', '3 Halaman', '2x Revisi', 'Mobile Responsive'],
    },
    {
      name: 'Growth',
      price: 'Rp 4.000.000',
      popular: true,
      features: ['Free Domain .com', 'Hosting 1 Tahun', '5-6 Halaman', '5x Revisi', 'Desain Premium', 'SEO Basic', 'Copywriting'],
    },
    {
      name: 'Executive',
      price: 'Rp 6.500.000',
      features: ['Free Domain .com', 'Hosting 1 Tahun', '8-10 Halaman', 'Unlimited Revisi', 'Fitur Khusus', 'Speed Optimization', 'SEO Advanced', 'Priority Support'],
    },
  ],
  toko: [
    {
      name: 'Starter',
      price: 'Rp 3.500.000',
      features: ['Free Domain .com', 'Hosting 6 Bulan', '50 Produk', 'Payment Gateway', 'Mobile Responsive'],
    },
    {
      name: 'Business',
      price: 'Rp 5.500.000',
      popular: true,
      features: ['Free Domain .com', 'Hosting 1 Tahun', '200 Produk', 'Multi Payment', 'Mobile Responsive', 'SEO Basic', 'Inventory System'],
    },
    {
      name: 'Enterprise',
      price: 'Rp 8.500.000',
      features: ['Free Domain .com', 'Hosting 1 Tahun', 'Unlimited Produk', 'Multi Payment', 'Advanced Features', 'SEO Advanced', 'Priority Support', 'Custom Integration'],
    },
  ],
  seo: [
    {
      name: 'Basic',
      price: 'Rp 1.000.000/bln',
      features: ['5 Keywords', 'On-Page SEO', 'Monthly Report', '1 Blog Post'],
    },
    {
      name: 'Professional',
      price: 'Rp 2.500.000/bln',
      popular: true,
      features: ['15 Keywords', 'On-Page SEO', 'Off-Page SEO', 'Weekly Report', '4 Blog Posts', 'Backlink Building'],
    },
    {
      name: 'Agency',
      price: 'Rp 5.000.000/bln',
      features: ['30+ Keywords', 'Full SEO Package', 'Daily Monitoring', '8 Blog Posts', 'Premium Backlinks', 'Competitor Analysis', 'Dedicated Manager'],
    },
  ],
};

const PricingSection = () => {
  const [activeCategory, setActiveCategory] = useState('company');

  return (
    <section id="harga" className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_hsl(166_85%_63%/0.05)_0%,_transparent_60%)]" />

      <div className="container relative z-10">
        {/* Section Header */}
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="text-primary text-sm font-semibold tracking-wider uppercase mb-4 block">
              Investasi
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Pricelist <span className="text-gradient">Layanan</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Pilih paket yang sesuai dengan kebutuhan dan budget bisnis Anda.
            </p>
          </div>
        </ScrollReveal>

        {/* Category Tabs */}
        <ScrollReveal delay={0.1}>
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeCategory === category.id
                    ? 'bg-primary text-primary-foreground shadow-[0_0_20px_hsl(166_85%_63%/0.4)]'
                    : 'glass text-foreground hover:bg-primary/10'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {pricingData[activeCategory].map((plan, index) => (
            <ScrollReveal key={index} delay={0.15 + index * 0.1}>
              <div
                className={`relative p-8 rounded-2xl transition-all duration-500 h-full ${
                  plan.popular
                    ? 'bg-card border-2 border-primary shadow-[0_0_40px_hsl(166_85%_63%/0.2)] scale-105 z-10'
                    : 'bg-card border border-border hover:border-primary/30'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-1 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      <Star className="w-3 h-3 fill-current" />
                      BEST SELLER
                    </div>
                  </div>
                )}

                {/* Plan Name */}
                <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>

                {/* Price */}
                <div className="mb-6">
                  <span className={`text-3xl font-bold ${plan.popular ? 'text-primary' : 'text-foreground'}`}>
                    {plan.price}
                  </span>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        plan.popular ? 'bg-primary/20' : 'bg-muted'
                      }`}>
                        <Check className={`w-3 h-3 ${plan.popular ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <span className="text-muted-foreground text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <a href={getWhatsAppUrl(`Halo, saya tertarik dengan paket ${plan.name} untuk ${activeCategory}. Bisa dibantu?`)} target="_blank" rel="noopener noreferrer">
                  <Button
                    variant={plan.popular ? 'hero' : 'outline'}
                    className="w-full"
                  >
                    Pilih Paket
                  </Button>
                </a>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
