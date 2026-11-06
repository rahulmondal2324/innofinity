import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'iw-admin-dashboard-welcome',
  imports: [RouterLink],
  templateUrl: './dashboard-welcome.html',
  styleUrl: './dashboard-welcome.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardWelcome {}
