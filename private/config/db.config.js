// TODO(AD) - update DB info
module.exports = {
  HOST: 'localhost',
  PORT: 3306,
  USER: 'assignment4',
  PASSWORD: '1234567890',
  DB: 'afm_interplanetary',
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};
