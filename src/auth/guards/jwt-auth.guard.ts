// jwt-auth.guard.ts — "Nhân viên bảo vệ"
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// AuthGuard('jwt') sẽ tự động:
// 1. Tìm JWT Strategy (vì ta đã đăng ký ở trên)
// 2. Gọi JwtStrategy.validate()
// 3. Nếu validate() thành công → cho request đi tiếp
// 4. Nếu thất bại → trả 401 Unauthorized

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
