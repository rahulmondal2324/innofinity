import { inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { map, tap, throwError } from "rxjs";
import { API_CONFIG } from "../config/api.config";
import { ToastService } from "../notifications/toast.service";
import { AuthApiService } from "./auth-api.service";
import {
  AuthContractError,
  LoginRequest,
  parseLoginResponse,
} from "./auth.models";
import { SessionStore } from "./session.store";

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly api = inject(AuthApiService);
  private readonly config = inject(API_CONFIG);
  private readonly session = inject(SessionStore);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  login(credentials: LoginRequest) {
    if (!this.config.enabled) {
      return throwError(
        () =>
          new AuthContractError(
            "Sign-in is not connected yet. The Java login API must be configured before you can access the admin workspace.",
          ),
      );
    }
    return this.api.login(credentials).pipe(
      map(parseLoginResponse),
      tap((data) => {
        this.session.establish(data);
        this.session.scheduleExpiry(() => {
          this.toast.show(
            "info",
            "Session ended",
            "Please sign in again to continue.",
          );
          void this.router.navigateByUrl("/auth/login");
        });
      }),
    );
  }

  logout(): void {
    // Local sign-out only until Java supplies a session-revocation endpoint.
    this.session.clear();
    this.toast.show(
      "success",
      "Signed out",
      "Your local session has been cleared.",
    );
    void this.router.navigateByUrl("/auth/login");
  }
}
