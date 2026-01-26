import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, ClipboardCheck, Thermometer } from 'lucide-react';

const Login = () => {
  const { isAuthenticated, isLoading } = useAuthContext();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  if (isAuthenticated && !isLoading) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary text-primary-foreground p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-10 w-10" />
            <h1 className="text-2xl font-bold">QA SafeTrack</h1>
          </div>
          <p className="text-primary-foreground/80 text-lg">
            Quality Assurance & Food Safety System
          </p>
        </div>

        <div className="space-y-8">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-sidebar-accent">
                <ClipboardCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">CFIA Compliant</h3>
                <p className="text-primary-foreground/70">
                  Meets Canadian Food Inspection Agency requirements
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-sidebar-accent">
                <Thermometer className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">HACCP Standards</h3>
                <p className="text-primary-foreground/70">
                  Critical Control Point monitoring and tracking
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-sidebar-accent">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Secure & Auditable</h3>
                <p className="text-primary-foreground/70">
                  Immutable audit logs and role-based access control
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-sm text-primary-foreground/60">
          <p>Designed for food processing facilities</p>
          <p>© 2024 QA SafeTrack. All rights reserved.</p>
        </div>
      </div>

      {/* Right side - Auth forms */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold text-primary">QA SafeTrack</h1>
            </div>
            <p className="text-muted-foreground text-sm">
              Quality Assurance & Food Safety System
            </p>
          </div>

          <Card className="border-border/50 shadow-lg">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">Welcome</CardTitle>
              <CardDescription>
                {activeTab === 'login' 
                  ? 'Sign in to access the QA dashboard' 
                  : 'Create your staff account'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'signup')}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                  <LoginForm />
                </TabsContent>
                <TabsContent value="signup">
                  <SignupForm />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            By continuing, you agree to follow all food safety protocols
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
