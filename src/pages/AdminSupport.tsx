import { useState, useEffect, useCallback } from 'react';
import { Search, Download, Eye, CheckCircle2, CircleDot, Send, Loader2, MailOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SupportRequest {
  id: string;
  tenant_id: string;
  tenant_name: string;
  user_id: string;
  user_email: string;
  user_name: string;
  title: string;
  description: string | null;
  screenshot_url: string | null;
  status: string;
  admin_unread: boolean;
  created_at: string;
}

interface SupportMessage {
  id: string;
  request_id: string;
  sender_type: string;
  sender_name: string;
  body: string;
  created_at: string;
}

interface TenantWidget {
  id: string;
  name: string;
  support_widget_disabled: boolean;
}

export default function AdminSupport() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [tenants, setTenants] = useState<TenantWidget[]>([]);
  const [tenantsLoading, setTenantsLoading] = useState(true);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('support_requests')
      .select('*')
      .order('created_at', { ascending: false });
    setRequests((data as SupportRequest[]) || []);
    setLoading(false);
  }, []);

  const loadTenants = useCallback(async () => {
    setTenantsLoading(true);
    const { data } = await supabase
      .from('tenants')
      .select('id, name, support_widget_disabled')
      .order('name');
    setTenants((data as TenantWidget[]) || []);
    setTenantsLoading(false);
  }, []);

  useEffect(() => {
    loadRequests();
    loadTenants();
  }, [loadRequests, loadTenants]);

  const openDetail = async (req: SupportRequest) => {
    setSelectedRequest(req);
    setReplyText('');
    setMessagesLoading(true);

    // Mark as read
    if (req.admin_unread) {
      await supabase.from('support_requests').update({ admin_unread: false }).eq('id', req.id);
      setRequests(prev => prev.map(r => r.id === req.id ? { ...r, admin_unread: false } : r));
    }

    const { data } = await supabase
      .from('support_messages')
      .select('*')
      .eq('request_id', req.id)
      .order('created_at', { ascending: true });
    setMessages((data as SupportMessage[]) || []);
    setMessagesLoading(false);
  };

  const markUnread = async (id: string) => {
    await supabase.from('support_requests').update({ admin_unread: true }).eq('id', id);
    setRequests(prev => prev.map(r => r.id === id ? { ...r, admin_unread: true } : r));
    toast({ title: 'Als ungelesen markiert' });
  };

  const markDone = async (id: string) => {
    await supabase.from('support_requests').update({ status: 'done' }).eq('id', id);
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'done' } : r));
    if (selectedRequest?.id === id) setSelectedRequest(prev => prev ? { ...prev, status: 'done' } : null);
    toast({ title: 'Als erledigt markiert' });
  };

  const sendReply = async () => {
    if (!replyText.trim() || !selectedRequest) return;
    setReplying(true);
    try {
      const { error } = await supabase.functions.invoke('send-support-reply', {
        body: {
          requestId: selectedRequest.id,
          body: replyText.trim(),
          recipientEmail: selectedRequest.user_email,
          recipientName: selectedRequest.user_name,
          ticketTitle: selectedRequest.title,
        },
      });
      if (error) throw error;

      // Reload messages
      const { data } = await supabase
        .from('support_messages')
        .select('*')
        .eq('request_id', selectedRequest.id)
        .order('created_at', { ascending: true });
      setMessages((data as SupportMessage[]) || []);
      setReplyText('');
      toast({ title: 'Antwort gesendet' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Fehler', description: err.message });
    } finally {
      setReplying(false);
    }
  };

  const toggleWidget = async (tenantId: string, disabled: boolean) => {
    await supabase.from('tenants').update({ support_widget_disabled: disabled }).eq('id', tenantId);
    setTenants(prev => prev.map(t => t.id === tenantId ? { ...t, support_widget_disabled: disabled } : t));
  };

  const exportCsv = () => {
    const filtered = getFilteredRequests();
    const header = 'Datum,Tenant,Nutzer,E-Mail,Titel,Status\n';
    const rows = filtered.map(r =>
      [
        new Date(r.created_at).toLocaleDateString('de-DE'),
        `"${r.tenant_name}"`,
        `"${r.user_name}"`,
        r.user_email,
        `"${r.title.replace(/"/g, '""')}"`,
        r.status,
      ].join(',')
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `support-anfragen-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getFilteredRequests = () => {
    if (!search.trim()) return requests;
    const s = search.toLowerCase();
    return requests.filter(r =>
      r.title.toLowerCase().includes(s) ||
      r.tenant_name.toLowerCase().includes(s) ||
      r.user_name.toLowerCase().includes(s) ||
      r.user_email.toLowerCase().includes(s)
    );
  };

  const filtered = getFilteredRequests();
  const unreadCount = requests.filter(r => r.admin_unread).length;

  const fmt = (d: string) => new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Support</h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} ungelesene Anfragen` : 'Alle Anfragen gelesen'}
          </p>
        </div>
      </div>

      <Tabs defaultValue="requests">
        <TabsList>
          <TabsTrigger value="requests" className="gap-1.5">
            Anfragen
            {unreadCount > 0 && (
              <Badge className="ml-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-destructive text-destructive-foreground">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="visibility">Widget-Sichtbarkeit</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Suchen..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="sm" onClick={exportCsv} className="gap-2">
              <Download className="h-4 w-4" />
              CSV Export
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : filtered.length === 0 ? (
                <p className="text-center py-12 text-sm text-muted-foreground">Keine Anfragen gefunden.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8"></TableHead>
                      <TableHead>Datum</TableHead>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Nutzer</TableHead>
                      <TableHead>Titel</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(req => (
                      <TableRow key={req.id} className={req.admin_unread ? 'bg-primary/5' : ''}>
                        <TableCell>
                          {req.admin_unread && (
                            <span className="inline-block h-2.5 w-2.5 rounded-full bg-destructive" />
                          )}
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">{fmt(req.created_at)}</TableCell>
                        <TableCell className="text-sm font-medium">{req.tenant_name}</TableCell>
                        <TableCell>
                          <div className="text-sm">{req.user_name}</div>
                          <div className="text-xs text-muted-foreground">{req.user_email}</div>
                        </TableCell>
                        <TableCell className="text-sm max-w-[200px] truncate">{req.title}</TableCell>
                        <TableCell>
                          <Badge variant={req.status === 'open' ? 'default' : 'secondary'} className="text-xs">
                            {req.status === 'open' ? 'Offen' : 'Erledigt'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDetail(req)} title="Ansehen">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => markUnread(req.id)} title="Als ungelesen markieren">
                              <MailOpen className="h-4 w-4" />
                            </Button>
                            {req.status === 'open' && (
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => markDone(req.id)} title="Als erledigt markieren">
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visibility" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Widget-Sichtbarkeit pro Tenant</CardTitle>
            </CardHeader>
            <CardContent>
              {tenantsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-3">
                  {tenants.map(t => (
                    <div key={t.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <span className="text-sm font-medium">{t.name}</span>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-muted-foreground">
                          {t.support_widget_disabled ? 'Deaktiviert' : 'Aktiv'}
                        </Label>
                        <Switch
                          checked={!t.support_widget_disabled}
                          onCheckedChange={(checked) => toggleWidget(t.id, !checked)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={(o) => { if (!o) setSelectedRequest(null); }}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
          {selectedRequest && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base">{selectedRequest.title}</DialogTitle>
                <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                  <span>{selectedRequest.tenant_name}</span>
                  <span>·</span>
                  <span>{selectedRequest.user_name} ({selectedRequest.user_email})</span>
                  <span>·</span>
                  <Badge variant={selectedRequest.status === 'open' ? 'default' : 'secondary'} className="text-[10px]">
                    {selectedRequest.status === 'open' ? 'Offen' : 'Erledigt'}
                  </Badge>
                  {selectedRequest.status === 'open' && (
                    <Button variant="outline" size="sm" className="h-6 text-xs ml-2" onClick={() => markDone(selectedRequest.id)}>
                      Als erledigt markieren
                    </Button>
                  )}
                </div>
              </DialogHeader>

              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4 py-2">
                  {/* Initial request */}
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                      <p className="text-xs font-medium text-muted-foreground mb-1">{selectedRequest.user_name} · {fmt(selectedRequest.created_at)}</p>
                      {selectedRequest.description && (
                        <p className="text-sm whitespace-pre-wrap">{selectedRequest.description}</p>
                      )}
                      {!selectedRequest.description && (
                        <p className="text-sm italic text-muted-foreground">Keine Beschreibung</p>
                      )}
                      {selectedRequest.screenshot_url && (
                        <a href={selectedRequest.screenshot_url} target="_blank" rel="noopener noreferrer" className="block mt-2">
                          <img src={selectedRequest.screenshot_url} alt="Screenshot" className="rounded-md max-h-48 object-contain border" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Messages */}
                  {messagesLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    messages.map(msg => (
                      <div key={msg.id} className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-lg p-3 ${msg.sender_type === 'admin' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                          <p className={`text-xs font-medium mb-1 ${msg.sender_type === 'admin' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                            {msg.sender_name} · {fmt(msg.created_at)}
                          </p>
                          <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              {/* Reply */}
              <div className="flex gap-2 pt-2 border-t">
                <Textarea
                  placeholder="Antwort schreiben..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={2}
                  className="flex-1"
                />
                <Button onClick={sendReply} disabled={replying || !replyText.trim()} size="icon" className="h-auto">
                  {replying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
