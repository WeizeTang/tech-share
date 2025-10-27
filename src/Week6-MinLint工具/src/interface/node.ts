export interface Node {
  /** 类型 */
  type: string;
  /** 开始位置 */
  start: number;
  /** 结束位置 */
  end: number;
  /** 位置（行列，1-based 行，0-based 列来自 parser） */
  loc?: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
}

export interface Token {
  /** 类型 */
  type: string;
  /** 值 */
  value: string;
  /** 开始位置 */
  start: number;
  /** 结束位置 */
  end: number;
}
