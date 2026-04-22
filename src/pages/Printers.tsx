import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { storage } from "@/lib/storage";
import type { Printer } from "@/lib/storage";
import { Search, MapPin } from "lucide-react";

type PrinterStatus = 'online' | 'offline' | 'warning' | 'error';

const statusColors: Record<PrinterStatus, string> = {
  online: "bg-success",
  offline: "bg-destructive",
  warning: "bg-warning",
  error: "bg-destructive",
};

const statusBadge: Record<PrinterStatus, string> = {
  online: "bg-success/10 text-success border-success/20",
  offline: "bg-destructive/10 text-destructive border-destructive/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  error: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function Printers() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Printer | null>(null);
  const printers = storage.getPrinters();

  const filtered = printers.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">Printer Management</h1>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-success" /> {printers.filter(p => p.status === "online").length} Online</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-warning" /> {printers.filter(p => p.status === "warning").length} Warning</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-destructive" /> {printers.filter(p => p.status === "offline" || p.status === "error").length} Offline</span>
        </div>
      </div>

      <div className="flex gap-3">
        <div className={`flex-1 ${selected ? "lg:w-2/3" : ""}`}>
          <div className="relative mb-3">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search printers..." value={search} onChange={e => setSearch(e.target.value)} className="h-8 pl-7 text-xs" />
          </div>

          <Card className="shadow-none">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-2xs h-8 w-8"></TableHead>
                  <TableHead className="text-2xs h-8">Name</TableHead>
                  <TableHead className="text-2xs h-8">Location</TableHead>
                  <TableHead className="text-2xs h-8">Type</TableHead>
                  <TableHead className="text-2xs h-8">IP Address</TableHead>
                  <TableHead className="text-2xs h-8">Jobs</TableHead>
                  <TableHead className="text-2xs h-8">Toner</TableHead>
                  <TableHead className="text-2xs h-8">Paper</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(p => (
                  <TableRow
                    key={p.id}
                    className={`cursor-pointer ${selected?.id === p.id ? "bg-accent" : ""}`}
                    onClick={() => setSelected(p)}
                  >
                    <TableCell className="py-1.5 px-2">
                      <span className={`h-2 w-2 rounded-full inline-block ${statusColors[p.status]}`} />
                    </TableCell>
                    <TableCell className="text-xs py-1.5 font-medium">{p.name}</TableCell>
                    <TableCell className="text-xs py-1.5 text-muted-foreground">{p.location}</TableCell>
                    <TableCell className="text-xs py-1.5">
                      <Badge variant="outline" className="text-2xs">{p.type === "color" ? "Color" : "B&W"}</Badge>
                    </TableCell>
                    <TableCell className="text-xs py-1.5 font-mono text-muted-foreground">{p.ip}</TableCell>
                    <TableCell className="text-xs py-1.5">{p.jobCount}</TableCell>
                    <TableCell className="text-xs py-1.5">
                      <div className="flex items-center gap-1.5">
                        <Progress value={p.tonerLevel} className="h-1.5 w-12" />
                        <span className="text-2xs text-muted-foreground">{p.tonerLevel}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs py-1.5">
                      <div className="flex items-center gap-1.5">
                        <Progress value={p.paperLevel} className="h-1.5 w-12" />
                        <span className="text-2xs text-muted-foreground">{p.paperLevel}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* Detail Panel */}
        {selected && (
          <Card className="hidden lg:block w-80 shadow-none shrink-0 self-start">
            <CardHeader className="p-3 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{selected.name}</CardTitle>
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-2xs font-medium border capitalize ${statusBadge[selected.status]}`}>
                  {selected.status}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-3 text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-3 w-3" /> {selected.location}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Detail label="Model" value={selected.model} />
                <Detail label="IP" value={selected.ip} />
                <Detail label="Type" value={selected.type === "color" ? "Color" : "B&W"} />
                <Detail label="Total Prints" value={selected.totalPrints.toLocaleString()} />
              </div>
              <div className="space-y-2">
                <LevelBar label="Toner" value={selected.tonerLevel} />
                <LevelBar label="Paper" value={selected.paperLevel} />
              </div>
              <div className="pt-1 border-t">
                <span className="text-2xs text-muted-foreground">Last Maintenance</span>
                <div className="font-medium">{selected.lastMaintenance}</div>
              </div>
              <div className="border-t pt-3">
                <span className="text-2xs font-semibold text-primary uppercase tracking-wider">Recent Printer Logs</span>
                <div className="mt-2 space-y-2 max-h-[200px] overflow-y-auto pr-1">
                  {storage.getJobs()
                    .filter(j => j.printer_name === selected.name)
                    .slice(0, 5)
                    .map(job => (
                      <div key={job.id} className="p-2 bg-muted/30 rounded border border-border/50 text-[10px]">
                        <div className="font-medium truncate">{job.document_name}</div>
                        <div className="flex justify-between text-muted-foreground mt-1">
                          <span>User: {job.user_id}</span>
                          <span>{new Date(job.submitted_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  }
                  {storage.getJobs().filter(j => j.printer_name === selected.name).length === 0 && (
                    <div className="text-center py-4 text-muted-foreground italic">No jobs recorded yet</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-2xs text-muted-foreground">{label}</span>
      <div className="font-medium truncate">{value}</div>
    </div>
  );
}

function LevelBar({ label, value }: { label: string; value: number }) {
  const color = value > 50 ? "bg-success" : value > 20 ? "bg-warning" : "bg-destructive";
  return (
    <div>
      <div className="flex justify-between mb-0.5">
        <span className="text-2xs text-muted-foreground">{label}</span>
        <span className="text-2xs font-medium">{value}%</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
