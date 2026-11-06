import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'iw-admin-brand',
  templateUrl: './brand.html',
  styleUrl: './brand.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Brand {
  readonly compact = input(false);
}
