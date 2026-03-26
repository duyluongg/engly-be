import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CourseType } from '../../generated/prisma/client';

export class SelectCourseDto {
  @ApiProperty({ enum: CourseType, example: 'IELTS' })
  @IsEnum(CourseType)
  type: CourseType;
}
