import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import {
  ClipboardCheck,
  AlertTriangle,
  Thermometer,
  FileText,
  Plus,
  TrendingUp,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

// Mock data for charts
const complianceTrendData = [
  { date: 'Mon', compliance: 98, checks: 24 },
  { date: 'Tue', compliance: 96, checks: 28 },
  { date: 'Wed', compliance: 100, checks: 26 },
  { date: 'Thu', compliance: 94, checks: 30 },
  { date: 'Fri', compliance: 97, checks: 25 },
  { date: 'Sat', compliance: 99, checks: 18 },
  { date: 'Sun', compliance: 100, checks: 12 },
];

const ccpStatusData = [
  { name: 'Compliant', value: 85, color: 'hsl(var(--success))' },
  { name: 'Minor Deviation', value: 10, color: 'hsl(var(--warning))' },
  { name: 'Critical', value: 5, color: 'hsl(var(--danger))' },
];

const Dashboard = () => {
  const [stats, setStats] = useState({
    todayChecks: 0,
    weekCompliance: 97.5,
    openViolations: 0,
    pendingAudits: 0,
  });
  const [recentChecks, setRecentChecks] = useState<any[]>([]);
  const [ccps, setCcps] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Fetch today's checks count
      const today = format(new Date(), 'yyyy-MM-dd');
      const { count: checksCount } = await supabase
        .from('daily_checks')
        .select('*', { count: 'exact', head: true })
        .eq('check_date', today);

      // Fetch open violations count
      const { count: violationsCount } = await supabase
        .from('safety_violations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');

      // Fetch recent checks
      const { data: checks } = await supabase
        .from('daily_checks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch CCPs
      const { data: ccpData } = await supabase
        .from('haccp_ccps')
        .select('*')
        .eq('is_active', true);

      setStats({
        ...stats,
        todayChecks: checksCount || 0,
        openViolations: violationsCount || 0,
      });
      setRecentChecks(checks || []);
      setCcps(ccpData || []);
    };

    fetchDashboardData();
  }, []);

  return (
    <DashboardLayout
      title="Dashboard"
      description="Quality Assurance Overview"
    >
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Today's Checks"
          value={stats.todayChecks}
          change="+12% from yesterday"
          changeType="positive"
          icon={ClipboardCheck}
        />
        <MetricCard
          title="Weekly Compliance"
          value={`${stats.weekCompliance}%`}
          change="Target: 95%"
          changeType="positive"
          icon={TrendingUp}
          variant="success"
        />
        <MetricCard
          title="Open Violations"
          value={stats.openViolations}
          change={stats.openViolations > 0 ? 'Requires attention' : 'All clear'}
          changeType={stats.openViolations > 0 ? 'negative' : 'positive'}
          icon={AlertTriangle}
          variant={stats.openViolations > 0 ? 'danger' : 'success'}
        />
        <MetricCard
          title="Active CCPs"
          value={ccps.length}
          change="Monitored continuously"
          changeType="neutral"
          icon={Thermometer}
        />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Button asChild>
          <Link to="/daily-checks/new">
            <Plus className="h-4 w-4 mr-2" />
            New Daily Check
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/haccp">
            <Thermometer className="h-4 w-4 mr-2" />
            Log CCP Reading
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/violations">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Report Violation
          </Link>
        </Button>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Compliance Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Weekly Compliance Trend</CardTitle>
            <CardDescription>Pass rate over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={complianceTrendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis domain={[90, 100]} className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="compliance"
                    stroke="hsl(var(--success))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--success))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* CCP Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">CCP Status</CardTitle>
            <CardDescription>Current compliance distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ccpStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {ccpStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {ccpStatusData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-mono font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & CCPs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Checks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Checks</CardTitle>
              <CardDescription>Latest quality control entries</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/daily-checks">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentChecks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ClipboardCheck className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No checks recorded yet</p>
                <Button variant="link" asChild className="mt-2">
                  <Link to="/daily-checks/new">Add your first check</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentChecks.map((check) => (
                  <div
                    key={check.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {check.is_compliant ? (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      ) : (
                        <XCircle className="h-5 w-5 text-danger" />
                      )}
                      <div>
                        <p className="font-medium text-sm">
                          {check.location || 'General Check'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(check.created_at), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={check.is_compliant ? 'pass' : 'fail'} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active CCPs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Active CCPs</CardTitle>
              <CardDescription>Critical Control Points being monitored</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/haccp">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {ccps.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Thermometer className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No CCPs configured</p>
              </div>
            ) : (
              <div className="space-y-3">
                {ccps.slice(0, 5).map((ccp) => (
                  <div
                    key={ccp.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div>
                      <p className="font-medium text-sm">{ccp.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Limit: {ccp.critical_limit_min ?? '—'} to {ccp.critical_limit_max ?? '—'} {ccp.unit}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {ccp.monitoring_frequency}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
