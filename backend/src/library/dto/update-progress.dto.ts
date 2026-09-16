import { IsBoolean, IsInt, Min } from 'class-validator';

export class UpdateProgressDto {
  @IsInt()
  @Min(0)
  sceneIndex!: number;

  @IsBoolean()
  completed!: boolean;
}
