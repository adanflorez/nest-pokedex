import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MongoServerError } from 'mongodb';
import { InsertManyOptions, isValidObjectId, Model } from 'mongoose';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    try {
      const options: InsertManyOptions = {
        ordered: false, // si uno falla, sigue con los demás
        rawResult: true, // te devuelve info del write result
      };
      const pokemon = {
        name: createPokemonDto.name.toLocaleLowerCase(),
        no: createPokemonDto.no,
      };
      const pokemonSaved = await this.pokemonModel.create(pokemon, options);
      return pokemonSaved;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async createMany(createPokemonDto: CreatePokemonDto[]) {
    try {
      const pokemons = createPokemonDto.map((pokemon) => ({
        name: pokemon.name.toLocaleLowerCase(),
        no: pokemon.no,
      }));
      const pokemonsSaved = await this.pokemonModel.insertMany(pokemons);
      return pokemonsSaved;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(term: string) {
    let pokemon: Pokemon | null;

    // Buscar por número
    if (!isNaN(+term)) {
      pokemon = await this.pokemonModel.findOne({ no: +term });
      if (pokemon) return pokemon;
    }

    // Buscar por MongoID
    if (isValidObjectId(term)) {
      pokemon = await this.pokemonModel.findById(term);
      if (pokemon) return pokemon;
    }

    // Buscar por nombre
    pokemon = await this.pokemonModel.findOne({
      name: term.toLowerCase(),
    });

    if (!pokemon) {
      throw new NotFoundException(
        `Pokemon with id, name or no "${term}" not found`,
      );
    }

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    try {
      const pokemonModel = await this.findOne(`${term}`);
      const currentPokemon: UpdatePokemonDto = {
        ...updatePokemonDto,
        name: updatePokemonDto?.name?.toLocaleLowerCase(),
      };
      await pokemonModel.updateOne(currentPokemon);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return { ...pokemonModel.toJSON(), ...updatePokemonDto };
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async remove(id: string) {
    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });
    if (deletedCount === 0) {
      throw new BadRequestException(`Pokemon with id "${id}" not found`);
    }
  }

  async removeAll() {
    const result = await this.pokemonModel.deleteMany({});
    return result;
  }

  private handleExceptions(error: unknown) {
    if (error instanceof MongoServerError && error.code === 11000) {
      throw new BadRequestException(
        `Pokemon already exists in database - ${JSON.stringify(error.keyValue)}`,
      );
    }
    throw new InternalServerErrorException(
      `Check server logs - ${String(error)}`,
    );
  }
}
