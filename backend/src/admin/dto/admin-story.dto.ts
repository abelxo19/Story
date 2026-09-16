import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { StoryStatus } from '@prisma/client';

export class UpsertStoryDto {
  @IsString()
  @MinLength(2)
  title!: string;

  @IsString()
  @MinLength(2)
  slug!: string;

  @IsString()
  @MinLength(8)
  description!: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  sourceUrl?: string;

  @IsOptional()
  @IsEnum(StoryStatus)
  status?: StoryStatus;
}

export class UpsertSceneDto {
  @IsString()
  @MinLength(2)
  title!: string;

  @IsString()
  @MinLength(8)
  text!: string;

  @IsString()
  imageUrl!: string;
}

export class ReorderScenesDto {
  @IsArray()
  @IsString({ each: true })
  ids!: string[];
}
