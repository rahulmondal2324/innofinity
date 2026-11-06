import { InjectionToken } from "@angular/core";

export interface ApiConfig {
  baseUrl: string;
  loginPath: string;
  enabled: boolean;
  adminRoles: readonly string[];
}

// Public browser configuration only. Confirm these values with the Java team.
export const API_CONFIG = new InjectionToken<ApiConfig>("API_CONFIG", {
  providedIn: "root",
  factory: () => ({
    baseUrl: "/api",
    loginPath: "/admin/auth/login",
    enabled: false,
    adminRoles: ["ADMIN", "SUPER_ADMIN"],
  }),
});

export function apiUrl(config: ApiConfig, path: string): string {
  return config.baseUrl.replace(/\/$/, "") + "/" + path.replace(/^\//, "");
}

export function isApiUrl(url: string, config: ApiConfig): boolean {
  const base = new URL(
    config.baseUrl.replace(/\/$/, "") + "/",
    window.location.origin,
  );
  const target = new URL(url, window.location.origin);
  return (
    target.origin === base.origin &&
    (target.pathname === base.pathname.slice(0, -1) ||
      target.pathname.startsWith(base.pathname))
  );
}
