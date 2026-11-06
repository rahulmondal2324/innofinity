import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { App } from "./app";
describe("App", () => {
  it("renders the router and notification host", () => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("router-outlet")).toBeTruthy();
    expect(fixture.nativeElement.querySelector("iw-admin-toasts")).toBeTruthy();
  });
});
