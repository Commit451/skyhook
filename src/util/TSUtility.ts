/* eslint-disable @typescript-eslint/no-explicit-any */

export interface Type<T> extends Function { new(...args: any[]): T }