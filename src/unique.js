import { differenceWith } from "lodash";

// 针对两个集合求差集，然后在差集上基于uniques特征数组来得到唯一性的元素集，最终进行合并处理
function mergeUnique(key, uniques, getter = a => a) {
  return (a, b, k) =>
    k === key && [
      ...a,
      ...differenceWith(b, a, item => uniques.indexOf(getter(item)) >= 0)
    ];
}

export default mergeUnique;
