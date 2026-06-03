import { useState } from "react";
import { Link } from "wouter";
import { format } from "date-fns";
import { Search, Calendar, Globe, MonitorSmartphone } from "lucide-react";
import { useGetSearchHistory } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function History() {
  const [search, setSearch] = useState("");
  const { data: history, isLoading } = useGetSearchHistory({ limit: 100 });

  const filteredHistory = history?.filter((item) => 
    item.domain.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 max-w-4xl min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Search History</h1>
          <p className="text-muted-foreground">Your recent domain lookups and intelligence requests.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Filter domains..." 
            className="pl-9 bg-background/50 backdrop-blur"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="bg-card/50 backdrop-blur shadow-sm border-border/50">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="divide-y divide-border/50">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="p-4 sm:p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div>
                      <Skeleton className="h-5 w-40 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-20 rounded-md" />
                </div>
              ))}
            </div>
          ) : filteredHistory && filteredHistory.length > 0 ? (
            <div className="divide-y divide-border/50">
              {filteredHistory.map((item) => (
                <Link 
                  key={item.id} 
                  href={`/whois/${item.domain}`}
                  className="p-4 sm:p-6 flex items-center justify-between hover:bg-muted/50 transition-colors group block"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg text-primary">
                      <Globe className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-mono font-bold text-lg group-hover:text-primary transition-colors">
                        {item.domain}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(item.searchedAt), "MMM d, yyyy HH:mm")}
                        </span>
                        {item.ipAddress && (
                          <span className="flex items-center gap-1">
                            <MonitorSmartphone className="h-3 w-3" />
                            {item.ipAddress}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Badge variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity bg-background">
                    View
                  </Badge>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">No history found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {search ? "No domains matched your search criteria." : "You haven't searched for any domains yet."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
