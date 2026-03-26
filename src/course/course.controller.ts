import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CourseService } from './course.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/types/auth-user.type';
import { CourseType } from '../generated/prisma/client';

@ApiTags('Courses')
@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách courses theo loại (IELTS / TOEIC)' })
  @ApiQuery({ name: 'type', enum: CourseType, required: true })
  getCourses(@Query('type') type: CourseType) {
    return this.courseService.getCoursesByType(type);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xem các courses đã đăng ký + tiến độ' })
  getMyCourses(@CurrentUser() user: AuthUser) {
    return this.courseService.getMyCourses(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết 1 course (units & lessons)' })
  getCourseDetail(@Param('id') id: string) {
    return this.courseService.getCourseDetail(id);
  }

  @Post(':id/enroll')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Đăng ký học 1 course' })
  enrollCourse(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.courseService.enrollCourse(user.userId, id);
  }
}
