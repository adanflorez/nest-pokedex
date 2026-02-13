import { IsInt, IsPositive, IsString, Min, MinLength } from 'class-validator';

export class CreatePokemonDto {
  @MinLength(1)
  @IsString()
  readonly name!: string;

  @IsInt()
  @IsPositive()
  @Min(1)
  readonly no!: number;
}
