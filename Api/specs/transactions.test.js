const supertest = require('supertest');
const app = require('../app');
const { mockData } = require('../db/mockDatabase');

const agent = supertest.agent(app);

// Snapshot the default seed transactions directly from mockData
const defaultTransactions = JSON.parse(JSON.stringify(mockData.transactions));

beforeEach(() => {
  mockData.transactions = JSON.parse(JSON.stringify(defaultTransactions));
});

describe('Transactions API', () => {
  describe('GET /transactions', () => {
    test('should return all transactions sorted by date descending', async () => {
      const res = await agent.get('/transactions').expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(defaultTransactions.length);

      // Verify date descending sort
      for (let i = 0; i < res.body.length - 1; i += 1) {
        const currentDate = new Date(res.body[i].date);
        const nextDate = new Date(res.body[i + 1].date);
        expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
      }
    });
  });

  describe('GET /transactions/:id', () => {
    test('should return a transaction by id', async () => {
      const sample = defaultTransactions[0];
      const res = await agent.get(`/transactions/${sample._id}`).expect(200);
      expect(res.body).toHaveProperty('_id', sample._id);
      expect(res.body).toHaveProperty('type', sample.type);
      expect(res.body).toHaveProperty('amount', sample.amount);
      expect(res.body).toHaveProperty('description', sample.description);
    });

    test('should return 404 if transaction is not found', async () => {
      await agent.get('/transactions/non-existent-id').expect(404);
    });
  });

  describe('POST /transactions', () => {
    test('should create a valid income transaction', async () => {
      const newTransaction = {
        type: 'income',
        amount: 2500,
        category: 'freelance',
        description: 'Web development contract',
        date: '2026-08-10'
      };

      const res = await agent.post('/transactions').send(newTransaction).expect(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.type).toBe(newTransaction.type);
      expect(res.body.amount).toBe(newTransaction.amount);
      expect(res.body.description).toBe(newTransaction.description);
      expect(res.body.category).toBe(newTransaction.category);
      expect(res.body.date).toBe(newTransaction.date);

      const listRes = await agent.get('/transactions').expect(200);
      expect(listRes.body.length).toBe(defaultTransactions.length + 1);
    });

    test('should create a valid expense transaction', async () => {
      const newTransaction = {
        type: 'expense',
        amount: 45.25,
        category: 'transport',
        description: 'Bus pass',
        date: '2026-08-11'
      };

      const res = await agent.post('/transactions').send(newTransaction).expect(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.type).toBe('expense');
      expect(res.body.amount).toBe(45.25);
    });

    test('should return 400 when required fields are missing', async () => {
      const invalidTransaction = {
        type: 'expense'
      };

      await agent.post('/transactions').send(invalidTransaction).expect(400);
    });

    test('should return 400 when type is invalid', async () => {
      const invalidTransaction = {
        type: 'invalid_type',
        amount: 50,
        category: 'food',
        description: 'Snacks',
        date: '2026-08-10'
      };

      await agent.post('/transactions').send(invalidTransaction).expect(400);
    });

    test('should return 400 when amount is less than 0.01', async () => {
      const invalidTransaction = {
        type: 'expense',
        amount: 0,
        category: 'food',
        description: 'Snacks',
        date: '2026-08-10'
      };

      await agent.post('/transactions').send(invalidTransaction).expect(400);
    });

    test('should return 400 when description is empty string', async () => {
      const invalidTransaction = {
        type: 'expense',
        amount: 50,
        category: 'food',
        description: '   ',
        date: '2026-08-10'
      };

      await agent.post('/transactions').send(invalidTransaction).expect(400);
    });

    test('should return 400 when extra unknown properties are provided', async () => {
      const invalidTransaction = {
        type: 'expense',
        amount: 50,
        category: 'food',
        description: 'Snacks',
        date: '2026-08-10',
        extraField: 'not_allowed'
      };

      await agent.post('/transactions').send(invalidTransaction).expect(400);
    });
  });

  describe('PATCH /transactions/:id', () => {
    test('should update transaction amount and description', async () => {
      const sample = defaultTransactions[1];
      const updates = {
        amount: 1350,
        description: 'Updated rent payment'
      };

      const res = await agent.patch(`/transactions/${sample._id}`).send(updates).expect(200);
      expect(res.body._id).toBe(sample._id);
      expect(res.body.amount).toBe(1350);
      expect(res.body.description).toBe('Updated rent payment');
      expect(res.body.type).toBe(sample.type);
    });

    test('should return 404 when updating a non-existent transaction', async () => {
      await agent.patch('/transactions/non-existent-id').send({ amount: 500 }).expect(404);
    });

    test('should return 400 when patch payload contains invalid type', async () => {
      const sample = defaultTransactions[0];
      await agent.patch(`/transactions/${sample._id}`).send({ type: 'invalid_type' }).expect(400);
    });
  });

  describe('DELETE /transactions/:id', () => {
    test('should delete an existing transaction', async () => {
      const sample = defaultTransactions[2];
      await agent.delete(`/transactions/${sample._id}`).expect(200);

      await agent.get(`/transactions/${sample._id}`).expect(404);

      const listRes = await agent.get('/transactions').expect(200);
      expect(listRes.body.length).toBe(defaultTransactions.length - 1);
    });

    test('should return 404 when deleting a non-existent transaction', async () => {
      await agent.delete('/transactions/non-existent-id').expect(404);
    });
  });
});
