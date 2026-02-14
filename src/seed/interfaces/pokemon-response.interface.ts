export type PokemonListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: { name: string; no: number; url: string }[];
};
