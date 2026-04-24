/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('users', (table) => {
    table.bigIncrements('id').primary();
    table.string('name', 120).notNullable();
    table.string('email', 255).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table
      .enu('role', ['admin', 'field_agent'], {
        useNative: false,
        enumName: 'user_role',
      })
      .notNullable();
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index(['role'], 'idx_users_role');
  });

  await knex.schema.createTable('fields', (table) => {
    table.bigIncrements('id').primary();
    table.string('name', 150).notNullable();
    table.string('crop', 120).notNullable();
    table.date('planting_date').notNullable();
    table.date('expected_harvest_date').nullable();
    table
      .enu('current_stage', ['Planted', 'Growing', 'Ready', 'Harvested'], {
        useNative: false,
        enumName: 'field_stage',
      })
      .notNullable();
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index(['current_stage'], 'idx_fields_current_stage');
    table.index(['planting_date'], 'idx_fields_planting_date');
    table.index(['expected_harvest_date'], 'idx_fields_expected_harvest_date');
  });

  await knex.schema.createTable('field_updates', (table) => {
    table.bigIncrements('id').primary();
    table
      .bigInteger('field_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('fields')
      .onDelete('CASCADE');
    table
      .bigInteger('updated_by')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('RESTRICT');
    table
      .enu('stage', ['Planted', 'Growing', 'Ready', 'Harvested'], {
        useNative: false,
        enumName: 'update_stage',
      })
      .notNullable();
    table.text('notes').notNullable();
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index(['field_id', 'created_at'], 'idx_field_updates_field_created_at');
    table.index(['updated_by', 'created_at'], 'idx_field_updates_updated_by_created_at');
  });

  await knex.schema.createTable('field_assignments', (table) => {
    table.bigIncrements('id').primary();
    table
      .bigInteger('field_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('fields')
      .onDelete('CASCADE');
    table
      .bigInteger('agent_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('RESTRICT');
    table
      .bigInteger('assigned_by')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('RESTRICT');
    table.timestamp('assigned_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('unassigned_at', { useTz: true }).nullable();

    table.index(['field_id', 'assigned_at'], 'idx_field_assignments_field_assigned_at');
    table.index(['agent_id', 'assigned_at'], 'idx_field_assignments_agent_assigned_at');
    table.unique(['field_id'], {
      indexName: 'uniq_active_field_assignment',
      predicate: knex.whereNull('unassigned_at'),
    });
    table.index(['agent_id'], 'idx_active_assignments_agent_id', {
      predicate: knex.whereNull('unassigned_at'),
    });
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('field_assignments');
  await knex.schema.dropTableIfExists('field_updates');
  await knex.schema.dropTableIfExists('fields');
  await knex.schema.dropTableIfExists('users');
};
