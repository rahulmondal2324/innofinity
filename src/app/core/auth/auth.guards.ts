import { inject } from "@angular/core";
import { CanActivateFn, CanMatchFn, Router } from "@angular/router";
import { SessionStore } from "./session.store";

export const adminGuard: CanMatchFn = () => {
  const session = inject(SessionStore);
  const router = inject(Router);
  if (session.accessToken()) return true;
  session.clear();
  return router.createUrlTree(["/auth/login"]);
};

export const guestGuard: CanActivateFn = () => {
  return inject(SessionStore).accessToken()
    ? inject(Router).createUrlTree(["/dashboard"])
    : true;
};
