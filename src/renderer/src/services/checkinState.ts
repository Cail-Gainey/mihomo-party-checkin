/**
 * 签到状态管理工具
 * 用于在不同组件间共享自动签到的执行状态
 * @author Cail Gainey <cailgainey@foxmail.com>
 */

// 标记自动签到是否已执行
let autoCheckinExecuted = false;

/**
 * 获取自动签到执行状态
 * @returns 自动签到是否已执行
 * @author Cail Gainey <cailgainey@foxmail.com>
 */
export const getAutoCheckinExecuted = (): boolean => {
  return autoCheckinExecuted;
};

/**
 * 设置自动签到执行状态
 * @param executed 是否已执行
 * @author Cail Gainey <cailgainey@foxmail.com>
 */
export const setAutoCheckinExecuted = (executed: boolean): void => {
  autoCheckinExecuted = executed;
};

/**
 * 重置自动签到执行状态
 * 在每次开关自动签到设置时调用
 * @author Cail Gainey <cailgainey@foxmail.com>
 */
export const resetAutoCheckinState = (): void => {
  autoCheckinExecuted = false;
}; 