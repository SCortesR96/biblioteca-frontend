import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Tag } from 'primeng/tag';

@Component({
  selector: 'app-overdue-badge',
  imports: [Tag],
  templateUrl: './overdue-badge.html',
  styleUrl: './overdue-badge.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverdueBadge {
  readonly returned = input(false);
  readonly overdue = input(false);

  protected readonly label = computed(() => {
    if (this.returned()) return 'Devuelto';
    return this.overdue() ? 'Vencido' : 'Al día';
  });

  protected readonly severity = computed<'success' | 'warn' | 'danger'>(() => {
    if (this.returned()) return 'success';
    return this.overdue() ? 'danger' : 'success';
  });
}
