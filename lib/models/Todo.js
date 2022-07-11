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
};
