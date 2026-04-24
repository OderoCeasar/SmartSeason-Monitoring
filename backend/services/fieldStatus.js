const MS_PER_DAY = 24 * 60 * 60 * 1000;
const STALE_DAYS_THRESHOLD = 7;
const GROWING_DAYS_THRESHOLD = 60;

function toDate(value) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function diffInDays(laterDate, earlierDate) {
  return Math.floor((laterDate.getTime() - earlierDate.getTime()) / MS_PER_DAY);
}

function computeStatus(field, lastUpdateDate, now = new Date()) {
  const plantingDate = toDate(field?.planting_date);
  const updateDate = toDate(lastUpdateDate) || plantingDate;
  const currentDate = toDate(now) || new Date();
  const stage = field?.current_stage;

  if (stage === 'Harvested') {
    return 'Completed';
  }

  const isStale = updateDate ? diffInDays(currentDate, updateDate) > STALE_DAYS_THRESHOLD : false;
  const growingTooLong =
    stage === 'Growing' && plantingDate
      ? diffInDays(currentDate, plantingDate) > GROWING_DAYS_THRESHOLD
      : false;

  if (isStale || growingTooLong) {
    return 'At Risk';
  }

  const isActiveStage = stage === 'Planted' || stage === 'Growing';
  const hasStarted = plantingDate ? plantingDate.getTime() <= currentDate.getTime() : false;

  if (isActiveStage && hasStarted) {
    return 'Active';
  }

  return 'Pending';
}

module.exports = {
  STALE_DAYS_THRESHOLD,
  GROWING_DAYS_THRESHOLD,
  computeStatus,
};
