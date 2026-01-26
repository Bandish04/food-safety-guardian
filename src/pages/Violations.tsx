import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/AuthContext';
import { AlertTriangle, Plus, Search } from 'lucide-react';
import { format } from 'date-fns';

type ViolationSeverity = 'low' | 'medium' | 'high' | 'critical';
type ViolationStatus = 'open' | 'investigating' | 'resolved' | 'closed';

const Violations = () => {
  const { user } = useAuthContext();
  const [violations, setViolations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [formData, setFormData] = useState({
    description: '',
    severity: 'medium' as ViolationSeverity,
    location: '',
    corrective_action: '',
  });

  const fetchViolations = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('safety_violations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch violations');
    } else {
      setViolations(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchViolations();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description.trim()) {
      toast.error('Please provide a description');
      return;
    }

    const { error } = await supabase.from('safety_violations').insert({
      description: formData.description,
      severity: formData.severity,
      location: formData.location || null,
      corrective_action: formData.corrective_action || null,
      reported_by: user?.id,
      status: 'open',
    });

    if (error) {
      toast.error('Failed to report violation');
    } else {
      toast.success('Violation reported successfully');
      setFormData({
        description: '',
        severity: 'medium',
        location: '',
        corrective_action: '',
      });
      setIsDialogOpen(false);
      fetchViolations();
    }
  };

  const updateViolationStatus = async (id: string, newStatus: ViolationStatus) => {
    const updates: any = { status: newStatus };
    if (newStatus === 'resolved' || newStatus === 'closed') {
      updates.resolved_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('safety_violations')
      .update(updates)
      .eq('id', id);

    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success('Status updated');
      fetchViolations();
    }
  };

  const getSeverityColor = (severity: ViolationSeverity) => {
    switch (severity) {
      case 'critical':
        return 'bg-danger text-danger-foreground';
      case 'high':
        return 'bg-warning text-warning-foreground';
      case 'medium':
        return 'bg-accent text-accent-foreground';
      case 'low':
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusBadge = (status: ViolationStatus) => {
    switch (status) {
      case 'open':
        return <StatusBadge status="fail" label="Open" />;
      case 'investigating':
        return <StatusBadge status="warning" label="Investigating" />;
      case 'resolved':
        return <StatusBadge status="pass" label="Resolved" />;
      case 'closed':
        return <StatusBadge status="pending" label="Closed" />;
    }
  };

  const filteredViolations = violations.filter((v) => {
    const matchesSearch = v.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout
      title="Safety Violations"
      description="Report and track food safety violations"
    >
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search violations..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="investigating">Investigating</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Report Violation
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Report Safety Violation</DialogTitle>
              <DialogDescription>
                Document a food safety violation that requires attention.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the violation in detail..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Severity</Label>
                  <Select
                    value={formData.severity}
                    onValueChange={(value: ViolationSeverity) => setFormData({ ...formData, severity: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Cold Storage A"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="corrective_action">Recommended Corrective Action</Label>
                <Textarea
                  id="corrective_action"
                  placeholder="Suggested steps to address this violation..."
                  value={formData.corrective_action}
                  onChange={(e) => setFormData({ ...formData, corrective_action: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="destructive">Report Violation</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Violations List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : filteredViolations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
              <p className="text-muted-foreground mb-4">No violations found</p>
            </CardContent>
          </Card>
        ) : (
          filteredViolations.map((violation) => (
            <Card key={violation.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getSeverityColor(violation.severity)}>
                        {violation.severity.toUpperCase()}
                      </Badge>
                      {getStatusBadge(violation.status)}
                    </div>
                    <CardTitle className="text-base">{violation.description}</CardTitle>
                    <CardDescription className="mt-1">
                      {violation.location && `Location: ${violation.location} • `}
                      Reported: {format(new Date(violation.created_at), 'MMM d, yyyy h:mm a')}
                    </CardDescription>
                  </div>
                  <Select
                    value={violation.status}
                    onValueChange={(value: ViolationStatus) => updateViolationStatus(violation.id, value)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="investigating">Investigating</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              {violation.corrective_action && (
                <CardContent className="pt-0">
                  <div className="bg-muted/50 p-3 rounded-lg text-sm">
                    <p className="font-medium text-muted-foreground mb-1">Corrective Action:</p>
                    <p>{violation.corrective_action}</p>
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </DashboardLayout>
  );
};

export default Violations;
