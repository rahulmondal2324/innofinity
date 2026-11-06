export interface LoginRequest {
  email: string;
  password: string;
}

export interface AdminUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface LoginData extends AdminUser {
  jwtToken: string;
  refreshToken?: string;
  twoFactorEnabled: boolean;
}

export interface LoginResponse {
  data: LoginData;
}

export class AuthContractError extends Error {}

// HTTP generics do not validate JSON at runtime; narrow unknown values here.
export function parseLoginResponse(response: unknown): LoginData {
  if (!response || typeof response !== "object" || !("data" in response)) {
    throw new AuthContractError(
      "The sign-in response is invalid. Please contact support.",
    );
  }
  const data = response.data;
  if (!data || typeof data !== "object") {
    throw new AuthContractError(
      "The sign-in response is missing account details.",
    );
  }
  const d = data as Record<string, unknown>;
  if (
    typeof d["id"] !== "number" ||
    !Number.isSafeInteger(d["id"]) ||
    typeof d["email"] !== "string" ||
    typeof d["firstName"] !== "string" ||
    typeof d["lastName"] !== "string" ||
    typeof d["role"] !== "string" ||
    typeof d["jwtToken"] !== "string" ||
    !d["jwtToken"] ||
    typeof d["twoFactorEnabled"] !== "boolean"
  ) {
    throw new AuthContractError(
      "The sign-in response is incomplete. Please contact support.",
    );
  }
  return {
    id: d["id"],
    email: d["email"],
    firstName: d["firstName"].trim(),
    lastName: d["lastName"].trim(),
    role: d["role"],
    jwtToken: d["jwtToken"],
    twoFactorEnabled: d["twoFactorEnabled"],
  };
}
