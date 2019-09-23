const isArray = require('lodash/isArray.js');
const isObject = require('lodash/isObject.js');
const flattenDeep = require('lodash/flattenDeep.js');
const changeCase = require('change-case');

/**
 *
 * @param obj {object}
 * @param [variant] {string}
 */
function objectChangeCase(obj, variant = 'camelCase') {
  if (isObject(obj) === false) {
    throw new Error(`objectChangeCase error: ${obj} is not an object!`);
  }

  const result = { ...obj };
  const keys = Object.keys(obj);

  keys.forEach(keyCur => {
    const camelCaseKeyCur = changeCase[variant](keyCur);

    result[camelCaseKeyCur] = result[keyCur];

    if (keyCur !== camelCaseKeyCur) {
      delete result[keyCur];
    }
  });

  return result;
}

/**
 *
 * @param arr {array}
 * @param [variant] {string}
 * @param [flatten] {boolean}
 */
function arrayChangeCase(arr, variant = 'camelCase', flatten = false) {
  if (isArray(arr) === false) {
    throw new Error(`arrayChangeCase error: ${arr} is not an array!`);
  }

  const result = [];

  arr.forEach(cur => {
    if (isArray(cur) === true) {
      result.push(arrayChangeCase(cur, variant));
    } else if (isObject(cur) === true) {
      result.push(objectChangeCase(cur, variant));
    } else if (typeof cur === 'string') {
      result.push(changeCase[variant](cur));
    } else {
      throw new Error(`arrayChangeCase error: ${cur} in ${arr} is not valid format (array or object, or string)!`);
    }
  });

  return flatten ? flattenDeep(result) : result;
}

module.exports = {
  objectChangeCase,
  arrayChangeCase,
};
