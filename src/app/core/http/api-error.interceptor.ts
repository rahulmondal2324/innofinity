import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, throwError } from "rxjs";
import { SessionStore } from "../auth/session.store";
import { SKIP_AUTH } from "../auth/auth-api.service";
import { API_CONFIG, isApiUrl } from "../config/api.config";
import { ToastService } from "../notifications/toast.service";
import { apiErrorMessage } from "./api-error";

export const apiErrorInterceptor: HttpInterceptorFn = (request, next) => {
  const config = inject(API_CONFIG);
  const toast = inject(ToastService);
  const session = inject(SessionStore);
  const router = inject(Router);
  return next(request).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && isApiUrl(request.url, config)) {
        const protectedRequest = !request.context.get(SKIP_AUTH);
        if (error.status === 401 && protectedRequest) {
          const hadSession = session.authenticated();
          session.clear();
          if (hadSession)
            toast.show(
              "error",
              "Session expired",
              "Please sign in again to continue.",
            );
          void router.navigateByUrl("/auth/login");
        } else {
          toast.show("error", "Request unsuccessful", apiErrorMessage(error));
        }
      }
      return throwError(() => error);
    }),
  );
};
