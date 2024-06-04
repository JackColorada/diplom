const request = require('supertest');
const server = require('../server'); // Импортируйте HTTP сервер, а не приложение
const mysql = require('mysql');
const bcrypt = require('bcryptjs');

jest.mock('mysql', () => {
  const mConnection = {
    query: jest.fn(),
    connect: jest.fn(),
    end: jest.fn(),
  };
  const mMysql = {
    createConnection: jest.fn(() => mConnection),
  };
  return mMysql;
});

describe('API Tests', () => {
  let db;

  beforeAll(() => {
    db = mysql.createConnection();
  });

  afterAll(() => {
    db.end();
    server.close(); // Закрываем сервер после всех тестов
  });

  describe('POST /signup', () => {
    it('should register a new user', async () => {
      db.query.mockImplementation((query, values, callback) => {
        if (query.includes('SELECT * FROM Users WHERE `login` = ?')) {
          callback(null, []);
        } else if (query.includes('SELECT * FROM Users WHERE `email` = ?')) {
          callback(null, []);
        } else if (query.includes('INSERT INTO Users')) {
          callback(null, { insertId: 1 });
        }
      });

      const response = await request(server)
        .post('/signup')
        .send({ login: 'testuser', email: 'test@example.com', password: 'password123', class: 'A' });

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ success: true });
    });

    it('should not register a user with an existing login', async () => {
      db.query.mockImplementation((query, values, callback) => {
        if (query.includes('SELECT * FROM Users WHERE `login` = ?')) {
          callback(null, [{ id: 1, login: 'testuser' }]);
        }
      });

      const response = await request(server)
        .post('/signup')
        .send({ login: 'testuser', email: 'test2@example.com', password: 'password123', class: 'A' });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({ error: 'Логин уже существует' });
    });

    
  });

  describe('POST /login', () => {
    it('should authenticate a user with valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);

      db.query.mockImplementation((query, values, callback) => {
        if (query.includes('SELECT * FROM Users WHERE `login` = ?')) {
          callback(null, [{ id: 1, login: 'testuser', password: hashedPassword }]);
        }
      });

      const response = await request(server)
        .post('/login')
        .send({ login: 'testuser', password: 'password123' });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('user');
    });

    it('should not authenticate a user with invalid credentials', async () => {
      db.query.mockImplementation((query, values, callback) => {
        if (query.includes('SELECT * FROM Users WHERE `login` = ?')) {
          callback(null, []);
        }
      });

      const response = await request(server)
        .post('/login')
        .send({ login: 'invaliduser', password: 'password123' });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({ error: 'Пользователь с таким логином не найден' });
    });
  });

  describe('POST /tasks', () => {
    it('should create a new task', async () => {
      db.query.mockImplementation((query, values, callback) => {
        if (query.includes('INSERT INTO tasks')) {
          callback(null, { insertId: 1 });
        } else if (query.includes('SELECT * FROM tasks WHERE id = ?')) {
          callback(null, [{ id: 1, text: 'Test task', completed: false, start_date: '2024-05-31', end_date: '2024-06-01', user_id: 1, parent_id: null, important: 0 }]);
        }
      });

      const response = await request(server)
        .post('/tasks')
        .send({ text: 'Test task', completed: false, start_date: '2024-05-31', end_date: '2024-06-01', userId: 1, parentId: null, important: false });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message', 'Задача успешно добавлена');
      expect(response.body).toHaveProperty('task');
      expect(response.body.task).toHaveProperty('id', 1);
    });
  });

  describe('GET /tasks', () => {
    it('should get tasks for a user', async () => {
      db.query.mockImplementation((query, values, callback) => {
        if (query.includes('SELECT * FROM tasks WHERE user_id = ? AND ? >= start_date AND ? <= end_date')) {
          callback(null, [
            { id: 1, text: 'Test task', completed: false, start_date: '2024-05-31', end_date: '2024-06-01', user_id: 1, parent_id: null, important: 0 },
            { id: 2, text: 'Subtask', completed: false, start_date: '2024-05-31', end_date: '2024-06-01', user_id: 1, parent_id: 1, important: 0 }
          ]);
        }
      });

      const response = await request(server)
        .get('/tasks')
        .query({ userId: 1, selectedDate: '2024-05-31' });

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0]).toHaveProperty('subtasks');
      expect(response.body[0].subtasks.length).toBe(1);
    });
  });

    describe('DELETE /tasks/:id', () => {
    it('should delete a task', async () => {
      db.query.mockImplementation((query, values, callback) => {
        if (query.includes('DELETE FROM tasks WHERE id = ?')) {
          callback(null, { affectedRows: 1 });
        }
      });

      const response = await request(server).delete('/tasks/1');

      expect(response.statusCode).toBe(204);
    });
  });
});
