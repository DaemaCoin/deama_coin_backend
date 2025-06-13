export class HttpException extends Error {
  public statusCode: number;
  public path?: string;

  constructor(message: string, statusCode: number, path?: string) {
    super(message);
    this.statusCode = statusCode;
    this.path = path;
  }
}
