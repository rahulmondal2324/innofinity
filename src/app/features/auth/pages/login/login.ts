import { HttpErrorResponse } from "@angular/common/http";
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { finalize } from "rxjs";
import { AuthService } from "../../../../core/auth/auth.service";
import { AuthContractError } from "../../../../core/auth/auth.models";
import { ToastService } from "../../../../core/notifications/toast.service";
import { AuthBrandPanel } from "../../../../shared/ui/auth-brand-panel/auth-brand-panel";
import { Brand } from "../../../../shared/ui/brand/brand";

@Component({
  selector: "iw-admin-login",
  imports: [ReactiveFormsModule, Brand, AuthBrandPanel],
  templateUrl: "./login.html",
  styleUrl: "./login.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly year = new Date().getFullYear();
  readonly submitting = signal(false);
  readonly passwordVisible = signal(false);
  readonly capsLock = signal(false);
  readonly form = this.fb.nonNullable.group({
    email: [
      "",
      [Validators.required, Validators.email, Validators.maxLength(254)],
    ],
    password: ["", [Validators.required, Validators.maxLength(256)]],
  });

  detectCapsLock(event: KeyboardEvent): void {
    this.capsLock.set(event.getModifierState("CapsLock"));
  }

  submit(): void {
    if (this.submitting()) return;
    this.form.controls.email.setValue(this.form.controls.email.value.trim());
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      document
        .getElementById(this.form.controls.email.invalid ? "email" : "password")
        ?.focus();
      return;
    }
    this.submitting.set(true);
    this.auth
      .login(this.form.getRawValue())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.submitting.set(false)),
      )
      .subscribe({
        next: () => {
          this.form.controls.password.reset();
          this.toast.show(
            "success",
            "Welcome back",
            "You are signed in to the admin workspace.",
          );
          void this.router.navigateByUrl("/dashboard");
        },
        error: (error: unknown) => {
          this.form.controls.password.reset();
          if (!(error instanceof HttpErrorResponse)) {
            this.toast.show(
              "error",
              "Unable to sign in",
              error instanceof AuthContractError
                ? error.message
                : "Something went wrong. Please try again.",
            );
          }
        },
      });
  }

  showRecoveryHelp(): void {
    this.toast.show(
      "info",
      "Need access help?",
      "Contact your Innofinity administrator. Password recovery will be available when the account recovery API is connected.",
    );
  }
}
