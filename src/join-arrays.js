import { cloneDeep, isFunction, isPlainObject, mergeWith } from "lodash";

const isArray = Array.isArray;

export default function joinArrays({
  customizeArray,
  customizeObject,
  key
} = {}) {
  return function _joinArrays(a, b, k) {
    const newKey = key ? `${key}.${k}` : k;

    // 具有curryied特性，将函数对象进行执行处理
    if (isFunction(a) && isFunction(b)) {
      return (...args) => _joinArrays(a(...args), b(...args), k);
    }

    // 参数customizeArray作为外部传递的处理数组合并的函数；比如在webpack中合并rules字段或者plugins字段等
    if (isArray(a) && isArray(b)) {
      const customResult = customizeArray && customizeArray(a, b, newKey);

      // 这种形式属于比较粗粒度的合并操作，因为针对同一个属性对象可能存在不同的规则合并，但是基于下面的扩展运算形式无法精确控制合并过程
      return customResult || [...a, ...b];
    }

    // 如果两个参数都是对象类型
    if (isPlainObject(a) && isPlainObject(b)) {
      const customResult = customizeObject && customizeObject(a, b, newKey);

      // mergeWith函数用于合并对象属性，注意与extend的差别
      return (
        customResult ||
        mergeWith(
          {},
          a,
          b,
          joinArrays({
            customizeArray,
            customizeObject,
            key: newKey
          })
        )
      );
    }

    if (isPlainObject(b)) {
      return cloneDeep(b);
    }

    if (isArray(b)) {
      return [...b];
    }

    return b;
  };
}
