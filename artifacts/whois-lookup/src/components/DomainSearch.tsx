import { useState } from "react";
import { useLocation } from "wouter";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDomain } from "@/lib/utils";

interface DomainSearchProps {
  initialValue?: string;
  size?: "default" | "lg";
}

export function DomainSearch({ initialValue = "", size = "default" }: DomainSearchProps) {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const domain = formatDomain(query);
    if (domain) {
      setLocation(`/whois/${domain}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto flex items-center">
      <div className="relative w-full flex items-center">
        <Search className={`absolute left-4 text-muted-foreground ${size === "lg" ? "w-5 h-5" : "w-4 h-4"}`} />
        <Input
          type="text"
          placeholder="Enter a domain, e.g., google.com"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`w-full pl-11 pr-24 ${
            size === "lg" ? "h-14 text-lg rounded-xl shadow-lg border-2 bg-background/50 backdrop-blur-md" : "h-10 rounded-md"
          }`}
          data-testid="input-domain-search"
        />
        <Button 
          type="submit" 
          size={size === "lg" ? "default" : "sm"}
          className={`absolute right-1 ${size === "lg" ? "h-12 px-6 rounded-lg font-medium" : "h-8"}`}
          data-testid="button-search-submit"
        >
          Lookup
        </Button>
      </div>
    </form>
  );
}
