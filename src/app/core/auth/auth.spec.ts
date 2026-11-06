import { TestBed } from "@angular/core/testing";
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { provideRouter, Router } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { API_CONFIG, isApiUrl } from "../config/api.config";
import { ToastService } from "../notifications/toast.service";
import { authInterceptor } from "../http/auth.interceptor";
import { apiErrorInterceptor } from "../http/api-error.interceptor";
import { AuthService } from "./auth.service";
import { SessionStore, tokenExpiry } from "./session.store";
import {
  AuthContractError,
  LoginData,
  parseLoginResponse,
} from "./auth.models";
import { adminGuard, guestGuard } from "./auth.guards";

const config = {
  baseUrl: "/api",
  loginPath: "/admin/auth/login",
  enabled: true,
  adminRoles: ["ADMIN", "SUPER_ADMIN"],
};
function account(overrides: Partial<LoginData> = {}): LoginData {
  return {
    id: 1,
    email: "admin@example.test",
    firstName: " Admin ",
    lastName: "User",
    role: "ADMIN",
    jwtToken: `test.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }))}.test`,
    twoFactorEnabled: false,
    ...overrides,
  };
}
describe("authentication boundaries", () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(
          withInterceptors([apiErrorInterceptor, authInterceptor]),
        ),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: config },
      ],
    }),
  );
  afterEach(() => {
    TestBed.inject(SessionStore).clear();
    TestBed.inject(HttpTestingController).verify();
    vi.useRealTimers();
  });
  it("parses the data envelope and trims names", () => {
    expect(parseLoginResponse({ data: account() }).firstName).toBe("Admin");
  });
  it("rejects missing data", () =>
    expect(() => parseLoginResponse(account())).toThrow(AuthContractError));
  it("rejects incomplete data", () =>
    expect(() => parseLoginResponse({ data: {} })).toThrow(AuthContractError));
  it("rejects instructor accounts", () => {
    const store = TestBed.inject(SessionStore);
    expect(() => store.establish(account({ role: "INSTRUCTOR" }))).toThrow(
      /administrator/,
    );
    expect(store.accessToken()).toBeNull();
  });
  it("rejects unknown roles", () =>
    expect(() =>
      TestBed.inject(SessionStore).establish(account({ role: "OWNER" })),
    ).toThrow());
  it("requires a second-factor flow", () => {
    const store = TestBed.inject(SessionStore);
    expect(() => store.establish(account({ twoFactorEnabled: true }))).toThrow(
      /verification/,
    );
    expect(store.authenticated()).toBe(false);
  });
  it("rejects expired tokens", () => {
    expect(() =>
      TestBed.inject(SessionStore).establish(
        account({ jwtToken: `a.${btoa(JSON.stringify({ exp: 1 }))}.b` }),
      ),
    ).toThrow(/expired/);
  });
  it("rejects malformed tokens", () => {
    expect(tokenExpiry("bad")).toBeNull();
    expect(tokenExpiry("a.bad.b")).toBeNull();
  });
  it("clears the session on expiry", () => {
    vi.useFakeTimers();
    const store = TestBed.inject(SessionStore);
    store.establish(account());
    const callback = vi.fn();
    store.scheduleExpiry(callback);
    vi.advanceTimersByTime(3_601_000);
    expect(store.authenticated()).toBe(false);
    expect(callback).toHaveBeenCalledOnce();
  });
  it("sends login credentials without bearer headers and establishes an admin session", async () => {
    const credentials = {
      email: "admin@example.test",
      password: "not-a-real-password",
    };
    const result = firstValueFrom(
      TestBed.inject(AuthService).login(credentials),
    );
    const req = TestBed.inject(HttpTestingController).expectOne(
      "/api/admin/auth/login",
    );
    expect(req.request.method).toBe("POST");
    expect(req.request.body).toEqual(credentials);
    expect(req.request.headers.has("Authorization")).toBe(false);
    req.flush({ data: account() });
    await result;
    expect(TestBed.inject(SessionStore).authenticated()).toBe(true);
  });
  it("keeps API-disabled configuration closed", async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    await expect(
      firstValueFrom(
        TestBed.inject(AuthService).login({ email: "a@b.test", password: "x" }),
      ),
    ).rejects.toThrow(/not connected/);
    expect(TestBed.inject(SessionStore).authenticated()).toBe(false);
  });
  it("checks origin and exact API path boundaries", () => {
    expect(isApiUrl("/api/orders", config)).toBe(true);
    expect(isApiUrl("/api-evil/orders", config)).toBe(false);
    expect(isApiUrl("https://other.example/api/orders", config)).toBe(false);
  });
  it("redirects anonymous admin route access to login", () => {
    const result = TestBed.runInInjectionContext(() =>
      adminGuard({ path: "" }, [], {} as never),
    );
    expect(
      TestBed.inject(Router).serializeUrl(
        result as ReturnType<Router["createUrlTree"]>,
      ),
    ).toBe("/auth/login");
  });
  it("redirects an authenticated user away from login", () => {
    TestBed.inject(SessionStore).establish(account());
    const result = TestBed.runInInjectionContext(() =>
      guestGuard({} as never, {} as never),
    );
    expect(
      TestBed.inject(Router).serializeUrl(
        result as ReturnType<Router["createUrlTree"]>,
      ),
    ).toBe("/dashboard");
  });
  it("deduplicates repeated toasts", () => {
    const toast = TestBed.inject(ToastService);
    toast.show("error", "Error", "Try again");
    toast.show("error", "Error", "Try again");
    expect(toast.messages()).toHaveLength(1);
  });
  it("attaches the bearer token to our API", async () => {
    const store = TestBed.inject(SessionStore);
    store.establish(account());
    const pending = firstValueFrom(
      TestBed.inject(HttpClient).get("/api/orders"),
    );
    const req = TestBed.inject(HttpTestingController).expectOne("/api/orders");
    expect(req.request.headers.get("Authorization")).toBe(
      `Bearer ${store.accessToken()}`,
    );
    req.flush([]);
    await pending;
  });
  it("never leaks tokens to external origins", async () => {
    TestBed.inject(SessionStore).establish(account());
    const pending = firstValueFrom(
      TestBed.inject(HttpClient).get("https://external.example/api"),
    );
    const req = TestBed.inject(HttpTestingController).expectOne(
      "https://external.example/api",
    );
    expect(req.request.headers.has("Authorization")).toBe(false);
    req.flush({});
    await pending;
  });
  it("shows one safe toast for a failed API request", async () => {
    const pending = firstValueFrom(
      TestBed.inject(HttpClient).get("/api/orders"),
    );
    const failure = expect(pending).rejects.toBeTruthy();
    TestBed.inject(HttpTestingController)
      .expectOne("/api/orders")
      .flush(
        { message: "SQL secret stack trace" },
        { status: 500, statusText: "Error" },
      );
    await failure;
    const messages = TestBed.inject(ToastService).messages();
    expect(messages).toHaveLength(1);
    expect(messages[0].message).not.toContain("SQL");
  });
  it("clears and redirects a rejected protected session", async () => {
    TestBed.inject(SessionStore).establish(account());
    const navigate = vi
      .spyOn(TestBed.inject(Router), "navigateByUrl")
      .mockResolvedValue(true);
    const pending = firstValueFrom(
      TestBed.inject(HttpClient).get("/api/orders"),
    );
    const failure = expect(pending).rejects.toBeTruthy();
    TestBed.inject(HttpTestingController)
      .expectOne("/api/orders")
      .flush({}, { status: 401, statusText: "Unauthorized" });
    await failure;
    expect(TestBed.inject(SessionStore).accessToken()).toBeNull();
    expect(navigate).toHaveBeenCalledWith("/auth/login");
    expect(TestBed.inject(ToastService).messages()).toHaveLength(1);
  });
});
