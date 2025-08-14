exports.up = async function(knex) {
  await knex.raw('create extension if not exists pgcrypto');

  await knex.schema.createTable('users', t => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('email').notNullable().unique();
    t.string('password_hash').notNullable();
    t.string('name');
    t.boolean('is_admin').defaultTo(false);
    t.bigInteger('balance').defaultTo(0);
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('ads', t => {
    t.string('id').primary();
    t.string('title');
    t.integer('reward').notNullable();
    t.integer('duration').notNullable();
    t.integer('daily_limit').defaultTo(1000);
    t.boolean('active').defaultTo(true);
    t.integer('impressions').defaultTo(0);
  });

  await knex.schema.createTable('ad_views', t => {
    t.bigIncrements('id').primary();
    t.uuid('user_id').references('id').inTable('users');
    t.string('ad_id').references('id').inTable('ads');
    t.timestamp('viewed_at').defaultTo(knex.fn.now());
    t.integer('rewarded').defaultTo(0);
    t.string('ip');
    t.string('user_agent');
  });

  await knex.schema.createTable('withdraw_requests', t => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('user_id').references('id').inTable('users');
    t.bigInteger('amount');
    t.bigInteger('fee');
    t.bigInteger('net');
    t.string('method');
    t.string('detail');
    t.string('status').defaultTo('pending');
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.timestamp('processed_at');
  });

  await knex.schema.createTable('transactions', t => {
    t.bigIncrements('id').primary();
    t.uuid('user_id').references('id').inTable('users');
    t.string('type');
    t.bigInteger('amount');
    t.bigInteger('balance_after');
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.jsonb('meta');
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('transactions');
  await knex.schema.dropTableIfExists('withdraw_requests');
  await knex.schema.dropTableIfExists('ad_views');
  await knex.schema.dropTableIfExists('ads');
  await knex.schema.dropTableIfExists('users');
};
