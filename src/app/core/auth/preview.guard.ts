import { inject, isDevMode } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { API_CONFIG } from '../config/api.config';
import { adminGuard } from './auth.guards';
export const previewEnabled = (): boolean => isDevMode() && !inject(API_CONFIG).enabled;
// Preview permits local UI inspection only; it never creates a session or token.
export const workspaceGuard: CanMatchFn = (...args) =>
  previewEnabled() ? true : adminGuard(...args);
