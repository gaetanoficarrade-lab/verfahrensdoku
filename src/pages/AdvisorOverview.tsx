import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Circle, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ClientOverview {
  id: string;
  company: string;
  projectId: string | null;
  projectName: string | null;
  ampel: 'green' | 'yellow' | 'red';
  lastActivity: string | null;
  submittedCount: number;
  approvedCount: number;
  totalCount: number;
}

export default function AdvisorOverview() {
  const { effectiveTenantId } = useAuthContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<ClientOverview[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (!effectiveTenantId) { setLoading(false); return; }
    const load = async () => {
      setLoading(true);
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('id, company, status')
        .eq('tenant_id', effectiveTenantId);

      if (clientsError) {
        console.error('Error loading clients:', clientsError);
      }

      if (!clientsData) { setLoading(false); return; }

      // Fetch all projects for this tenant in one query
      const { data: allProjects } = await supabase
        .from('projects')
        .select('id, name, updated_at, created_at, client_id')
        .eq('tenant_id', effectiveTenantId);

      // Fetch all chapter_data for these projects in one query
      const projectIds = (allProjects || []).map(p => p.id);
      let allChapters: any[] = [];
      if (projectIds.length > 0) {
        const { data: chaptersData } = await supabase
          .from('chapter_data')
          .select('project_id, status, updated_at')
          .in('project_id', projectIds);
        allChapters = chaptersData || [];
      }

      const overviews: ClientOverview[] = [];
      for (const client of clientsData) {
        // Find the latest project for this client
        const clientProjects = (allProjects || []).filter(p => p.client_id === client.id);
        const project = clientProjects.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];

        if (!project) {
          overviews.push({
            id: client.id,
            company: client.company,
            projectId: null,
            projectName: null,
            ampel: 'red',
            lastActivity: null,
            submittedCount: 0,
            approvedCount: 0,
            totalCount: 0,
          });
          continue;
        }

        const chapters = allChapters.filter(c => c.project_id === project.id);
        const total = chapters.length;
        const approved = chapters.filter(c => c.status === 'advisor_approved' || c.status === 'approved').length;
        const submitted = chapters.filter(c => c.status === 'client_submitted').length;
        const lastUpdate = chapters.reduce((latest: string | null, c: any) => {
          if (!latest || (c.updated_at && c.updated_at > latest)) return c.updated_at;
          return latest;
        }, project.updated_at) || project.updated_at;

        const daysSinceActivity = lastUpdate
          ? Math.floor((Date.now() - new Date(lastUpdate).getTime()) / 86400000)
          : 999;

        let ampel: 'green' | 'yellow' | 'red' = 'green';
        if (total > 0 && approved === total) {
          ampel = 'green';
        } else if (submitted > 0) {
          ampel = 'yellow';
        } else if (daysSinceActivity >= 14) {
          ampel = 'red';
        } else {
          ampel = 'yellow';
        }

        overviews.push({
          id: client.id,
          company: client.company,
          projectId: project.id,
          projectName: project.name,
          ampel,
          lastActivity: lastUpdate,
          submittedCount: submitted,
          approvedCount: approved,
          totalCount: total,
        });
      }

      setClients(overviews);
      setLoading(false);
    };
    load();
  }, [effectiveTenantId]);

  const ampelColors = {
    green: 'text-green-500',
    yellow: 'text-yellow-500',
    red: 'text-red-500',
  };

  const getAmpelLabel = (client: ClientOverview) => {
    if (client.ampel === 'green') return 'Alle freigegeben';
    if (client.ampel === 'yellow') return client.submittedCount > 0 ? 'Wartet auf Review' : 'In Bearbeitung';
    if (!client.projectId) return 'Kein Projekt';
    return 'Keine Aktivität';
  };

  const filtered = filter === 'all' ? clients : clients.filter(c => c.ampel === filter);

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Kunden-Übersicht</h1>
          <p className="text-sm text-muted-foreground mt-1">Ampel-Status aller Kunden</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle ({clients.length})</SelectItem>
            <SelectItem value="green">Grün ({clients.filter(c => c.ampel === 'green').length})</SelectItem>
            <SelectItem value="yellow">Gelb ({clients.filter(c => c.ampel === 'yellow').length})</SelectItem>
            <SelectItem value="red">Rot ({clients.filter(c => c.ampel === 'red').length})</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary badges */}
      <div className="flex gap-3">
        <Badge variant="outline" className="gap-1.5 px-3 py-1">
          <Circle className="h-3 w-3 fill-green-500 text-green-500" />
          {clients.filter(c => c.ampel === 'green').length} Fertig
        </Badge>
        <Badge variant="outline" className="gap-1.5 px-3 py-1">
          <Circle className="h-3 w-3 fill-yellow-500 text-yellow-500" />
          {clients.filter(c => c.ampel === 'yellow').length} Wartend
        </Badge>
        <Badge variant="outline" className="gap-1.5 px-3 py-1">
          <Circle className="h-3 w-3 fill-red-500 text-red-500" />
          {clients.filter(c => c.ampel === 'red').length} Inaktiv
        </Badge>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Keine Mandanten in dieser Kategorie.</p>
        ) : (
          filtered.map(client => (
            <Card key={client.id} className="hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => {
              if (client.projectId) navigate(`/projects/${client.projectId}`);
              else navigate(`/clients/${client.id}`);
            }}>
              <CardContent className="flex items-center gap-4 py-4">
                <Circle className={`h-4 w-4 fill-current ${ampelColors[client.ampel]}`} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground">{client.company}</h3>
                  <p className="text-xs text-muted-foreground">
                    {client.projectName || 'Kein Projekt'}
                    {client.totalCount > 0 && ` • ${client.approvedCount}/${client.totalCount} freigegeben`}
                    {client.submittedCount > 0 && ` • ${client.submittedCount} wartet auf Review`}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <Badge variant="secondary" className={`text-xs ${ampelColors[client.ampel]}`}>
                    {getAmpelLabel(client)}
                  </Badge>
                  {client.lastActivity && (
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Letzte Aktivität: {new Date(client.lastActivity).toLocaleDateString('de-DE')}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
