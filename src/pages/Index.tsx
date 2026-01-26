import { Navigate, Link } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Shield, ClipboardCheck, Thermometer, AlertTriangle, FileText, ArrowRight, CheckCircle2 } from 'lucide-react';

const Index = () => {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isAuthenticated && !isLoading) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="bg-primary text-primary-foreground">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8" />
            <span className="text-xl font-bold">QA SafeTrack</span>
          </div>
          <Button variant="secondary" asChild>
            <Link to="/login">Sign In</Link>
          </Button>
        </nav>

        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Food Safety Tracking<br />
            <span className="text-sidebar-primary">Made Simple</span>
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Comprehensive quality assurance system for Canadian meat processing facilities. 
            CFIA compliant. HACCP certified. Production ready.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/login">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            Complete QA Management
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            Everything you need to maintain food safety compliance and track quality control
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card-metric">
              <div className="p-3 rounded-lg bg-success/10 w-fit mb-4">
                <ClipboardCheck className="h-6 w-6 text-success" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Daily Checks</h3>
              <p className="text-sm text-muted-foreground">
                Record temperature, weight, and hygiene scores with automatic compliance evaluation
              </p>
            </div>

            <div className="card-metric">
              <div className="p-3 rounded-lg bg-chart-4/10 w-fit mb-4">
                <Thermometer className="h-6 w-6 text-chart-4" />
              </div>
              <h3 className="font-semibold text-lg mb-2">HACCP Monitoring</h3>
              <p className="text-sm text-muted-foreground">
                Track Critical Control Points with configurable limits and instant deviation alerts
              </p>
            </div>

            <div className="card-metric">
              <div className="p-3 rounded-lg bg-warning/10 w-fit mb-4">
                <AlertTriangle className="h-6 w-6 text-warning" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Violation Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Report and manage safety violations with severity levels and corrective actions
              </p>
            </div>

            <div className="card-metric">
              <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Audit Records</h3>
              <p className="text-sm text-muted-foreground">
                Document internal and external audits with follow-up tracking and reporting
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Built for Canadian Food Safety Standards
              </h2>
              <p className="text-muted-foreground mb-8">
                QA SafeTrack is designed specifically for meat processing facilities 
                operating under CFIA regulations and HACCP principles.
              </p>

              <ul className="space-y-4">
                {[
                  'CFIA compliant documentation',
                  'HACCP Critical Control Points monitoring',
                  'Immutable audit trail',
                  'Role-based access control',
                  'Real-time compliance dashboards',
                  'PDF report generation',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-card border border-border rounded-xl p-8 shadow-lg">
              <div className="text-center">
                <div className="text-6xl font-bold text-primary mb-2">97.5%</div>
                <p className="text-muted-foreground mb-6">Average Compliance Rate</p>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-foreground">500+</div>
                    <p className="text-xs text-muted-foreground">Daily Checks</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">15</div>
                    <p className="text-xs text-muted-foreground">CCPs Monitored</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">0</div>
                    <p className="text-xs text-muted-foreground">Critical Violations</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Streamline Your QA Process?
          </h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
            Join food processing facilities across Canada in maintaining the highest 
            standards of food safety compliance.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/login">
              Start Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6" />
              <span className="font-semibold">QA SafeTrack</span>
            </div>
            <p className="text-sm text-background/60">
              © 2024 QA SafeTrack. Designed for Western Fine Meats and food processing facilities.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
