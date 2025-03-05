import { Inject, Injectable, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import * as mysql from 'mysql2/promise';

@Injectable({ scope: Scope.REQUEST })
export class DatabaseService {
  private databaseName: string;
  private pool: mysql.Pool;
  private readonly configService: ConfigService;
  private readonly request: Request;

  constructor(@Inject(REQUEST) request: Request, configService: ConfigService) {
    this.request = request;
    this.configService = configService;
    this.databaseName =
      this.request['dbName'] ||
      configService.get<string>('database.defaultDatabase');
    this.createPool();
  }

  private createPool() {
    this.pool = mysql.createPool({
      host: this.configService.get<string>('database.host'),
      port: this.configService.get<number>('database.port'),
      user: this.configService.get<string>('database.user'),
      password: this.configService.get<string>('database.password'),
      database: this.databaseName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }

  async getConnection() {
    return this.pool.getConnection();
  }

  getDatabaseName() {
    return this.databaseName;
  }

  setDatabase(dbName: string) {
    this.databaseName = dbName;
    this.createPool();
  }
}
