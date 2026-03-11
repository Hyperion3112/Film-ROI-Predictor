import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'film_data.db');

export function getDbConnection() {
    return new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            console.error('Error connecting to database', err.message);
        }
    });
}

export function query(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
        const db = getDbConnection();
        db.all(sql, params, (err, rows) => {
            db.close();
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}
