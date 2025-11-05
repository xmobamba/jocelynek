import 'dotenv/config';

const {
  DB_HOST,
  DB_PORT,
  DB_DATABASE,
  DB_USER,
  DB_PASSWORD
} = process.env;

const shared = {
  client: 'mysql2',
  connection: {
    host: DB_HOST,
    port: DB_PORT,
    database: DB_DATABASE,
    user: DB_USER,
    password: DB_PASSWORD,
    timezone: 'Z',
    dateStrings: true
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    tableName: 'migrations'
  }
};

export default {
  development: shared,
  production: shared,
  test: {
    ...shared,
    connection: {
      ...shared.connection,
      database: `${DB_DATABASE}_test`
    }
  }
};
