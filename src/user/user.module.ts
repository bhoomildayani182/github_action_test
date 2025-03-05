import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { DatabaseModule } from 'src/database/database.module';
import { DatabaseService } from 'src/database/database.service';

@Module({
  controllers: [UserController],
  providers: [UserService, DatabaseService],
  exports: [UserService],
  imports: [TypeOrmModule.forFeature([User]), DatabaseModule],
})
export class UserModule {}
