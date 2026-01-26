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
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/AuthContext';
import { Plus, Search, Filter, Download } from 'lucide-react';
import { format } from 'date-fns';

const DailyChecks = () => {
  const { user } = useAuthContext();
  const [checks, setChecks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    temperature: '',
    weight: '',
    hygiene_score: '',
    location: '',
    equipment_id: '',
    notes: '',
  });

  const fetchChecks = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('daily_checks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch checks');
    } else {
      setChecks(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchChecks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const temp = parseFloat(formData.temperature);
    const hygieneScore = parseInt(formData.hygiene_score);

    // Simple compliance check - temperature should be within safe range
    const isCompliant = temp <= 4 && hygieneScore >= 7;

    const { error } = await supabase.from('daily_checks').insert({
      temperature: temp || null,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      hygiene_score: hygieneScore || null,
      location: formData.location || null,
      equipment_id: formData.equipment_id || null,
      notes: formData.notes || null,
      is_compliant: isCompliant,
      created_by: user?.id,
    });

    if (error) {
      toast.error('Failed to create check');
    } else {
      toast.success('Daily check recorded successfully');
      setFormData({
        temperature: '',
        weight: '',
        hygiene_score: '',
        location: '',
        equipment_id: '',
        notes: '',
      });
      setIsDialogOpen(false);
      fetchChecks();
    }
  };

  const filteredChecks = checks.filter((check) =>
    check.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    check.equipment_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout
      title="Daily Quality Checks"
      description="Record and monitor daily quality control inspections"
    >
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by location or equipment..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Check
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Record Daily Check</DialogTitle>
                <DialogDescription>
                  Enter the quality control measurements for this inspection.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="temperature">Temperature (°C)</Label>
                    <Input
                      id="temperature"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 2.5"
                      value={formData.temperature}
                      onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 25.5"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hygiene_score">Hygiene Score (1-10)</Label>
                    <Select
                      value={formData.hygiene_score}
                      onValueChange={(value) => setFormData({ ...formData, hygiene_score: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select score" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                          <SelectItem key={score} value={score.toString()}>
                            {score} {score >= 9 ? '- Excellent' : score >= 7 ? '- Good' : score >= 5 ? '- Fair' : '- Poor'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Select
                      value={formData.location}
                      onValueChange={(value) => setFormData({ ...formData, location: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cold Storage A">Cold Storage A</SelectItem>
                        <SelectItem value="Cold Storage B">Cold Storage B</SelectItem>
                        <SelectItem value="Processing Floor">Processing Floor</SelectItem>
                        <SelectItem value="Packaging Area">Packaging Area</SelectItem>
                        <SelectItem value="Loading Dock">Loading Dock</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="equipment_id">Equipment ID</Label>
                  <Input
                    id="equipment_id"
                    placeholder="e.g., RF-001"
                    value={formData.equipment_id}
                    onChange={(e) => setFormData({ ...formData, equipment_id: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional observations..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Record Check</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Checks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Quality Check Records</CardTitle>
          <CardDescription>
            {filteredChecks.length} records found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : filteredChecks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="mb-4">No checks recorded yet</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Record First Check
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date/Time</th>
                    <th>Location</th>
                    <th>Temp (°C)</th>
                    <th>Weight (kg)</th>
                    <th>Hygiene</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredChecks.map((check) => (
                    <tr key={check.id}>
                      <td className="font-mono text-sm">
                        {format(new Date(check.created_at), 'MMM d, yyyy h:mm a')}
                      </td>
                      <td>{check.location || '—'}</td>
                      <td className="font-mono">{check.temperature ?? '—'}</td>
                      <td className="font-mono">{check.weight ?? '—'}</td>
                      <td>
                        <span className={`font-mono ${
                          check.hygiene_score >= 8 ? 'text-success' :
                          check.hygiene_score >= 6 ? 'text-warning' :
                          'text-danger'
                        }`}>
                          {check.hygiene_score ?? '—'}/10
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={check.is_compliant ? 'pass' : 'fail'} />
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

export default DailyChecks;
