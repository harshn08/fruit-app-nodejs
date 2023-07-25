/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
 await knex.schema.raw("CREATE TABLE IF NOT EXISTS fruit(id varchar(100) PRIMARY KEY , name varchar(100), quantity varchar(11) null, description varchar(200) null)");
 await knex.schema.raw("CREATE TABLE IF NOT EXISTS fruitoutbox(id varchar(100) PRIMARY KEY , name varchar(100), quantity varchar(11) null, description varchar(200) null)");
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {};
