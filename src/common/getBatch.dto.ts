import { IsDefined, IsOptional, IsEmpty } from 'class-validator';
import { Transform } from 'class-transformer';
export class GetBatchDto {
  @IsOptional()
  @Transform(l => parseInt(l))
  lastVisible: number;

  @IsDefined()
  @Transform(l => parseInt(l))
  limit: number;
}
