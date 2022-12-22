export abstract class CustomError extends Error {
  abstract statusCode: number;

  constructor(message: string) {
    super(message);
    // https://stackoverflow.com/a/41102306
    // Object.setPrototypeOf(this, CustomError.prototype);
  }

  abstract serializeErrors(): { message: string; field?: string }[];
}
