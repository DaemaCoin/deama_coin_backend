const TokenBrand: unique symbol = Symbol('Token');

export class Token {
  readonly [TokenBrand]: void;

  constructor(public readonly token: string) {}
}
