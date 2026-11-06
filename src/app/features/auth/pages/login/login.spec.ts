import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";
import { Login } from "./login";
import { ToastService } from "../../../../core/notifications/toast.service";

describe("Login form", () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([]), provideHttpClient()],
    }),
  );

  it("renders a labelled professional login form", () => {
    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector("#login-title").textContent,
    ).toContain("Sign in");
    expect(
      fixture.nativeElement.querySelector('label[for="email"]'),
    ).toBeTruthy();
    expect(
      fixture.nativeElement
        .querySelector("#password")
        .getAttribute("autocomplete"),
    ).toBe("current-password");
  });
  it("validates empty fields without attempting sign-in", () => {
    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    fixture.componentInstance.submit();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("#email-error")).toBeTruthy();
    expect(fixture.nativeElement.querySelector("#password-error")).toBeTruthy();
    expect(TestBed.inject(ToastService).messages()).toHaveLength(0);
  });
  it("displays a configuration toast and clears the password when API is disabled", () => {
    const fixture = TestBed.createComponent(Login);
    fixture.componentInstance.form.setValue({
      email: "admin@example.test",
      password: "test-only",
    });
    fixture.componentInstance.submit();
    expect(TestBed.inject(ToastService).messages()[0].message).toContain(
      "not connected",
    );
    expect(fixture.componentInstance.form.controls.password.value).toBe("");
    expect(fixture.componentInstance.submitting()).toBe(false);
  });
  it("toggles password visibility without changing its value", () => {
    const fixture = TestBed.createComponent(Login);
    fixture.componentInstance.form.controls.password.setValue("test-only");
    fixture.detectChanges();
    fixture.nativeElement.querySelector(".visibility-button").click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("#password").type).toBe("text");
    expect(fixture.componentInstance.form.controls.password.value).toBe(
      "test-only",
    );
  });
});
