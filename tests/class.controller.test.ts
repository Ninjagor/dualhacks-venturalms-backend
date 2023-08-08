import request from 'supertest';
import { describe, it, expect } from '@jest/globals';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mock the behavior of prisma.class.findMany
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    class: {
      findMany: jest.fn().mockResolvedValue([
        {
          name: 'Class 1',
          description: 'Description 1',
          classAdministratorId: '1234',
        },
        {
          name: 'Class 2',
          description: 'Description 2',
          classAdministratorId: '1234',
        },
      ]),
    },
  })),
}));

describe('ClassController', () => {
  it('should return all classes', async () => {
    const response = await request(app)
        .get('/classesasstudent')
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    for (const classObj of response.body) {
      expect(classObj.id).toBeDefined();
      expect(classObj.name).toBeDefined();
      expect(classObj.description).toBeDefined();
      expect(classObj.classAdministratorId).toBeDefined();
    }
  });
});