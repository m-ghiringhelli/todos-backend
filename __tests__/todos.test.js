const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const UserService = require('../lib/services/UserService');

const mockUser = {
  email: 'test@test.com',
  password: '123123'
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
    const newTodo = { description: 'finish deliverable' };
    const res = await agent.post('/api/v1/todos').send(newTodo);
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({
      id: expect.any(String),
      description: newTodo.description,
      user_id: user.id,
      completed: false
    });
  });

  afterAll(() => {
    pool.end();
  });
});
