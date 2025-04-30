export class HttpException extends Error {
  private statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }

  getStatus() {
    return this.statusCode;
  }
}
