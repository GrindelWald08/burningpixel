import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, LogIn, User, Settings, LogOut, Shield } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { getWhatsAppUrl } from '@/lib/whatsapp';
import { useAuth } from '@/hooks/useAuth';
import { useAdminRole } from '@/hooks/useAdminRole';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navLinks = [
  { href: '#home', label: 'Home' },
  { href: '#tentang', label: 'Tentang' },
  { href: '#layanan', label: 'Layanan' },
  { href: '#harga', label: 'Harga' },
  { href: '#portofolio', label: 'Portofolio' },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isLoading: authLoading, signOut } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useAdminRole();

  const isLoading = authLoading || adminLoading;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="container flex items-center justify-between">
        {/* Logo */}
        <a href="#home" className="text-2xl font-bold text-primary">
          Burning Pixel
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-foreground/80 hover:text-primary transition-colors duration-300 text-sm font-medium"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {isLoading ? (
            <div className="w-24 h-9 rounded-md bg-muted/50 animate-pulse" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Account
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium truncate">{user.email}</p>
                  {isAdmin && (
                    <p className="text-xs text-primary flex items-center gap-1 mt-0.5">
                      <Shield className="w-3 h-3" /> Admin
                    </p>
                  )}
                </div>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="cursor-pointer">
                      <Settings className="w-4 h-4 mr-2" />
                      Admin Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/account" className="cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    Account Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              to="/auth"
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              <LogIn className="w-4 h-4 mr-2" />
              Login
            </Link>
          )}
          <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer">
            <Button variant="hero" size="default">
              Konsultasi WA
            </Button>
          </a>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-foreground p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass mt-2 mx-4 rounded-lg p-4 animate-fade-up">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-foreground/80 hover:text-primary transition-colors py-2 text-sm font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}

            {isLoading ? (
              <div className="w-full h-10 rounded-md bg-muted/50 animate-pulse" />
            ) : user ? (
              <>
                <div className="py-2 px-1 border-t border-border">
                  <p className="text-sm font-medium truncate">{user.email}</p>
                  {isAdmin && (
                    <p className="text-xs text-primary flex items-center gap-1 mt-0.5">
                      <Shield className="w-3 h-3" /> Admin
                    </p>
                  )}
                </div>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={buttonVariants({
                      variant: 'outline',
                      size: 'default',
                      className: 'w-full',
                    })}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Admin Dashboard
                  </Link>
                )}
                <Link
                  to="/account"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={buttonVariants({
                    variant: 'outline',
                    size: 'default',
                    className: 'w-full',
                  })}
                >
                  <User className="w-4 h-4 mr-2" />
                  Account Settings
                </Link>
                <Button
                  variant="destructive"
                  size="default"
                  className="w-full"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Link
                to="/auth"
                onClick={() => setIsMobileMenuOpen(false)}
                className={buttonVariants({
                  variant: 'outline',
                  size: 'default',
                  className: 'w-full',
                })}
              >
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </Link>
            )}

            <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer">
              <Button variant="hero" size="default" className="w-full">
                Konsultasi WA
              </Button>
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
