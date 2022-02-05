/* eslint-disable @typescript-eslint/no-explicit-any */

export interface Type<T> extends Function { new(...args: any[]): T }

export type ArrayType<T extends Array<any>> = T extends (infer U)[] ? U : never