// src/app/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../core/services/session.service';

export const sessionGuard: CanActivateFn = () => {
  const auth = inject(SessionService);
  const router = inject(Router);

  return (auth.getToken() != null) ? true : router.createUrlTree(['/login']);
};
