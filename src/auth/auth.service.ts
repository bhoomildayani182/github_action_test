import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user-dto';

@Injectable()
export class AuthService {
  public userService: UserService;
  private jwtService: JwtService;
  constructor(userService: UserService, jwtService: JwtService) {
    this.userService = userService;
    this.jwtService = jwtService;
  }

  async validateUser(username: string, password: string) {
    const user = await this.userService.findByUsername(username);

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials'); // Avoid null password comparison
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return null;
  }

  async login(loginUserDto: LoginUserDto) {
    const { username, password } = loginUserDto;
    const user = await this.userService.findByUsername(username);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials'); // Avoid null password comparison
    }
    const hash = user.password.replace(/^\$2y\$/, '$2b$');
    const isMatch = await bcrypt.compare(password.trim(), hash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { sub: user.code, username: user.username };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
