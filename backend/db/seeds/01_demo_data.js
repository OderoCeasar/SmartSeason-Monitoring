const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12;

async function createUser(knex, user) {
  const passwordHash = await bcrypt.hash(user.password, SALT_ROUNDS);

  const [createdUser] = await knex('users')
    .insert({
      name: user.name,
      email: user.email.toLowerCase(),
      password_hash: passwordHash,
      role: user.role,
    })
    .returning(['id', 'name', 'email', 'role']);

  return createdUser;
}

async function createField(knex, field) {
  const [createdField] = await knex('fields')
    .insert({
      name: field.name,
      crop: field.crop,
      planting_date: field.planting_date,
      expected_harvest_date: field.expected_harvest_date,
      current_stage: field.current_stage,
    })
    .returning(['id', 'name', 'current_stage']);

  return createdField;
}

async function assignField(knex, assignment) {
  await knex('field_assignments').insert({
    field_id: assignment.field_id,
    agent_id: assignment.agent_id,
    assigned_by: assignment.assigned_by,
    assigned_at: assignment.assigned_at,
    unassigned_at: assignment.unassigned_at || null,
  });
}

async function addUpdate(knex, update) {
  await knex('field_updates').insert({
    field_id: update.field_id,
    updated_by: update.updated_by,
    stage: update.stage,
    notes: update.notes,
    created_at: update.created_at,
  });
}

/**
 * @param {import('knex').Knex} knex
 */
exports.seed = async function seed(knex) {
  await knex('field_assignments').del();
  await knex('field_updates').del();
  await knex('fields').del();
  await knex('users').del();

  const admin = await createUser(knex, {
    name: 'SmartSeason Admin',
    email: 'admin@smartseason.com',
    password: 'Admin1234!',
    role: 'admin',
  });

  const agentOne = await createUser(knex, {
    name: 'Agent One',
    email: 'agent1@smartseason.com',
    password: 'Agent1234!',
    role: 'field_agent',
  });

  const agentTwo = await createUser(knex, {
    name: 'Agent Two',
    email: 'agent2@smartseason.com',
    password: 'Agent1234!',
    role: 'field_agent',
  });

  const fieldOne = await createField(knex, {
    name: 'North Plot A',
    crop: 'Maize',
    planting_date: '2026-02-01',
    expected_harvest_date: '2026-06-10',
    current_stage: 'Growing',
  });

  const fieldTwo = await createField(knex, {
    name: 'Riverbank Section',
    crop: 'Tomatoes',
    planting_date: '2026-04-18',
    expected_harvest_date: '2026-07-20',
    current_stage: 'Planted',
  });

  const fieldThree = await createField(knex, {
    name: 'East Orchard Block',
    crop: 'Beans',
    planting_date: '2026-01-10',
    expected_harvest_date: '2026-04-15',
    current_stage: 'Harvested',
  });

  const fieldFour = await createField(knex, {
    name: 'Lowland Terrace',
    crop: 'Sorghum',
    planting_date: '2026-03-05',
    expected_harvest_date: '2026-07-30',
    current_stage: 'Growing',
  });

  await assignField(knex, {
    field_id: fieldOne.id,
    agent_id: agentOne.id,
    assigned_by: admin.id,
    assigned_at: '2026-02-02T08:00:00Z',
  });

  await assignField(knex, {
    field_id: fieldTwo.id,
    agent_id: agentOne.id,
    assigned_by: admin.id,
    assigned_at: '2026-04-18T09:15:00Z',
  });

  await assignField(knex, {
    field_id: fieldThree.id,
    agent_id: agentTwo.id,
    assigned_by: admin.id,
    assigned_at: '2026-01-11T07:30:00Z',
  });

  await assignField(knex, {
    field_id: fieldFour.id,
    agent_id: agentTwo.id,
    assigned_by: admin.id,
    assigned_at: '2026-03-06T10:45:00Z',
  });

  await addUpdate(knex, {
    field_id: fieldOne.id,
    updated_by: agentOne.id,
    stage: 'Planted',
    notes: 'Initial planting completed with irrigation scheduled.',
    created_at: '2026-02-02T10:00:00Z',
  });

  await addUpdate(knex, {
    field_id: fieldOne.id,
    updated_by: agentOne.id,
    stage: 'Growing',
    notes: 'Growth is steady, but the field has not been reviewed recently.',
    created_at: '2026-04-10T09:00:00Z',
  });

  await addUpdate(knex, {
    field_id: fieldTwo.id,
    updated_by: agentOne.id,
    stage: 'Planted',
    notes: 'Seedlings planted successfully and moisture levels look good.',
    created_at: '2026-04-19T11:20:00Z',
  });

  await addUpdate(knex, {
    field_id: fieldThree.id,
    updated_by: agentTwo.id,
    stage: 'Ready',
    notes: 'Pods matured fully and the harvest team was scheduled.',
    created_at: '2026-04-10T08:30:00Z',
  });

  await addUpdate(knex, {
    field_id: fieldThree.id,
    updated_by: agentTwo.id,
    stage: 'Harvested',
    notes: 'Harvest completed and the field is ready for post-season review.',
    created_at: '2026-04-15T14:10:00Z',
  });

  await addUpdate(knex, {
    field_id: fieldFour.id,
    updated_by: agentTwo.id,
    stage: 'Growing',
    notes: 'Growth remains healthy after the recent fertilizer application.',
    created_at: '2026-04-23T07:50:00Z',
  });
};
