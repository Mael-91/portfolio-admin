export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(params: {
    code: string;
    message: string;
    statusCode: number;
  }) {
    super(params.message);
    this.name = "AppError";
    this.code = params.code;
    this.statusCode = params.statusCode;
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}