import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/AuthContext';
import { Thermometer, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

const HACCP = () => {
  const { user, isAdmin } = useAuthContext();
  const [ccps, setCcps] = useState<any[]>([]);
  const [complianceRecords, setComplianceRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCcp, setSelectedCcp] = useState<any>(null);

  const [formData, setFormData] = useState({
    ccp_id: '',
    measured_value: '',
    deviation_notes: '',
    corrective_action_taken: '',
  });

  const fetchData = async () => {
    setIsLoading(true);

    const [ccpsResult, complianceResult] = await Promise.all([
      supabase.from('haccp_ccps').select('*').eq('is_active', true).order('name'),
      supabase.from('ccp_compliance').select('*, haccp_ccps(name, unit)').order('created_at', { ascending: false }).limit(20),
    ]);

    if (ccpsResult.data) setCcps(ccpsResult.data);
    if (complianceResult.data) setComplianceRecords(complianceResult.data);

    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const checkCompliance = (ccp: any, value: number): boolean => {
    const { critical_limit_min, critical_limit_max } = ccp;
    if (critical_limit_min !== null && value < critical_limit_min) return false;
    if (critical_limit_max !== null && value > critical_limit_max) return false;
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.ccp_id || !formData.measured_value) {
      toast.error('Please fill in required fields');
      return;
    }

    const ccp = ccps.find((c) => c.id === formData.ccp_id);
    const measuredValue = parseFloat(formData.measured_value);
    const isCompliant = checkCompliance(ccp, measuredValue);

    const { error } = await supabase.from('ccp_compliance').insert({
      ccp_id: formData.ccp_id,
      measured_value: measuredValue,
      is_compliant: isCompliant,
      deviation_notes: !isCompliant ? formData.deviation_notes : null,
      corrective_action_taken: !isCompliant ? formData.corrective_action_taken : null,
      created_by: user?.id,
    });

    if (error) {
      toast.error('Failed to record measurement');
    } else {
      if (!isCompliant) {
        toast.warning('Deviation detected! Corrective action may be required.');
      } else {
        toast.success('CCP measurement recorded - Compliant');
      }
      setFormData({
        ccp_id: '',
        measured_value: '',
        deviation_notes: '',
        corrective_action_taken: '',
      });
      setIsDialogOpen(false);
      setSelectedCcp(null);
      fetchData();
    }
  };

  const handleCcpSelect = (ccpId: string) => {
    const ccp = ccps.find((c) => c.id === ccpId);
    setSelectedCcp(ccp);
    setFormData({ ...formData, ccp_id: ccpId });
  };

  const compliantCount = complianceRecords.filter((r) => r.is_compliant).length;
  const complianceRate = complianceRecords.length > 0
    ? Math.round((compliantCount / complianceRecords.length) * 100)
    : 100;

  return (
    <DashboardLayout
      title="HACCP Critical Control Points"
      description="Monitor and record CCP measurements for food safety compliance"
    >
      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <MetricCard
          title="Active CCPs"
          value={ccps.length}
          icon={Thermometer}
        />
        <MetricCard
          title="Compliance Rate"
          value={`${complianceRate}%`}
          change="Last 20 readings"
          changeType={complianceRate >= 95 ? 'positive' : 'negative'}
          variant={complianceRate >= 95 ? 'success' : 'danger'}
          icon={complianceRate >= 95 ? CheckCircle2 : AlertCircle}
        />
        <MetricCard
          title="Readings Today"
          value={complianceRecords.filter((r) => 
            format(new Date(r.created_at), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
          ).length}
          icon={Thermometer}
        />
      </div>

      {/* Log Reading Button */}
      <div className="flex justify-end mb-6">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Log CCP Reading
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Log CCP Reading</DialogTitle>
              <DialogDescription>
                Record a measurement for a Critical Control Point.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Critical Control Point</Label>
                <Select value={formData.ccp_id} onValueChange={handleCcpSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select CCP" />
                  </SelectTrigger>
                  <SelectContent>
                    {ccps.map((ccp) => (
                      <SelectItem key={ccp.id} value={ccp.id}>
                        {ccp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCcp && (
                <div className="p-3 bg-muted rounded-lg text-sm">
                  <p className="font-medium">{selectedCcp.name}</p>
                  <p className="text-muted-foreground">
                    Critical Limit: {selectedCcp.critical_limit_min ?? '—'} to{' '}
                    {selectedCcp.critical_limit_max ?? '—'} {selectedCcp.unit}
                  </p>
                  <p className="text-muted-foreground">
                    Frequency: {selectedCcp.monitoring_frequency}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="measured_value">
                  Measured Value {selectedCcp ? `(${selectedCcp.unit})` : ''}
                </Label>
                <Input
                  id="measured_value"
                  type="number"
                  step="0.1"
                  placeholder="Enter measurement"
                  value={formData.measured_value}
                  onChange={(e) => setFormData({ ...formData, measured_value: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deviation_notes">Deviation Notes (if any)</Label>
                <Textarea
                  id="deviation_notes"
                  placeholder="Describe any deviations observed..."
                  value={formData.deviation_notes}
                  onChange={(e) => setFormData({ ...formData, deviation_notes: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="corrective_action">Corrective Action Taken</Label>
                <Textarea
                  id="corrective_action"
                  placeholder="Actions taken to correct deviation..."
                  value={formData.corrective_action_taken}
                  onChange={(e) => setFormData({ ...formData, corrective_action_taken: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Record Measurement</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* CCPs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {ccps.map((ccp) => (
          <Card key={ccp.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{ccp.name}</CardTitle>
                <Thermometer className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardDescription className="text-xs">{ccp.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Critical Limit:</span>
                  <span className="font-mono font-medium">
                    {ccp.critical_limit_min ?? '—'} to {ccp.critical_limit_max ?? '—'} {ccp.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frequency:</span>
                  <span>{ccp.monitoring_frequency}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Compliance Records */}
      <Card>
        <CardHeader>
          <CardTitle>Recent CCP Readings</CardTitle>
          <CardDescription>Latest compliance measurements</CardDescription>
        </CardHeader>
        <CardContent>
          {complianceRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No readings recorded yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date/Time</th>
                    <th>CCP</th>
                    <th>Value</th>
                    <th>Status</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {complianceRecords.map((record) => (
                    <tr key={record.id}>
                      <td className="font-mono text-sm">
                        {format(new Date(record.created_at), 'MMM d, yyyy h:mm a')}
                      </td>
                      <td>{record.haccp_ccps?.name || '—'}</td>
                      <td className="font-mono">
                        {record.measured_value} {record.haccp_ccps?.unit}
                      </td>
                      <td>
                        <StatusBadge status={record.is_compliant ? 'pass' : 'fail'} />
                      </td>
                      <td className="max-w-xs truncate">
                        {record.deviation_notes || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default HACCP;
