import { useEffect, useRef, useState } from "react";
import { categories } from "./data";
export type ListingState = {
  query: string;
  category: string;
  sort: string;
  page: number;
  filters: Record<string, string[]>;
  band: string;
};
const filterValues: Record<string, string[]> = {
  colour: ["Green", "Cream", "Black", "Blue"],
  orientation: ["Horizontal", "Vertical"],
  theme: ["Minimal", "Bold & Colourful", "Elegant"],
  industry: [
    "Arts & Design",
    "Professional Services",
    "Beauty & Spa",
    "Food & Beverage",
  ],
};
export function readListing(search: string, mode: string): ListingState {
  const p = new URLSearchParams(search);
  const filters: Record<string, string[]> = {};
  for (const [key, values] of Object.entries(filterValues)) {
    const selected = p.getAll(`f.${key}`).filter((v) => values.includes(v));
    if (selected.length) filters[key] = [...new Set(selected)];
  }
  const page = Number(p.get("page") || 1);
  return {
    query: (p.get(mode === "gallery" ? "designQ" : "q") || "").slice(0, 200),
    category: categories.some((c) => c.id === p.get("category"))
      ? p.get("category")!
      : "all",
    sort: ["featured", "newest", "name", "low", "high", "relevance"].includes(
      p.get("sort") || "",
    )
      ? p.get("sort")!
      : "featured",
    page: Number.isInteger(page) && page >= 1 && page <= 1000 ? page : 1,
    filters,
    band: ["under500", "from500"].includes(p.get("band") || "")
      ? p.get("band")!
      : "all",
  };
}
export function writeListing(
  search: string,
  state: ListingState,
  mode: string,
) {
  const p = new URLSearchParams(search);
  const queryKey = mode === "gallery" ? "designQ" : "q";
  for (const key of [
    queryKey,
    "category",
    "sort",
    "page",
    "band",
    ...Object.keys(filterValues).map((k) => `f.${k}`),
  ])
    p.delete(key);
  if (state.query) p.set(queryKey, state.query);
  if (state.category !== "all") p.set("category", state.category);
  if (!["featured", "relevance"].includes(state.sort))
    p.set("sort", state.sort);
  if (state.page > 1) p.set("page", String(state.page));
  if (state.band !== "all") p.set("band", state.band);
  for (const [key, values] of Object.entries(state.filters))
    for (const value of values)
      if (filterValues[key]?.includes(value)) p.append(`f.${key}`, value);
  return p.toString();
}
export function useListingState(mode: string) {
  const [state, setState] = useState(() => readListing(location.search, mode));
  const ref = useRef(state);
  ref.current = state;
  useEffect(() => {
    const pop = () => {
      const next = readListing(location.search, mode);
      ref.current = next;
      setState(next);
    };
    window.addEventListener("popstate", pop);
    return () => window.removeEventListener("popstate", pop);
  }, [mode]);
  const update = (patch: Partial<ListingState>) => {
    const next = { ...ref.current, ...patch };
    ref.current = next;
    setState(next);
    const query = writeListing(location.search, next, mode);
    history.pushState(null, "", location.pathname + (query ? `?${query}` : ""));
  };
  return [state, update] as const;
}
