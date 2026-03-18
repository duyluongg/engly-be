// jwt.strategy.ts — "Người giải mã token"
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma.service';

// (1) Payload bên trong JWT token sẽ có dạng:
//     { sub: "user-id-123", email: "test@test.com", role: "USER" }
interface JwtPayload {
  sub: string;    // sub = subject = userId
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    // (2) Cấu hình Strategy: lấy token từ đâu? Dùng secret nào để giải mã?
    super({
      // Lấy token từ header: "Authorization: Bearer <token>"
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // Nếu token hết hạn → tự động reject (401)
      ignoreExpiration: false,

      // Dùng JWT_SECRET trong .env để verify token
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  // (3) Hàm này chạy SAU KHI token đã được giải mã thành công
  //     payload = dữ liệu bên trong token
  //     Return value sẽ được gắn vào request.user
  async validate(payload: JwtPayload) {
    // Kiểm tra user có tồn tại trong DB không (phòng trường hợp user bị xóa)
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User không tồn tại');
    }

    // Trả về object này → NestJS gắn vào request.user
    // Controller có thể truy cập: request.user.userId, request.user.email, ...
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
