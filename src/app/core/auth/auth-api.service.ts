import {
  HttpClient,
  HttpContext,
  HttpContextToken,
} from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_CONFIG, apiUrl } from "../config/api.config";
import { LoginRequest } from "./auth.models";

export const SKIP_AUTH = new HttpContextToken<boolean>(() => false);

@Injectable({ providedIn: "root" })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  login(credentials: LoginRequest) {
    return this.http.post<unknown>(
      apiUrl(this.config, this.config.loginPath),
      credentials,
      {
        context: new HttpContext().set(SKIP_AUTH, true),
        timeout: 15000,
      },
    );
  }
}
