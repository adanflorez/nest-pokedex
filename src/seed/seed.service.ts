import { Injectable } from '@nestjs/common';
import { PokemonListResponse } from './interfaces';
import { PokemonService } from 'src/pokemon/pokemon.service';

@Injectable()
export class SeedService {
  constructor(private readonly pokemonService: PokemonService) {}

  async execute() {
    await this.pokemonService.removeAll();

    const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=650');
    if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);

    const data = (await res.json()) as PokemonListResponse;
    const pokemonsSeed = data.results.map(({ name, url }) => {
      const no = url.split('/').slice(-2, -1)[0];
      return { name, no: +no };
    });

    const result = await this.pokemonService.createMany(pokemonsSeed);

    return result;
  }
}
