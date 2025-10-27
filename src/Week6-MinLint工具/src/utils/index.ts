// import type { RuleVisitorNode } from "../interface/rules";

// /**
//  * 合并监听器
//  * @param listeners 监听器
//  * @returns 合并后的监听器内容
//  */
// export const mergeListeners = (
//   listeners: Record<string, RuleVisitorNode[]>
// ) => {
//   const listeners: Record<string, RuleVisitorNode[]> = {};

//   for (const rule of selectedRules) {
//     const ruleInstance = rules[rule];
//     const listener = ruleInstance?.create(ctx);
//     if (!listener) return;

//     for (const key in listener) {
//       if (Array.isArray(listeners[key])) listeners[key].push(listener[key]);
//       else listeners[key] = [listener[key]];
//     }
//   }

//   return listeners;
// };
