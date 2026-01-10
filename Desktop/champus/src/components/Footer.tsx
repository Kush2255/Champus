import { Link } from 'react-router-dom';
import { Plane } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-card py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
              <Plane className="h-6 w-6" />
              IARE Assistant
            </Link>
            <p className="text-sm text-muted-foreground">
              AI-powered campus enquiry system for Institute of Aeronautical Engineering, Dundigal, Hyderabad.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold">Quick Links</h3>
            <div className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                About
              </Link>
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Contact
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold">Contact IARE</h3>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <p>Institute of Aeronautical Engineering</p>
              <p>Dundigal, Hyderabad - 500043</p>
              <p>Phone: +91-40-24193276</p>
              <p>Email: info@iare.ac.in</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} IARE Campus AI Assistant. Powered by Grok (xAI).</p>
        </div>
      </div>
    </footer>
  );
};
