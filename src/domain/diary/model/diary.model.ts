export const DiaryBrand: unique symbol = Symbol('Diary');

export class Diary {
  readonly [DiaryBrand]: void;

  constructor(
    public readonly id: number,
    public readonly detail: string,
    public readonly createdAt: Date,
  ) {}
}
