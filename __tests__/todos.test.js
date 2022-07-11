const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const UserService = require('../lib/services/UserService');
const Todo = require('../lib/models/Todo');

const mockUser = {
  email: 'test@test.com',
  password: '123123'
};
const mockUser2 = {
  firstName: 'Test',
  lastName: 'User 2',
  email: 'test2@example.com',
  password: '123456',
};

const registerAndLogin = async (userProps = {}) => {
  const password = userProps.password ?? mockUser.password;

  const agent = request.agent(app);

  const user = await UserService.create({ ...mockUser, ...userProps });

  const { email } = user;
  await agent.post('/api/v1/users/sessions').send({ email, password });
  return [agent, user];
};

describe('todos', () => {
  beforeEach(() => {
    return setup(pool);
  });

  it('creates a new todo for registered user', async () => {
    const [agent, user] = await registerAndLogin();
    const newTodo = { description: 'finish deliverable', completed: false };
    const res = await agent.post('/api/v1/todos').send(newTodo);

    expect(res.status).toEqual(200);
    expect(res.body).toEqual({
      id: expect.any(String),
      description: newTodo.description,
      user_id: user.id,
      completed: false
    });
  });

  it('gets todos for associated user', async () => {
    const [agent, user] = await registerAndLogin();
    const user2 = await UserService.create(mockUser2);
    const user1Todo = await Todo.insert({
      description: 'pass this test',
      completed: false,
      user_id: user.id
    });
    await Todo.insert({
      description: 'or this one',
      completed: false,
      user_id: user2.id
    });
    const res = await agent.get('/api/v1/todos');
    expect(res.status).toEqual(200);
    expect(res.body).toEqual([user1Todo]);
  });

  afterAll(() => {
    pool.end();
  });
});
