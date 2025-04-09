const LoginCommandBrand: unique symbol = Symbol('LoginCommand');

export class LoginCommand {
  readonly [LoginCommandBrand]: void;

  constructor(
    public readonly accountId: string,
    public readonly password: string,
  ) {}
}
