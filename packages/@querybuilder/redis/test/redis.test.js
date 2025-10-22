// Redis Tests - Comprehensive test suite
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import Redis from '../Redis.js';

describe('Redis QueryBuilder Tests', () => {
  let redis;

  beforeEach(() => {
    redis = new Redis({
      host: 'localhost',
      port: 6379,
      database: 0
    });
  });

  describe('Connection', () => {
    test('should create Redis instance', () => {
      expect(redis).toBeDefined();
      expect(redis.dataType).toBe('redis');
    });

    test('should generate connection command', () => {
      const result = redis.connect();
      expect(result.command).toContain('createClient');
      expect(result.command).toContain('localhost');
      expect(result.command).toContain('6379');
    });
  });

  describe('String Operations', () => {
    test('should generate SET command', () => {
      const result = redis.set('key1', 'value1');
      expect(result.command).toBe("client.set('key1', 'value1')");
    });

    test('should generate SET with expiration', () => {
      const result = redis.set('key1', 'value1', { EX: 3600 });
      expect(result.command).toBe("client.set('key1', 'value1', { EX: 3600 })");
    });

    test('should generate GET command', () => {
      const result = redis.get('key1');
      expect(result.command).toBe("client.get('key1')");
    });
  });

  describe('Hash Operations', () => {
    test('should generate HSET command', () => {
      const result = redis.hset('hash1', 'field1', 'value1');
      expect(result.command).toBe("client.hSet('hash1', 'field1', 'value1')");
    });

    test('should generate HGET command', () => {
      const result = redis.hget('hash1', 'field1');
      expect(result.command).toBe("client.hGet('hash1', 'field1')");
    });
  });

  describe('List Operations', () => {
    test('should generate LPUSH command', () => {
      const result = redis.lpush('list1', ['item1', 'item2']);
      expect(result.command).toBe("client.lPush('list1', ['item1', 'item2'])");
    });

    test('should generate RPUSH command', () => {
      const result = redis.rpush('list1', 'item1');
      expect(result.command).toBe("client.rPush('list1', ['item1'])");
    });
  });

  describe('QueryBuilder Compatibility', () => {
    test('should handle SELECT operation', () => {
      const result = redis.select({ key: 'test' });
      expect(result.command).toBe("client.get('test')");
    });

    test('should handle INSERT operation', () => {
      const result = redis.insert({ key: 'test', value: 'data' });
      expect(result.command).toContain("client.set('test', 'data')");
    });

    test('should handle DELETE operation', () => {
      const result = redis.delete({ key: 'test' });
      expect(result.command).toBe("client.del(['test'])");
    });
  });
});
