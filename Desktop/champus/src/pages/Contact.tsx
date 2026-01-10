import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Building, 
  Globe,
  Plane
} from 'lucide-react';

const Contact = () => {
  const contactInfo = [
    {
      icon: Building,
      title: 'Campus Address',
      details: ['Institute of Aeronautical Engineering', 'Dundigal, Hyderabad - 500043', 'Telangana, India']
    },
    {
      icon: Phone,
      title: 'Phone',
      details: ['Main: +91-40-24193276', 'Admissions: +91-40-24193277', 'Placements: +91-40-24193278']
    },
    {
      icon: Mail,
      title: 'Email',
      details: ['info@iare.ac.in', 'admissions@iare.ac.in', 'placements@iare.ac.in']
    },
    {
      icon: Clock,
      title: 'Office Hours',
      details: ['Monday - Friday: 9:00 AM - 5:00 PM', 'Saturday: 9:00 AM - 1:00 PM', 'Sunday: Closed']
    }
  ];

  const departments = [
    { name: 'Admissions Office', phone: '+91-40-24193277', email: 'admissions@iare.ac.in' },
    { name: 'Examination Cell', phone: '+91-40-24193280', email: 'exams@iare.ac.in' },
    { name: 'Training & Placements', phone: '+91-40-24193278', email: 'placements@iare.ac.in' },
    { name: 'Student Affairs', phone: '+91-40-24193279', email: 'studentaffairs@iare.ac.in' },
    { name: 'Library', phone: '+91-40-24193281', email: 'library@iare.ac.in' },
    { name: 'Hostel Office', phone: '+91-40-24193282', email: 'hostel@iare.ac.in' }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-primary/5 via-accent to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Contact IARE
            </h1>
            <p className="text-lg text-muted-foreground">
              Get in touch with Institute of Aeronautical Engineering. We're here to help!
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <info.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{info.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {info.details.map((detail, i) => (
                      <p key={i} className="text-sm text-muted-foreground">{detail}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Departments Directory */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Department Directory</h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {departments.map((dept, index) => (
                <div 
                  key={index}
                  className="p-4 rounded-lg bg-background border border-border"
                >
                  <h3 className="font-semibold mb-2">{dept.name}</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <Phone className="h-3 w-3" /> {dept.phone}
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="h-3 w-3" /> {dept.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Campus Location</h2>
            <div className="rounded-xl overflow-hidden border border-border bg-card p-8 text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Plane className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Institute of Aeronautical Engineering</h3>
              <p className="text-muted-foreground mb-4">
                Dundigal, Hyderabad - 500043, Telangana, India
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-primary mb-4">
                <MapPin className="h-4 w-4" />
                <span>Located near Rajiv Gandhi International Airport</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Globe className="h-4 w-4" />
                <a href="https://www.iare.ac.in" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                  www.iare.ac.in
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
