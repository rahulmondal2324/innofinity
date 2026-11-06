import { computed, inject, Injectable, signal } from "@angular/core";
import { API_CONFIG } from "../config/api.config";
import { AdminUser, AuthContractError, LoginData } from "./auth.models";

export function tokenExpiry(token: string): number | null {
  // Decode for expiry UX only. Java must verify signature, issuer and audience.
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")),
    );
    return typeof payload.exp === "number" && Number.isFinite(payload.exp)
      ? payload.exp * 1000
      : null;
  } catch {
    return null;
  }
}

@Injectable({ providedIn: "root" })
export class SessionStore {
  private readonly config = inject(API_CONFIG);
  private readonly account = signal<AdminUser | null>(null);
  private token: string | null = null;
  private expiresAt = 0;
  private expiryTimer?: ReturnType<typeof setTimeout>;

  readonly user = this.account.asReadonly();
  readonly authenticated = computed(() => this.account() !== null);
  readonly displayName = computed(() => {
    const user = this.account();
    return user ? `${user.firstName} ${user.lastName}`.trim() : "";
  });

  establish(data: LoginData): void {
    this.clear();
    if (!this.config.adminRoles.includes(data.role)) {
      throw new AuthContractError(
        "This account does not have administrator access.",
      );
    }
    if (data.twoFactorEnabled) {
      throw new AuthContractError(
        "This account requires a verification step. The Java team must enable the MFA flow before sign-in can complete.",
      );
    }
    const expires = tokenExpiry(data.jwtToken);
    if (!expires || expires <= Date.now() + 5000) {
      throw new AuthContractError(
        "The server returned an expired or invalid session. Please sign in again.",
      );
    }
    this.expiresAt = expires;
    this.token = data.jwtToken;
    this.account.set({
      id: data.id,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
    });
  }

  scheduleExpiry(callback: () => void): void {
    const schedule = () => {
      const remaining = this.expiresAt - Date.now();
      if (remaining <= 0) {
        this.clear();
        callback();
        return;
      }
      this.expiryTimer = setTimeout(
        schedule,
        Math.min(remaining, 2_147_483_647),
      );
    };
    schedule();
  }

  accessToken(): string | null {
    return this.token && this.expiresAt > Date.now() ? this.token : null;
  }

  clear(): void {
    clearTimeout(this.expiryTimer);
    this.expiryTimer = undefined;
    this.token = null;
    this.expiresAt = 0;
    this.account.set(null);
  }
}
