import type { ApiErrorBody } from "@/types/api";

export class ApiError extends Error {
  code: string;
  details?: ApiErrorBody["error"]["details"];
  status: number;

  constructor(status: number, body: ApiErrorBody) {
    super(body.error.message);
    this.name = "ApiError";
    this.code = body.error.code;
    this.details = body.error.details;
    this.status = status;
  }
}

export async function parseApiError(response: Response): Promise<ApiError> {
  try {
    const body = (await response.json()) as ApiErrorBody;
    if (body?.error?.message) {
      return new ApiError(response.status, body);
    }
  } catch {
    // response body was not JSON, fall through to generic error
  }
  return new ApiError(response.status, {
    error: {
      message: `Request failed with status ${response.status}`,
      code: "SERVER_ERROR",
    },
  });
}
