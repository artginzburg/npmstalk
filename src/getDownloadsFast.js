/**
 * This gets downloads almost instantly, but loses some of the counts, probably because it only checks one registry.
 *
 * @param {string} packageName
 * @returns {Promise<DownloadsFast>}
 */
async function getDownloadsFast(packageName) {
  const { got } = await import('got');
  const start = '2005-01-01';
  const end = todayAsNpmDate();
  return got.get(`https://api.npmjs.org/downloads/point/${start}:${end}/${packageName}`).json();
}

function todayAsNpmDate() {
  return toNpmDate(new Date());
}

function toNpmDate(
  /** @type {Date} */
  date,
) {
  return date.toJSON().split('T')[0];
}

module.exports = { getDownloadsFast };
