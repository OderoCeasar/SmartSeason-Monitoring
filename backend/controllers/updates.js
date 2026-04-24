const { getDb } = require('../config/db');
const { computeStatus } = require('../services/fieldStatus');
const { asyncHandler } = require('../utils/asyncHandler');

function parsePagination(query) {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 10, 1), 100);
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

async function getAccessibleField(db, fieldId, user) {
  const query = db('fields as f')
    .leftJoin('field_assignments as fa', function joinActiveAssignment() {
      this.on('fa.field_id', '=', 'f.id').andOnNull('fa.unassigned_at');
    })
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
      'fa.agent_id'
    )
    .where('f.id', fieldId)
    .first();

  if (user.role === 'field_agent') {
    query.andWhere('fa.agent_id', user.id);
  }

  const field = await query;

  if (!field) {
    const error = new Error('Field not found');
    error.statusCode = 404;
    error.code = 'FIELD_NOT_FOUND';
    throw error;
  }

  return field;
}

const createUpdate = asyncHandler(async (req, res) => {
  const db = getDb();
  const fieldId = Number(req.params.id);
  const { stage, notes } = req.body;

  await getAccessibleField(db, fieldId, req.user);

  const [update] = await db.transaction(async (trx) => {
    const [createdUpdate] = await trx('field_updates')
      .insert({
        field_id: fieldId,
        updated_by: req.user.id,
        stage,
        notes,
      })
      .returning(['id', 'field_id', 'updated_by', 'stage', 'notes', 'created_at']);

    await trx('fields')
      .where({ id: fieldId })
      .update({
        current_stage: stage,
        updated_at: trx.fn.now(),
      });

    return [createdUpdate];
  });

  const refreshedField = await getAccessibleField(db, fieldId, req.user);

  res.status(201).json({
    item: update,
    field: {
      id: refreshedField.id,
      current_stage: refreshedField.current_stage,
      status: computeStatus(refreshedField, update.created_at),
    },
  });
});

const listUpdates = asyncHandler(async (req, res) => {
  const db = getDb();
  const fieldId = Number(req.params.id);
  const pagination = parsePagination(req.query);

  await getAccessibleField(db, fieldId, req.user);

  const items = await db('field_updates as fu')
    .join('users as u', 'u.id', 'fu.updated_by')
    .select(
      'fu.id',
      'fu.field_id',
      'fu.updated_by',
      'u.name as updated_by_name',
      'fu.stage',
      'fu.notes',
      'fu.created_at'
    )
    .where('fu.field_id', fieldId)
    .orderBy('fu.created_at', 'desc')
    .limit(pagination.limit)
    .offset(pagination.offset);

  const totalRow = await db('field_updates')
    .where({ field_id: fieldId })
    .count({ total: '*' })
    .first();

  const total = Number(totalRow?.total || 0);

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

module.exports = {
  createUpdate,
  listUpdates,
};
