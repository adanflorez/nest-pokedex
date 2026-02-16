import { IsOptional, IsPositive, Min } from 'class-validator';

export class PaginateDto {
  @IsOptional()
  @IsPositive()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsPositive()
  offset?: number;
}
