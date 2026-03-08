import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase";

const Index = () => {
  const [tables, setTables] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const { data, error } = await supabase.rpc("get_tables_list");
        if (error) {
          // Fallback: try querying information_schema via a simple test
          const { data: testData, error: testError } = await supabase
            .from("pg_catalog.pg_tables")
            .select("tablename")
            .eq("schemaname", "public");

          if (testError) {
            // Last fallback: just test the connection
            const { error: healthError } = await supabase.auth.getSession();
            if (healthError) {
              setError(`Verbindungsfehler: ${healthError.message}`);
            } else {
              setError(
                "Verbindung erfolgreich! Tabellen konnten nicht direkt abgefragt werden. Erstelle eine RPC-Funktion 'get_tables_list' oder nutze die Supabase-Oberfläche."
              );
              // Try to list some known tables by attempting selects
              await probeKnownTables();
            }
          } else {
            setTables((testData || []).map((t: any) => t.tablename));
          }
        } else {
          setTables(data || []);
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    const probeKnownTables = async () => {
      // We can't easily list tables without an RPC, so just confirm connection works
      setTables([]);
    };

    fetchTables();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center max-w-lg mx-auto p-6">
        <h1 className="mb-4 text-3xl font-bold text-foreground">
          Supabase Verbindungstest
        </h1>
        {loading && (
          <p className="text-muted-foreground">Verbindung wird getestet...</p>
        )}
        {error && (
          <div className="mt-4 rounded-md border border-border bg-muted p-4 text-left">
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        )}
        {!loading && !error && tables.length === 0 && (
          <p className="text-muted-foreground">
            Keine öffentlichen Tabellen gefunden.
          </p>
        )}
        {tables.length > 0 && (
          <div className="mt-4 text-left">
            <h2 className="mb-2 text-lg font-semibold text-foreground">
              Gefundene Tabellen ({tables.length}):
            </h2>
            <ul className="space-y-1">
              {tables.map((t) => (
                <li
                  key={t}
                  className="rounded bg-muted px-3 py-2 text-sm text-foreground font-mono"
                >
                  {t}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
