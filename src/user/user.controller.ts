import {
  Body,
  Controller,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from './dto/create-user-dto';
import { ApiBearerAuth } from '@nestjs/swagger';
@Controller('user')
export class UserController {
  private userService: UserService;
  constructor(userService: UserService) {
    this.userService = userService;
  }
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Post('/save-user')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  saveUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.addUser(createUserDto);
  }
}
