import { differenceWith, mergeWith, unionWith, values } from "lodash";
import joinArrays from "./join-arrays";
import { uniteRules } from "./join-arrays-smart";
import unique from "./unique";

// 朴素的merge形态
function merge(...sources) {
  if (sources.length === 1) {
    // 参数为数组形态
    if (Array.isArray(sources[0])) {
      return mergeWith({}, ...sources[0], joinArrays(sources[0]));
    }

    // 参数为对象形态，并且包含下面两个属性之一
    if (sources[0].customizeArray || sources[0].customizeObject) {
      return (...structures) => {
        if (Array.isArray(structures[0])) {
          return mergeWith({}, ...structures[0], joinArrays(sources[0]));
        }

        return mergeWith({}, ...structures, joinArrays(sources[0]));
      };
    }

    return sources[0];
  }

  return mergeWith({}, ...sources, joinArrays());
}
// 比如合并webpack中的rules规则集
const mergeSmart = merge({
  customizeArray: (a, b, key) => {
    if (isRule(key.split(".").slice(-1)[0])) {
      return unionWith(a, b, uniteRules.bind(null, {}, key));
    }

    return null;
  }
});

const mergeMultiple = (...sources) => values(merge(sources));

// rules: { <field>: <'append'|'prepend'|'replace'> }
// All default to append but you can override here
const mergeStrategy = (rules = {}) =>
  merge({
    customizeArray: customizeArray(rules),
    customizeObject: customizeObject(rules)
  });

const mergeSmartStrategy = (rules = {}) =>
  merge({
    customizeArray: (a, b, key) => {
      const topKey = key.split(".").slice(-1)[0];

      if (isRule(topKey)) {
        switch (rules[key]) {
          case "prepend":
            return [
              ...differenceWith(b, a, (newRule, seenRule) =>
                uniteRules(rules, key, newRule, seenRule, "prepend")
              ),
              ...a
            ];
          case "replace":
            return b;
          default:
            // append
            return unionWith(a, b, uniteRules.bind(null, rules, key));
        }
      }

      return customizeArray(rules)(a, b, key);
    },
    customizeObject: customizeObject(rules)
  });

function customizeArray(rules) {
  return (a, b, key) => {
    switch (rules[key]) {
      case "prepend":
        return [...b, ...a];
      case "replace":
        return b;
      default:
        // append
        return false;
    }
  };
}

function customizeObject(rules) {
  return (a, b, key) => {
    switch (rules[key]) {
      case "prepend":
        return mergeWith({}, b, a, joinArrays());
      case "replace":
        return b;
      default:
        // append
        return false;
    }
  };
}

function isRule(key) {
  return ["preLoaders", "loaders", "postLoaders", "rules"].indexOf(key) >= 0;
}

module.exports = merge;
module.exports.multiple = mergeMultiple;
module.exports.smart = mergeSmart;
module.exports.strategy = mergeStrategy;
module.exports.smartStrategy = mergeSmartStrategy;
module.exports.unique = unique;
