import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CourseType } from '../generated/prisma/client';

@Injectable()
export class CourseService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lấy danh sách courses theo loại (IELTS / TOEIC)
   */
  async getCoursesByType(courseType: CourseType) {
    const courses = await this.prisma.course.findMany({
      where: {
        courseType,
        isPublished: true,
      },
      include: {
        _count: { select: { units: true } },
      },
      orderBy: [{ level: 'asc' }, { order: 'asc' }],
    });

    return courses.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      courseType: course.courseType,
      skillType: course.skillType,
      thumbnail: course.thumbnail,
      level: course.level,
      isPremium: course.isPremium,
      order: course.order,
      totalUnits: course._count.units,
    }));
  }

  /**
   * Chi tiết 1 course (kèm units & lessons)
   */
  async getCourseDetail(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        units: {
          where: { isPublished: true },
          orderBy: { order: 'asc' },
          include: {
            lessons: { orderBy: { order: 'asc' } },
            _count: { select: { exercises: true } },
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  /**
   * Đăng ký học course (tạo UserProgress)
   */
  async enrollCourse(userId: string, courseId: string) {
    // Kiểm tra course tồn tại và đã publish
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course || !course.isPublished) {
      throw new NotFoundException('Course not found or not published');
    }

    // Kiểm tra đã enroll chưa
    const existing = await this.prisma.userProgress.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    });

    if (existing) {
      throw new ConflictException('You have already enrolled in this course');
    }

    // Tạo UserProgress
    const progress = await this.prisma.userProgress.create({
      data: { userId, courseId },
    });

    return {
      message: 'Enrolled successfully',
      progress,
    };
  }

  /**
   * Danh sách courses đã đăng ký của user + tiến độ
   */
  async getMyCourses(userId: string) {
    const progresses = await this.prisma.userProgress.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            _count: { select: { units: true } },
          },
        },
      },
      orderBy: { lastAccessedAt: 'desc' },
    });

    return progresses.map((p) => ({
      courseId: p.courseId,
      title: p.course.title,
      courseType: p.course.courseType,
      skillType: p.course.skillType,
      thumbnail: p.course.thumbnail,
      level: p.course.level,
      totalUnits: p.course._count.units,
      completedUnits: p.completedUnits,
      completedLessons: p.completedLessons,
      progressPercent: p.progressPercent,
      totalScore: p.totalScore,
      lastAccessedAt: p.lastAccessedAt,
    }));
  }
}
