import { ChangeDetectionStrategy, Component } from "@angular/core";
import { Brand } from "../brand/brand";
import { WorkspaceIllustration } from "../workspace-illustration/workspace-illustration";
@Component({
  selector: "iw-admin-auth-brand-panel",
  imports: [Brand, WorkspaceIllustration],
  templateUrl: "./auth-brand-panel.html",
  styleUrl: "./auth-brand-panel.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthBrandPanel {}
