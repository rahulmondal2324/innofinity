import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { Brand } from '../../shared/ui/brand/brand';
import { ADMIN_NAV } from './admin-nav';
import { previewEnabled } from '../../core/auth/preview.guard';
@Component({
  selector: 'iw-admin-shell',
  host: { '(document:keydown.escape)': 'mobileOpen.set(false)', '[class.is-compact]': 'compact()' },
  imports: [RouterLink, RouterLinkActive, RouterOutlet, Brand, NgTemplateOutlet],
  templateUrl: './admin-shell.html',
  styleUrl: './admin-shell.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminShell {
  readonly auth = inject(AuthService);
  readonly nav = ADMIN_NAV;
  readonly mobileOpen = signal(false);
  readonly compact = signal(false);
  readonly preview = previewEnabled();
}
