/** @returns {Record<string, number>} */
function orderRecordOfStringNumber(
  /** @type {Record<string, number>} */
  record,
  /** @type {'asc' | 'desc'} */
  order = 'desc',
) {
  const isOrderAscending = order === 'asc';
  return Object.fromEntries(
    Object.entries(record).sort((a, b) => (isOrderAscending ? a[1] - b[1] : b[1] - a[1])),
  );
}

module.exports = { orderRecordStringNumber: orderRecordOfStringNumber };
