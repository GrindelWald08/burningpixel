import { Check, Star, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ScrollReveal from './ScrollReveal';
import { getWhatsAppUrl } from '@/lib/whatsapp';
import { usePricingPackages } from '@/hooks/usePricingPackages';

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID').format(price);
};

const PricingSection = () => {
  const { data: packages, isLoading } = usePricingPackages();

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

        {/* Pricing Cards */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
          </div>
        ) : packages && packages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {packages.map((plan, index) => {
              const discountedPrice = plan.discount_percentage > 0
                ? plan.price * (1 - plan.discount_percentage / 100)
                : plan.price;

              return (
                <ScrollReveal key={plan.id} delay={0.15 + index * 0.1}>
                  <div
                    className={`relative p-8 rounded-2xl transition-all duration-500 h-full ${
                      plan.is_popular
                        ? 'bg-card border-2 border-primary shadow-[0_0_40px_hsl(166_85%_63%/0.2)] scale-105 z-10'
                        : 'bg-card border border-border hover:border-primary/30'
                    }`}
                  >
                    {/* Popular Badge */}
                    {plan.is_popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <div className="flex items-center gap-1 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                          <Star className="w-3 h-3 fill-current" />
                          BEST SELLER
                        </div>
                      </div>
                    )}

                    {/* Discount Badge */}
                    {plan.discount_percentage > 0 && (
                      <div className="absolute -top-4 right-4">
                        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-destructive text-destructive-foreground text-xs font-bold">
                          <Percent className="w-3 h-3" />
                          {plan.discount_percentage}% OFF
                        </div>
                      </div>
                    )}

                    {/* Plan Name */}
                    <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
                    
                    {/* Description */}
                    {plan.description && (
                      <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                    )}

                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-2">
                        <span className={`text-3xl font-bold ${plan.is_popular ? 'text-primary' : 'text-foreground'}`}>
                          Rp {formatPrice(discountedPrice)}
                        </span>
                        <span className="text-muted-foreground text-sm">{plan.period}</span>
                      </div>
                      {plan.discount_percentage > 0 && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-muted-foreground line-through text-sm">
                            Rp {formatPrice(plan.price)}
                          </span>
                          {plan.discount_label && (
                            <span className="text-xs text-destructive font-medium">{plan.discount_label}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            plan.is_popular ? 'bg-primary/20' : 'bg-muted'
                          }`}>
                            <Check className={`w-3 h-3 ${plan.is_popular ? 'text-primary' : 'text-muted-foreground'}`} />
                          </div>
                          <span className="text-muted-foreground text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <a href={getWhatsAppUrl(`Halo, saya tertarik dengan paket ${plan.name}. Bisa dibantu?`)} target="_blank" rel="noopener noreferrer">
                      <Button
                        variant={plan.is_popular ? 'hero' : 'outline'}
                        className="w-full"
                      >
                        Pilih Paket
                      </Button>
                    </a>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No pricing packages available
          </div>
        )}
      </div>
    </section>
  );
};

export default PricingSection;