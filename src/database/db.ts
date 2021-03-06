import { Pool } from 'better-sqlite-pool';
import { config } from '../config';

const pool = new Pool(config.dbFilePath);

type SQLParam = string | number;

export async function get<T>(sql: string, params: SQLParam[] = []) {
  const db = await pool.acquire();
  const stmt = db.prepare(sql);
  const result = (await stmt.get(...params)) as T;
  db.release();
  return result;
}

export async function all<T>(sql: string, params: SQLParam[] = []) {
  const db = await pool.acquire();
  const stmt = db.prepare(sql);
  const result = (await stmt.all(...params)) as T[];
  db.release();
  return result;
}

export async function run(sql: string, params: SQLParam[] = []) {
  const db = await pool.acquire();
  const stmt = db.prepare(sql);
  const result = await stmt.run(...params);
  db.release();
  return result;
}

export async function exec(sql: string) {
  const db = await pool.acquire();
  db.exec(sql);
  db.release();
}
