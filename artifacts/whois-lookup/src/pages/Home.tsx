import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Globe, Clock, ArrowRight, ShieldCheck, Activity } from "lucide-react";
import { useGetSearchHistory, useGetPopularSearches } from "@workspace/api-client-react";
import { DomainSearch } from "@/components/DomainSearch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const { data: history, isLoading: historyLoading } = useGetSearchHistory({ limit: 5 });
  const { data: popular, isLoading: popularLoading } = useGetPopularSearches();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-background pt-24 pb-32">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px] pointer-events-none" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[800px] h-[400px] bg-primary/20 blur-[120px] rounded-full opacity-50" />
        </div>
        
        <div className="container relative z-10 mx-auto px-4 md:px-6 flex flex-col items-center text-center">
          <Badge variant="outline" className="mb-6 bg-background/50 backdrop-blur-sm border-primary/20 text-primary">
            <Activity className="w-3 h-3 mr-2" />
            Premium Domain Intelligence
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl text-balance">
            Uncover the identity behind any <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/50">domain</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl text-balance">
            Instant WHOIS lookups, DNS record analysis, and TLD availability checks. 
            Built for developers, investors, and security professionals.
          </p>
          
          <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <DomainSearch size="lg" />
          </div>
          
          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Real-time Data</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              <span>Global DNS Check</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>Historic Lookups</span>
            </div>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="container mx-auto px-4 md:px-6 py-16 grid md:grid-cols-2 gap-8">
        
        {/* Recent History */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Recent Lookups</h2>
            <Link href="/history" className="text-sm text-primary flex items-center hover:underline group">
              View all <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          
          <Card className="bg-card/50 backdrop-blur border-border/50 shadow-sm">
            <CardContent className="p-0 divide-y divide-border/50">
              {historyLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="p-4 flex items-center justify-between">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))
              ) : history && history.length > 0 ? (
                history.map((item) => (
                  <Link 
                    key={item.id} 
                    href={`/whois/${item.domain}`}
                    className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded text-primary">
                        <Globe className="w-4 h-4" />
                      </div>
                      <span className="font-mono font-medium group-hover:text-primary transition-colors">{item.domain}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(item.searchedAt), { addSuffix: true })}
                    </span>
                  </Link>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  No recent searches found.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Popular TLDs */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-6">Popular Extensions</h2>
          <div className="grid grid-cols-2 gap-4">
            {popularLoading ? (
              Array(6).fill(0).map((_, i) => (
                <Card key={i} className="bg-card/50 backdrop-blur border-border/50 shadow-sm">
                  <CardContent className="p-4 flex items-center justify-between">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-6 w-8 rounded-full" />
                  </CardContent>
                </Card>
              ))
            ) : popular && popular.length > 0 ? (
              popular.map((item) => (
                <Link key={item.domain} href={`/whois/${item.domain}`}>
                  <Card className="bg-card/50 backdrop-blur border-border/50 shadow-sm hover:border-primary/50 transition-colors cursor-pointer group">
                    <CardContent className="p-4 flex items-center justify-between">
                      <span className="font-mono font-semibold text-lg group-hover:text-primary transition-colors">
                        {item.domain}
                      </span>
                      <Badge variant="secondary" className="font-mono bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        {item.count.toLocaleString()}
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-2 p-8 text-center text-muted-foreground border rounded-xl border-dashed">
                No popular searches data available.
              </div>
            )}
          </div>
        </div>

      </section>
    </div>
  );
}
