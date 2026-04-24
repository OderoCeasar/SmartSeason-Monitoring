const test = require('node:test');
const assert = require('node:assert/strict');

const { computeStatus } = require('./fieldStatus');

test('returns Completed when stage is Harvested', () => {
  const status = computeStatus(
    {
      current_stage: 'Harvested',
      planting_date: '2026-01-01',
    },
    '2026-04-01',
    new Date('2026-04-25T00:00:00Z')
  );

  assert.equal(status, 'Completed');
});

test('returns At Risk when last update is older than 7 days', () => {
  const status = computeStatus(
    {
      current_stage: 'Growing',
      planting_date: '2026-03-01',
    },
    '2026-04-10T00:00:00Z',
    new Date('2026-04-25T00:00:00Z')
  );

  assert.equal(status, 'At Risk');
});

test('returns At Risk when field has been growing for more than 60 days', () => {
  const status = computeStatus(
    {
      current_stage: 'Growing',
      planting_date: '2026-01-15',
    },
    '2026-04-22T00:00:00Z',
    new Date('2026-04-25T00:00:00Z')
  );

  assert.equal(status, 'At Risk');
});

test('returns At Risk over Active when both conditions match', () => {
  const status = computeStatus(
    {
      current_stage: 'Growing',
      planting_date: '2026-02-01',
    },
    '2026-04-15T00:00:00Z',
    new Date('2026-04-25T00:00:00Z')
  );

  assert.equal(status, 'At Risk');
});

test('returns Active for planted field that has started and is not stale', () => {
  const status = computeStatus(
    {
      current_stage: 'Planted',
      planting_date: '2026-04-24',
    },
    null,
    new Date('2026-04-25T00:00:00Z')
  );

  assert.equal(status, 'Active');
});

test('returns Pending for ready field that is neither harvested nor at risk', () => {
  const status = computeStatus(
    {
      current_stage: 'Ready',
      planting_date: '2026-04-20',
    },
    '2026-04-24T00:00:00Z',
    new Date('2026-04-25T00:00:00Z')
  );

  assert.equal(status, 'Pending');
});
