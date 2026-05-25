"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Props = {
  placeholder?: string;
  initialQuery?: string;
};

export function SearchBar({
  placeholder = "write a prompt and see recommended skills",
  initialQuery = "",
}: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    // placeholder route. /search isn't built yet, but the query string is the
    // contract the founder will wire to /api/search.
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full flex flex-col gap-3 sm:flex-row"
      role="search"
      aria-label="search skills"
    >
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-500"
          aria-hidden="true"
        />
        <Input
          name="q"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="h-14 pl-11 pr-4 text-base bg-zinc-950 border-zinc-800 placeholder:text-zinc-500 focus-visible:border-zinc-600 focus-visible:ring-zinc-700"
          aria-label="search query"
        />
      </div>
      <Button
        type="submit"
        size="lg"
        className="h-14 px-6 bg-white text-black hover:bg-zinc-200 font-medium"
      >
        search
      </Button>
    </form>
  );
}
