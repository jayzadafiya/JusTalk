export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  field?: string;

  constructor(message: string, statusCode: number, field?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.field = field;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(message, 400, field);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized access") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Access forbidden") {
    super(message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, field?: string) {
    super(message, 409, field);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = "Internal server error") {
    super(message, 500);
  }
}
