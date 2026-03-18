// current-user.decorator.ts — Decorator tiện ích lấy user từ request
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Thay vì viết: @Req() req → rồi lấy req.user
// Ta tạo decorator @CurrentUser() cho gọn:
//
// Cách dùng trong controller:
//   @Get('profile')
//   getProfile(@CurrentUser() user) {
//     console.log(user.userId, user.email, user.role);
//   }

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; // Đây là object trả về từ JwtStrategy.validate()
  },
);
