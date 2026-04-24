const { getDb } = require('../config/db');
const { computeStatus, STALE_DAYS_THRESHOLD } = require('../services/fieldStatus');
const { asyncHandler } = require('../utils/asyncHandler');

function diffInDays(laterDate, earlierDate) {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((new Date(laterDate).getTime() - new Date(earlierDate).getTime()) / msPerDay);
}

function createScopedFieldQuery(db, user) {
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
      'agent.id as agent_id',
      'agent.name as agent_name',
      'agent.email as agent_email'
    );

  if (user.role === 'field_agent') {
    query.where('fa.agent_id', user.id);
  }

  return query;
}

function normalizeField(row) {
  const status = computeStatus(row, row.last_update_at);
  const staleBaseDate = row.last_update_at || row.planting_date;
  const daysStale = staleBaseDate ? diffInDays(new Date(), staleBaseDate) : 0;

  return {
    id: row.id,
    name: row.name,
    crop: row.crop,
    planting_date: row.planting_date,
    expected_harvest_date: row.expected_harvest_date,
    current_stage: row.current_stage,
    status,
    last_update_at: row.last_update_at,
    days_stale: daysStale,
    assigned_agent: row.agent_id
      ? {
          id: row.agent_id,
          name: row.agent_name,
          email: row.agent_email,
        }
      : null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function getRecentUpdates(db, user) {
  const query = db('field_updates as fu')
    .join('fields as f', 'f.id', 'fu.field_id')
    .join('users as updater', 'updater.id', 'fu.updated_by')
    .leftJoin('field_assignments as fa', function joinActiveAssignment() {
      this.on('fa.field_id', '=', 'f.id').andOnNull('fa.unassigned_at');
    })
    .select(
      'fu.id',
      'fu.field_id',
      'f.name as field_name',
      'updater.name as agent_name',
      'fu.stage',
      'fu.notes',
      'fu.created_at'
    )
    .orderBy('fu.created_at', 'desc')
    .limit(5);

  if (user.role === 'field_agent') {
    query.where('fa.agent_id', user.id);
  }

  return query;
}

const getDashboard = asyncHandler(async (req, res) => {
  const db = getDb();
  const rows = await createScopedFieldQuery(db, req.user).orderBy('f.created_at', 'desc');
  const fields = rows.map(normalizeField);

  const byStatus = {
    active: 0,
    at_risk: 0,
    completed: 0,
  };

  const byStage = {
    planted: 0,
    growing: 0,
    ready: 0,
    harvested: 0,
  };

  for (const field of fields) {
    if (field.status === 'Active') {
      byStatus.active += 1;
    } else if (field.status === 'At Risk') {
      byStatus.at_risk += 1;
    } else if (field.status === 'Completed') {
      byStatus.completed += 1;
    }

    const stageKey = String(field.current_stage || '').toLowerCase();
    if (Object.prototype.hasOwnProperty.call(byStage, stageKey)) {
      byStage[stageKey] += 1;
    }
  }

  const recentUpdates = await getRecentUpdates(db, req.user);
  const atRiskFields = fields
    .filter((field) => field.status === 'At Risk')
    .map((field) => ({
      id: field.id,
      name: field.name,
      crop: field.crop,
      current_stage: field.current_stage,
      status: field.status,
      last_update_at: field.last_update_at,
      days_stale: field.days_stale,
      assigned_agent: field.assigned_agent,
      needs_attention: field.days_stale > STALE_DAYS_THRESHOLD,
    }));

  res.status(200).json({
    total_fields: fields.length,
    by_status: byStatus,
    by_stage: byStage,
    recent_updates: recentUpdates,
    at_risk_fields: atRiskFields,
  });
});

module.exports = {
  getDashboard,
};
