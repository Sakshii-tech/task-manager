// src/models/userModel.js
import { pool } from '../config/db.js';

export class UserModel {
  static async create({ name, email }) {
    console.log('Creating user:', { name, email });
    const result = await pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
    return result.rows[0];
  }

  static async getAll() {
    const result = await pool.query('SELECT * FROM users ORDER BY id');
    return result.rows;
  }

  static async getById(id) {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async update(id, { name, email }) {
    const result = await pool.query(
      'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *',
      [name, email, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }
}
