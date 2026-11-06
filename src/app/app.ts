import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { ToastContainer } from "./shared/ui/toast-container/toast-container";

@Component({
  imports: [RouterOutlet, ToastContainer],
  selector: "iw-admin-root",
  templateUrl: "./app.html",
  styleUrl: "./app.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
