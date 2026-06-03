import { useRoute } from "wouter";
import { format } from "date-fns";
import { ShieldAlert, ShieldCheck, Copy, ExternalLink, Calendar, MapPin, Globe, Server, Hash } from "lucide-react";
import { useGetWhois, useGetDns, useGetDomainAvailability, getGetWhoisQueryKey, getGetDnsQueryKey, getGetDomainAvailabilityQueryKey } from "@workspace/api-client-react";
import { formatAge } from "@/lib/utils";
import { DomainSearch } from "@/components/DomainSearch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

export default function WhoisResults() {
  const [, params] = useRoute("/whois/:domain");
  const domain = params?.domain || "";
  const { toast } = useToast();

  const { data: whois, isLoading: whoisLoading, isError: whoisError } = useGetWhois(domain, { 
    query: { enabled: !!domain, queryKey: getGetWhoisQueryKey(domain) } 
  });
  
  const { data: dns, isLoading: dnsLoading } = useGetDns(domain, { 
    query: { enabled: !!domain, queryKey: getGetDnsQueryKey(domain) } 
  });
  
  const { data: availability, isLoading: availabilityLoading } = useGetDomainAvailability(domain, { 
    query: { enabled: !!domain, queryKey: getGetDomainAvailabilityQueryKey(domain) } 
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `${label} has been copied.`,
    });
  };

  const isRegistered = !!whois?.createdDate || (whois?.status && whois.status.length > 0);

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 flex flex-col gap-8 min-h-[calc(100vh-4rem)]">
      {/* Header Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-mono">{domain}</h1>
          <p className="text-muted-foreground mt-1">Domain Intelligence Report</p>
        </div>
        <div className="w-full md:w-auto md:min-w-[400px]">
          <DomainSearch initialValue={domain} />
        </div>
      </div>

      {whoisError ? (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center text-center py-8">
              <ShieldAlert className="h-12 w-12 text-destructive mb-4" />
              <h2 className="text-xl font-semibold mb-2">Could not retrieve WHOIS data</h2>
              <p className="text-muted-foreground">The domain might be invalid, or the registry is not responding.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="whois" className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-3 mb-6 bg-muted/50 border">
            <TabsTrigger value="whois" className="font-medium">WHOIS Data</TabsTrigger>
            <TabsTrigger value="dns" className="font-medium">DNS Records</TabsTrigger>
            <TabsTrigger value="availability" className="font-medium">Availability</TabsTrigger>
          </TabsList>

          {/* WHOIS TAB */}
          <TabsContent value="whois" className="space-y-6">
            {whoisLoading ? (
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  <Skeleton className="h-[300px] w-full rounded-xl" />
                  <Skeleton className="h-[400px] w-full rounded-xl" />
                </div>
                <div className="space-y-6">
                  <Skeleton className="h-[200px] w-full rounded-xl" />
                  <Skeleton className="h-[200px] w-full rounded-xl" />
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                
                {/* Main Details */}
                <div className="md:col-span-2 space-y-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                      <div>
                        <CardTitle>Registration Details</CardTitle>
                        <CardDescription>Primary WHOIS registry information</CardDescription>
                      </div>
                      {isRegistered ? (
                        <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20">Registered</Badge>
                      ) : (
                        <Badge variant="default" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20">Available</Badge>
                      )}
                    </CardHeader>
                    <CardContent className="grid sm:grid-cols-2 gap-6">
                      
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                            <Globe className="h-4 w-4" /> Registrar
                          </p>
                          <p className="font-medium">{whois?.registrar || "Not specified"}</p>
                          {whois?.registrarUrl && (
                            <a href={whois.registrarUrl} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline flex items-center mt-1">
                              {whois.registrarUrl} <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          )}
                        </div>

                        <div>
                          <p className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                            <MapPin className="h-4 w-4" /> Registrant Country
                          </p>
                          <p className="font-medium">{whois?.registrantCountry || "Redacted / Privacy Protected"}</p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                            <Hash className="h-4 w-4" /> Domain Age
                          </p>
                          <p className="font-medium">{formatAge(whois?.domainAge)}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                            <Calendar className="h-4 w-4" /> Registered On
                          </p>
                          <p className="font-medium font-mono text-sm">
                            {whois?.createdDate ? format(new Date(whois.createdDate), "PPP") : "Unknown"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                            <Calendar className="h-4 w-4" /> Expires On
                          </p>
                          <p className="font-medium font-mono text-sm">
                            {whois?.expiresDate ? format(new Date(whois.expiresDate), "PPP") : "Unknown"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                            <Calendar className="h-4 w-4" /> Last Updated
                          </p>
                          <p className="font-medium font-mono text-sm">
                            {whois?.updatedDate ? format(new Date(whois.updatedDate), "PPP") : "Unknown"}
                          </p>
                        </div>
                      </div>

                    </CardContent>
                  </Card>

                  {/* Raw WHOIS */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Raw WHOIS Record</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[400px] w-full rounded-md border bg-muted/30 p-4">
                        <pre className="text-xs font-mono whitespace-pre-wrap text-muted-foreground">
                          {whois?.rawText || "No raw WHOIS text available for this domain."}
                        </pre>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar Details */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Server className="h-5 w-5 text-primary" /> Nameservers
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {whois?.nameservers && whois.nameservers.length > 0 ? (
                        <ul className="space-y-3">
                          {whois.nameservers.map((ns, i) => (
                            <li key={i} className="flex justify-between items-center bg-muted/50 p-3 rounded-md border border-border/50">
                              <span className="font-mono text-sm break-all">{ns.toLowerCase()}</span>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => copyToClipboard(ns, "Nameserver")}>
                                <Copy className="h-4 w-4" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">No nameservers found.</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-primary" /> Domain Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {whois?.status && whois.status.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {whois.status.map((status, i) => {
                            // Extract just the status string before the URL if present
                            const statusStr = status.split(" ")[0];
                            return (
                              <Badge key={i} variant="secondary" className="font-mono text-xs py-1">
                                {statusStr}
                              </Badge>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No status codes found.</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

              </div>
            )}
          </TabsContent>

          {/* DNS TAB */}
          <TabsContent value="dns">
            <Card>
              <CardHeader>
                <CardTitle>DNS Records</CardTitle>
                <CardDescription>Live DNS resolution for {domain}</CardDescription>
              </CardHeader>
              <CardContent>
                {dnsLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : !dns ? (
                  <p className="text-muted-foreground text-center py-8">Could not resolve DNS records.</p>
                ) : (
                  <div className="space-y-8">
                    {Object.entries(dns).filter(([key]) => key !== 'domain').map(([type, records]) => {
                      const recs = records as any[];
                      if (!recs || recs.length === 0) return null;
                      
                      return (
                        <div key={type}>
                          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <Badge className="bg-primary/20 text-primary border-primary/30 hover:bg-primary/30">{type}</Badge> 
                            Records
                          </h3>
                          <div className="rounded-md border overflow-hidden">
                            <table className="w-full text-sm">
                              <thead className="bg-muted/50 border-b">
                                <tr>
                                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Value</th>
                                  {type === 'MX' && <th className="h-10 px-4 text-left font-medium text-muted-foreground w-24">Priority</th>}
                                  <th className="h-10 px-4 text-left font-medium text-muted-foreground w-24">TTL</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y">
                                {recs.map((record, i) => (
                                  <tr key={i} className="hover:bg-muted/30 transition-colors">
                                    <td className="p-4 font-mono">{record.value}</td>
                                    {type === 'MX' && <td className="p-4 font-mono text-muted-foreground">{record.priority || '-'}</td>}
                                    <td className="p-4 font-mono text-muted-foreground">{record.ttl || '-'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })}
                    
                    {Object.values(dns).filter(v => Array.isArray(v) && v.length > 0).length === 0 && (
                      <p className="text-muted-foreground text-center py-8 border rounded-lg border-dashed">No DNS records found for this domain.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* AVAILABILITY TAB */}
          <TabsContent value="availability">
            <Card>
              <CardHeader>
                <CardTitle>Global TLD Availability</CardTitle>
                <CardDescription>Check if variants of {domain} are registered</CardDescription>
              </CardHeader>
              <CardContent>
                {availabilityLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array(12).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-lg" />
                    ))}
                  </div>
                ) : !availability?.results ? (
                  <p className="text-muted-foreground text-center py-8">Could not check availability.</p>
                ) : (
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {availability.results.map((result) => (
                      <div 
                        key={result.tld} 
                        className={`flex flex-col p-4 rounded-xl border ${
                          result.available 
                            ? "bg-emerald-500/5 border-emerald-500/20" 
                            : "bg-destructive/5 border-destructive/20"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-lg font-mono">.{result.tld}</span>
                          <Badge variant={result.available ? "outline" : "destructive"} 
                                className={result.available ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" : "bg-destructive/10 text-destructive border-destructive/30"}>
                            {result.available ? "Available" : "Taken"}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground font-mono truncate" title={result.domain}>
                          {result.domain}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      )}
    </div>
  );
}
