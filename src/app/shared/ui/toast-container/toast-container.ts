import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { ToastService } from "../../../core/notifications/toast.service";

@Component({
  selector: "iw-admin-toasts",
  templateUrl: "./toast-container.html",
  styleUrl: "./toast-container.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastContainer {
  readonly toast = inject(ToastService);
}
