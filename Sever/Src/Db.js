const knexLib = require('knex');
const config = require('../../knexfile');
module.exports = knexLib(config.development);
