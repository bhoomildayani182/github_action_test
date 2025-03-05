import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseService } from './database/database.service';
import { REQUEST } from '@nestjs/core';
import { DatabaseMiddleware } from './database/database.middleware';
import { UserController } from './user/user.controller';
import { DatabaseModule } from './database/database.module';
import databaseConfig from './config/database.config';
import { Request } from 'express';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true, // Enable .env file globally
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService, REQUEST],
      useFactory: async (configService: ConfigService, req: Request) => {
        const dbName =
          req['dbName'] || configService.get('database.defaultDatabase');
        return {
          type: 'mysql',
          host: configService.get('database.host'),
          port: configService.get('database.port'),
          username: configService.get('database.user'),
          password: configService.get('database.password'),
          database: dbName, // Use dynamic database name
          // entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          autoLoadEntities: true,
          synchronize: false,
        };
      },
    }),
    UserModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService, DatabaseService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(DatabaseMiddleware).forRoutes(UserController);
  }
}
