const pool = require('../utils/pool');

module.exports = class Todo {
  id;
  description;
  completed;
  user_id;

  constructor(row) {
    this.id = row.id;
    this.description = row.description;
    this.completed = row.completed;
    this.user_id = row.user_id;
  }

  static async insert({ description, completed, user_id }) {
    const { rows } = await pool.query(
      `
      INSERT INTO todos (description, completed, user_id)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [description, completed, user_id]
    );
  
    return new Todo(rows[0]);
  }

  static async getAllTodos(user_id) {
    const { rows } = await pool.query(
      'SELECT * FROM todos WHERE user_id = $1', 
      [user_id]
    );
    return rows.map((todo) => new Todo(todo));
  }

  static async getById(id) {
    const { rows } = await pool.query(
      `SELECT * FROM todos
      WHERE id=$1`,
      [id]
    );
    if (!rows[0]) {
      return null;
    }
    return new Todo(rows[0]);
  }

  static async updateById(id, attrs) {
    const todo = await Todo.getById(id);
    if (!todo) return null;
    const { description, completed } = { ...todo, ...attrs };
    const { rows } = await pool.query(
      `
      UPDATE todos
      SET description=$2, completed=$3
      WHERE id=$1 RETURNING *
      `,
      [id, description, completed]
    );
    return new Todo(rows[0]);
  }
};
