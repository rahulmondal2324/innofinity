import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { findNav } from '../../layout/admin-shell/admin-nav';
@Component({
  selector: 'iw-admin-module-preview',
  imports: [RouterLink],
  templateUrl: './module-preview.html',
  styleUrl: './module-preview.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModulePreview {
  readonly item = findNav(inject(Router).url.split('?')[0]);
}
