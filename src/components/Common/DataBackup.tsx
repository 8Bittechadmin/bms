import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { downloadJson, readJsonFile, parseCsvFile } from '@/lib/exportUtils';

const ALL_TABLES = [
  'bookings',
  'clients',
  'client_messages',
  'dashboard_notifications',
  'dashboard_stats',
  'inventory',
  'invoices',
  'menu_categories',
  'menu_items',
  'payments',
  'user_roles',
  'users',
  'venues',
  'venue_unavailable_dates'
];

const DataBackup: React.FC = () => {
  const [selected, setSelected] = useState<string[]>(['users', 'user_roles']);
  const [isWorking, setIsWorking] = useState(false);

  const toggleTable = (t: string) => {
    setSelected(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  const backup = async () => {
    if (selected.length === 0) {
      toast({ title: 'Backup failed', description: 'No tables selected', variant: 'destructive' });
      return;
    }
    setIsWorking(true);
    try {
      const payload: Record<string, any[]> = {};
      for (const table of selected) {
        const { data, error } = await supabase.from(table).select('*');
        if (error) {
          console.warn('Error fetching', table, error);
          toast({ title: 'Partial failure', description: `Failed fetching ${table}`, variant: 'destructive' });
          payload[table] = [];
        } else {
          payload[table] = data || [];
        }
      }
      downloadJson({ created_at: new Date().toISOString(), data: payload }, `bms-backup-${new Date().toISOString()}`);
      toast({ title: 'Backup ready', description: 'Downloaded backup JSON' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Backup failed', description: 'An unexpected error occurred', variant: 'destructive' });
    } finally {
      setIsWorking(false);
    }
  };

  const restore = async (file: File, opts: { method: 'upsert' | 'insert' | 'replace' }) => {
    setIsWorking(true);
    try {
      const parsed = await readJsonFile(file);
      const obj = parsed.data || parsed;
      for (const table of Object.keys(obj)) {
        const rows = obj[table];
        if (!Array.isArray(rows)) continue;
        if (rows.length === 0) continue;
        // For safety, default to upsert where possible
        if (opts.method === 'replace') {
          // attempt to delete all rows (dangerous)
          const { error: errDel } = await supabase.from(table).delete().neq('id', '');
          if (errDel) console.warn('delete error', table, errDel);
          const { error: errIns } = await supabase.from(table).insert(rows);
          if (errIns) {
            toast({ title: 'Restore failed', description: `Failed inserting into ${table}`, variant: 'destructive' });
          }
        } else if (opts.method === 'insert') {
          const { error: errIns } = await supabase.from(table).insert(rows);
          if (errIns) {
            toast({ title: 'Restore failed', description: `Failed inserting into ${table}`, variant: 'destructive' });
          }
        } else {
          // upsert, try to use 'id' as conflict key if present
          const onConflict = rows[0] && rows[0].id ? 'id' : undefined;
          const { error: errUpsert } = await supabase.from(table).upsert(rows, onConflict ? { onConflict } : undefined);
          if (errUpsert) {
            console.warn('upsert error', table, errUpsert);
            toast({ title: 'Restore warning', description: `Upsert into ${table} had issues`, variant: 'destructive' });
          }
        }
      }
      toast({ title: 'Restore completed', description: 'Restore finished (check logs for errors)' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Restore failed', description: 'Invalid backup file or error', variant: 'destructive' });
    } finally {
      setIsWorking(false);
    }
  };

  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    // default to upsert
    await restore(f, { method: 'upsert' });
    e.currentTarget.value = '';
  };

  const handleCsvImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (selected.length !== 1) {
      toast({ title: 'Import failed', description: 'Select exactly one table to import CSV into', variant: 'destructive' });
      return;
    }
    setIsWorking(true);
    try {
      const rows = await parseCsvFile(f);
      const table = selected[0];
      // attempt upsert with id if present
      const onConflict = rows[0] && rows[0].id ? 'id' : undefined;
      const { error } = await supabase.from(table).upsert(rows, onConflict ? { onConflict } : undefined);
      if (error) {
        console.error(error);
        toast({ title: 'Import failed', description: 'Failed to import CSV', variant: 'destructive' });
      } else {
        toast({ title: 'Import successful', description: `Imported ${rows.length} rows into ${table}` });
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Import failed', description: 'Invalid CSV or error', variant: 'destructive' });
    } finally {
      setIsWorking(false);
      e.currentTarget.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 flex-wrap">
        {ALL_TABLES.map(t => (
          <label key={t} className="inline-flex items-center gap-2">
            <input type="checkbox" checked={selected.includes(t)} onChange={() => toggleTable(t)} />
            <span className="capitalize">{t}</span>
          </label>
        ))}
      </div>

      <div className="flex gap-2">
        <Button onClick={backup} disabled={isWorking}>
          Backup selected
        </Button>

        <label className="btn">
          <input type="file" accept="application/json" onChange={handleRestoreFile} style={{ display: 'none' }} />
          <Button disabled={isWorking}>Restore backup (JSON)</Button>
        </label>

        <label className="btn">
          <input type="file" accept="text/csv" onChange={handleCsvImport} style={{ display: 'none' }} />
          <Button disabled={isWorking}>Import CSV into selected table</Button>
        </label>
      </div>

      <p className="text-sm text-muted-foreground">Notes: Restore uses upsert by default (prefers 'id' conflict key). Replace mode will attempt to delete existing rows before inserting — use cautiously.</p>
    </div>
  );
};

export default DataBackup;
