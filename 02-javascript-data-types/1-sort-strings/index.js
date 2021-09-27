/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const locales = ['ru', 'en'];
  const caseOptions = {caseFirst: 'upper'};
  const compareFn = function (a, b) {
    return a.localeCompare(b, locales, caseOptions);
  };
  return [...arr].sort((a, b) => param === 'asc' ? compareFn(a, b) : compareFn(b, a));
}
