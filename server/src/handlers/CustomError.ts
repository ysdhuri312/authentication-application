/** @format */

class CustomErrorHandler extends Error {
  constructor(
    public statusCode?: number,
    message?: string,
  ) {
    super(message);
    this.statusCode = statusCode;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default CustomErrorHandler;
