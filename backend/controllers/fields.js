const { getDb } = require('../config/db');
const { computeStatus } = require('../services/fieldStatus');
const { asyncHandler } = require('../utils/asyncHandler');

function parsePagination(query) {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 10, 1), 100);
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

function buildFieldQuery(db, user) {
  const query = db('fields as f')
    .leftJoin('field_assignments as fa', function joinActiveAssignment() {
      this.on('fa.field_id', '=', 'f.id').andOnNull('fa.unassigned_at');
    })
    .leftJoin('users as agent', 'agent.id', 'fa.agent_id')
    .leftJoin(
      db('field_updates')
        .select('field_id')
        .max('created_at as last_update_at')
        .groupBy('field_id')
        .as('fu'),
      'fu.field_id',
      'f.id'
    )
    .select(
      'f.id',
      'f.name',
      'f.crop',
      'f.planting_date',
      'f.expected_harvest_date',
      'f.current_stage',
      'f.created_at',
      'f.updated_at',
      'fu.last_update_at',
      'agent.id as assigned_agent_id',
      'agent.name as assigned_agent_name',
      'agent.email as assigned_agent_email'
    );

  if (user.role === 'field_agent') {
    query.where('fa.agent_id', user.id);
  }

  return query;
}

function applyFieldFilters(query, filters) {
  if (filters.search) {
    query.where((builder) => {
      builder
        .whereILike('f.name', `%${filters.search}%`)
        .orWhereILike('f.crop', `%${filters.search}%`)
        .orWhereILike('agent.name', `%${filters.search}%`);
    });
  }

  if (filters.stage) {
    query.where('f.current_stage', filters.stage);
  }

  if (filters.agent_id) {
    query.where('fa.agent_id', filters.agent_id);
  }
}

function normalizeField(row) {
  return {
    id: row.id,
    name: row.name,
    crop: row.crop,
    planting_date: row.planting_date,
    expected_harvest_date: row.expected_harvest_date,
    current_stage: row.current_stage,
    status: computeStatus(row, row.last_update_at),
    last_update_at: row.last_update_at,
    assigned_agent: row.assigned_agent_id
      ? {
          id: row.assigned_agent_id,
          name: row.assigned_agent_name,
          email: row.assigned_agent_email,
        }
      : null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function assertDateOrder(plantingDate, expectedHarvestDate) {
  if (!plantingDate || !expectedHarvestDate) {
    return;
  }

  if (new Date(expectedHarvestDate).getTime() < new Date(plantingDate).getTime()) {
    const error = new Error('Expected harvest date cannot be earlier than planting date');
    error.statusCode = 422;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }
}

async function ensureFieldAccess(db, fieldId, user) {
  const query = buildFieldQuery(db, user).where('f.id', fieldId).first();
  const row = await query;

  if (!row) {
    const error = new Error('Field not found');
    error.statusCode = 404;
    error.code = 'FIELD_NOT_FOUND';
    throw error;
  }

  return normalizeField(row);
}

const listFields = asyncHandler(async (req, res) => {
  const db = getDb();
  const pagination = parsePagination(req.query);
  const baseQuery = buildFieldQuery(db, req.user);

  applyFieldFilters(baseQuery, req.query);

  const rows = await baseQuery.clone().orderBy('f.created_at', 'desc');
  const filteredItems = rows.map(normalizeField);
  const statusFilter = req.query.status;
  const statusFilteredItems = statusFilter
    ? filteredItems.filter((field) => field.status.toLowerCase() === String(statusFilter).toLowerCase())
    : filteredItems;
  const total = statusFilteredItems.length;
  const items = statusFilteredItems.slice(pagination.offset, pagination.offset + pagination.limit);

  res.status(200).json({
    items,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      pages: Math.max(Math.ceil(total / pagination.limit), 1),
    },
  });
});

const createField = asyncHandler(async (req, res) => {
  const db = getDb();
  const { name, crop, planting_date, expected_harvest_date, current_stage } = req.body;

  assertDateOrder(planting_date, expected_harvest_date);

  const [field] = await db('fields')
    .insert({
      name,
      crop,
      planting_date,
      expected_harvest_date: expected_harvest_date || null,
      current_stage,
    })
    .returning([
      'id',
      'name',
      'crop',
      'planting_date',
      'expected_harvest_date',
      'current_stage',
      'created_at',
      'updated_at',
    ]);

  res.status(201).json({
    item: {
      ...field,
      status: computeStatus(field, null),
      last_update_at: null,
      assigned_agent: null,
    },
  });
});

const getFieldById = asyncHandler(async (req, res) => {
  const db = getDb();
  const field = await ensureFieldAccess(db, req.params.id, req.user);

  res.status(200).json({
    item: field,
  });
});

const updateField = asyncHandler(async (req, res) => {
  const db = getDb();
  const { name, crop, planting_date, expected_harvest_date } = req.body;

  await ensureFieldAccess(db, req.params.id, { ...req.user, role: 'admin' });
  assertDateOrder(planting_date, expected_harvest_date);

  const [field] = await db('fields')
    .where({ id: req.params.id })
    .update(
      {
        name,
        crop,
        planting_date,
        expected_harvest_date: expected_harvest_date || null,
        updated_at: db.fn.now(),
      },
      [
        'id',
        'name',
        'crop',
        'planting_date',
        'expected_harvest_date',
        'current_stage',
        'created_at',
        'updated_at',
      ]
    );

  const fieldWithAccess = await ensureFieldAccess(db, field.id, req.user);

  res.status(200).json({
    item: fieldWithAccess,
  });
});

const deleteField = asyncHandler(async (req, res) => {
  const db = getDb();

  const deletedRows = await db('fields').where({ id: req.params.id }).del();

  if (!deletedRows) {
    const error = new Error('Field not found');
    error.statusCode = 404;
    error.code = 'FIELD_NOT_FOUND';
    throw error;
  }

  res.status(200).json({
    message: 'Field deleted successfully',
  });
});

const assignField = asyncHandler(async (req, res) => {
  const db = getDb();
  const fieldId = Number(req.params.id);
  const agentId = Number(req.body.agent_id);

  await ensureFieldAccess(db, fieldId, { ...req.user, role: 'admin' });

  const agent = await db('users')
    .select('id', 'name', 'email', 'role')
    .where({ id: agentId })
    .first();

  if (!agent || agent.role !== 'field_agent') {
    const error = new Error('Assigned user must be a valid field agent');
    error.statusCode = 422;
    error.code = 'INVALID_AGENT';
    throw error;
  }

  await db.transaction(async (trx) => {
    await trx('field_assignments')
      .where({
        field_id: fieldId,
      })
      .whereNull('unassigned_at')
      .update({
        unassigned_at: trx.fn.now(),
      });

    await trx('field_assignments').insert({
      field_id: fieldId,
      agent_id: agentId,
      assigned_by: req.user.id,
    });
  });

  const assignment = await db('field_assignments')
    .select('field_id', 'agent_id', 'assigned_at')
    .where({
      field_id: fieldId,
      agent_id: agentId,
    })
    .whereNull('unassigned_at')
    .orderBy('assigned_at', 'desc')
    .first();

  res.status(200).json({
    message: 'Field assigned successfully',
    assignment,
  });
});

module.exports = {
  listFields,
  createField,
  getFieldById,
  updateField,
  deleteField,
  assignField,
};
