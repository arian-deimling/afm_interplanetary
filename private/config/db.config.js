'use strict';

// TODO(AD) - update DB info
module.exports = {
  HOST: 'localhost',
  PORT: 3306,
  USER: `${process.env.DB_USER}`,
  PASSWORD: `${process.env.DB_PASS}`,
  DB: 'afm_interplanetary',
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};
