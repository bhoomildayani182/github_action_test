import { DatabaseMiddleware } from './database.middleware';

describe('DatabaseMiddleware', () => {
  it('should be defined', () => {
    expect(new DatabaseMiddleware()).toBeDefined();
  });
});
