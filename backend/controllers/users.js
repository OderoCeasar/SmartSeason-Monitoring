const { getDb } = require('../config/db');
const { asyncHandler } = require('../utils/asyncHandler');

const listUsers = asyncHandler(async (req, res) => {
  const db = getDb();
  const query = db('users as u')
    .leftJoin('field_assignments as fa', function joinActiveAssignments() {
      this.on('fa.agent_id', '=', 'u.id').andOnNull('fa.unassigned_at');
    })
    .select('u.id', 'u.name', 'u.email', 'u.role')
    .countDistinct({ active_field_count: 'fa.field_id' })
    .groupBy('u.id')
    .orderBy('u.name', 'asc');

  if (req.query.role) {
    query.where('u.role', req.query.role);
  }

  if (req.query.search) {
    query.where((builder) => {
      builder
        .whereILike('u.name', `%${req.query.search}%`)
        .orWhereILike('u.email', `%${req.query.search}%`);
    });
  }

  const items = await query;

  res.status(200).json({
    items: items.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      active_field_count: Number(user.active_field_count || 0),
    })),
  });
});

module.exports = {
  listUsers,
};
