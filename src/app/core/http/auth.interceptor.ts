import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { API_CONFIG, isApiUrl } from "../config/api.config";
import { SKIP_AUTH } from "../auth/auth-api.service";
import { SessionStore } from "../auth/session.store";

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const config = inject(API_CONFIG);
  const token = inject(SessionStore).accessToken();
  if (
    !token ||
    request.context.get(SKIP_AUTH) ||
    !isApiUrl(request.url, config)
  ) {
    return next(request);
  }
  return next(
    request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }),
  );
};
