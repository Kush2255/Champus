import { Link } from 'react-router-dom';
import { Plane, Heart } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border/50 bg-card/50 backdrop-blur-sm py-10">
      {/* Subtle gradient top edge */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md shadow-primary/20 group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300 group-hover:scale-105">
                <Plane className="h-4 w-4 text-primary-foreground" />
              </div>
              IARE Assistant
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI-powered campus enquiry system for Institute of Aeronautical Engineering (NAAC A++ Accredited), Dundigal, Hyderabad.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold">Quick Links</h3>
            <div className="flex flex-col gap-2.5">
              {[
                { name: 'Home', path: '/' },
                { name: 'Dashboard', path: '/dashboard' },
                { name: 'About', path: '/about' },
                { name: 'Contact', path: '/contact' },
                { name: 'Analysis', path: '/analysis' },
              ].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 hover:translate-x-1 inline-flex w-fit"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold">Contact IARE</h3>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <p>Institute of Aeronautical Engineering</p>
              <p>Dundigal, Hyderabad - 500043</p>
              <p className="hover:text-primary transition-colors cursor-pointer">Phone: +91-40-24193276</p>
              <p className="hover:text-primary transition-colors cursor-pointer">Email: info@iare.ac.in</p>
              <a
                href="https://www.iare.ac.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline mt-1 inline-flex w-fit"
              >
                www.iare.ac.in →
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border/50 text-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} IARE Campus AI Assistant.
          </p>
        </div>
      </div>
    </footer>
  );
};
