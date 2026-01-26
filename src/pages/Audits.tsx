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
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/AuthContext';
import { FileText, Plus, Download, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const Audits = () => {
  const { user } = useAuthContext();
  const [audits, setAudits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    audit_type: 'internal',
    audit_date: format(new Date(), 'yyyy-MM-dd'),
    auditor_name: '',
    auditor_organization: '',
    findings: '',
    score: '',
    pass_status: true,
    recommendations: '',
    follow_up_required: false,
    follow_up_date: '',
  });

  const fetchAudits = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('audit_records')
      .select('*')
      .order('audit_date', { ascending: false });

    if (error) {
      toast.error('Failed to fetch audits');
    } else {
      setAudits(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAudits();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.auditor_name.trim()) {
      toast.error('Please provide auditor name');
      return;
    }

    const { error } = await supabase.from('audit_records').insert({
      audit_type: formData.audit_type,
      audit_date: formData.audit_date,
      auditor_name: formData.auditor_name,
      auditor_organization: formData.auditor_organization || null,
      findings: formData.findings || null,
      score: formData.score ? parseFloat(formData.score) : null,
      pass_status: formData.pass_status,
      recommendations: formData.recommendations || null,
      follow_up_required: formData.follow_up_required,
      follow_up_date: formData.follow_up_required ? formData.follow_up_date : null,
      conducted_by: user?.id,
    });

    if (error) {
      toast.error('Failed to record audit');
    } else {
      toast.success('Audit record created successfully');
      setFormData({
        audit_type: 'internal',
        audit_date: format(new Date(), 'yyyy-MM-dd'),
        auditor_name: '',
        auditor_organization: '',
        findings: '',
        score: '',
        pass_status: true,
        recommendations: '',
        follow_up_required: false,
        follow_up_date: '',
      });
      setIsDialogOpen(false);
      fetchAudits();
    }
  };

  const passedAudits = audits.filter((a) => a.pass_status).length;
  const passRate = audits.length > 0 ? Math.round((passedAudits / audits.length) * 100) : 100;
  const pendingFollowUps = audits.filter((a) => a.follow_up_required && !a.resolved_at).length;

  return (
    <DashboardLayout
      title="Audit Records"
      description="Track internal and external food safety audits"
    >
      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <MetricCard
          title="Total Audits"
          value={audits.length}
          icon={FileText}
        />
        <MetricCard
          title="Pass Rate"
          value={`${passRate}%`}
          change={`${passedAudits} of ${audits.length} passed`}
          changeType={passRate >= 90 ? 'positive' : 'negative'}
          variant={passRate >= 90 ? 'success' : 'warning'}
        />
        <MetricCard
          title="Pending Follow-ups"
          value={pendingFollowUps}
          changeType={pendingFollowUps > 0 ? 'negative' : 'positive'}
          variant={pendingFollowUps > 0 ? 'warning' : 'success'}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Record Audit
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Record Audit Results</DialogTitle>
              <DialogDescription>
                Document the findings from an internal or external audit.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Audit Type</Label>
                  <Select
                    value={formData.audit_type}
                    onValueChange={(value) => setFormData({ ...formData, audit_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internal">Internal</SelectItem>
                      <SelectItem value="external">External</SelectItem>
                      <SelectItem value="cfia">CFIA</SelectItem>
                      <SelectItem value="haccp">HACCP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="audit_date">Audit Date</Label>
                  <Input
                    id="audit_date"
                    type="date"
                    value={formData.audit_date}
                    onChange={(e) => setFormData({ ...formData, audit_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="auditor_name">Auditor Name *</Label>
                  <Input
                    id="auditor_name"
                    placeholder="Full name"
                    value={formData.auditor_name}
                    onChange={(e) => setFormData({ ...formData, auditor_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="auditor_organization">Organization</Label>
                  <Input
                    id="auditor_organization"
                    placeholder="e.g., CFIA, SGS"
                    value={formData.auditor_organization}
                    onChange={(e) => setFormData({ ...formData, auditor_organization: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="score">Score (Optional)</Label>
                  <Input
                    id="score"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0-100"
                    value={formData.score}
                    onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pass Status</Label>
                  <Select
                    value={formData.pass_status ? 'pass' : 'fail'}
                    onValueChange={(value) => setFormData({ ...formData, pass_status: value === 'pass' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pass">Pass</SelectItem>
                      <SelectItem value="fail">Fail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="findings">Findings</Label>
                <Textarea
                  id="findings"
                  placeholder="Summary of audit findings..."
                  value={formData.findings}
                  onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recommendations">Recommendations</Label>
                <Textarea
                  id="recommendations"
                  placeholder="Recommendations for improvement..."
                  value={formData.recommendations}
                  onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="follow_up"
                  checked={formData.follow_up_required}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, follow_up_required: checked === true })
                  }
                />
                <Label htmlFor="follow_up" className="font-normal">
                  Follow-up required
                </Label>
              </div>

              {formData.follow_up_required && (
                <div className="space-y-2">
                  <Label htmlFor="follow_up_date">Follow-up Date</Label>
                  <Input
                    id="follow_up_date"
                    type="date"
                    value={formData.follow_up_date}
                    onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Audit Record</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Audits Table */}
      <Card>
        <CardHeader>
          <CardTitle>Audit History</CardTitle>
          <CardDescription>Complete record of all audits</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : audits.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="mb-4">No audits recorded yet</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Record First Audit
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Auditor</th>
                    <th>Score</th>
                    <th>Status</th>
                    <th>Follow-up</th>
                  </tr>
                </thead>
                <tbody>
                  {audits.map((audit) => (
                    <tr key={audit.id}>
                      <td className="font-mono text-sm">
                        {format(new Date(audit.audit_date), 'MMM d, yyyy')}
                      </td>
                      <td className="uppercase text-xs font-medium">
                        {audit.audit_type}
                      </td>
                      <td>
                        <div>
                          <p className="font-medium">{audit.auditor_name}</p>
                          {audit.auditor_organization && (
                            <p className="text-xs text-muted-foreground">{audit.auditor_organization}</p>
                          )}
                        </div>
                      </td>
                      <td className="font-mono">
                        {audit.score !== null ? `${audit.score}%` : '—'}
                      </td>
                      <td>
                        <StatusBadge status={audit.pass_status ? 'pass' : 'fail'} />
                      </td>
                      <td>
                        {audit.follow_up_required ? (
                          <div className="flex items-center gap-1 text-warning text-sm">
                            <Calendar className="h-3 w-3" />
                            {audit.follow_up_date
                              ? format(new Date(audit.follow_up_date), 'MMM d')
                              : 'Pending'}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
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

export default Audits;
