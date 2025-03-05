import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from './database.service';
import { ConfigService } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';

describe('DatabaseService', () => {
  let service: DatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key) => {
              if (key === 'database.defaultDatabase') {
                return 'test_db';
              }
              return null;
            }),
          },
        },
        {
          provide: REQUEST,
          useValue: { dbName: 'mock_db' }, // Mock request object
        },
        DatabaseService,
      ],
    }).compile();

    service = await module.resolve<DatabaseService>(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should use the database name from the request object', () => {
    expect(service['databaseName']).toBe('mock_db'); // Ensure dbName is set correctly
  });
});
