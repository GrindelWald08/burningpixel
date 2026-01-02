import { ExternalLink } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import { usePortfolioItems } from '@/hooks/usePortfolioItems';
import { BlurImage } from './ui/blur-image';

const PortfolioSection = () => {
  const { data: projects, isLoading } = usePortfolioItems();

  return (
    <section id="portofolio" className="py-24 relative">
      <div className="container">
        {/* Section Header */}
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-primary text-sm font-semibold tracking-wider uppercase mb-4 block">
              Karya Kami
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Portofolio <span className="text-gradient">Terbaru</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Lihat hasil karya kami yang telah membantu berbagai bisnis sukses online.
            </p>
          </div>
        </ScrollReveal>

        {/* Portfolio Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <ScrollReveal key={project.id} delay={index * 0.08}>
                <a 
                  href={project.link_url || '#'} 
                  target={project.link_url ? '_blank' : undefined}
                  rel={project.link_url ? 'noopener noreferrer' : undefined}
                  className={`group relative rounded-2xl overflow-hidden block ${project.link_url ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  {/* Image */}
                  <div className="aspect-[4/3] overflow-hidden bg-muted">
                    {project.image_url ? (
                      <BlurImage
                        src={project.image_url}
                        alt={project.title}
                        className="transition-transform duration-500 group-hover:scale-110"
                        containerClassName="w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <span className="text-muted-foreground">No image</span>
                      </div>
                    )}
                  </div>

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <span className="text-primary text-sm font-medium mb-2 block">
                        {project.category}
                      </span>
                      <h3 className="text-xl font-bold text-foreground mb-2">
                        {project.title}
                      </h3>
                      {project.description && (
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                          {project.description}
                        </p>
                      )}
                      {project.link_url && (
                        <div className="flex items-center gap-2 text-primary text-sm font-medium">
                          <span>Lihat Detail</span>
                          <ExternalLink className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Border Effect */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/50 rounded-2xl transition-all duration-300" />
                </a>
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No portfolio items available
          </div>
        )}
      </div>
    </section>
  );
};

export default PortfolioSection;