import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Tag } from 'primeng/tag';
import type { BookStatus } from '../../../../core/services/book.types';
import { STATUS_LABELS, STATUS_SEVERITIES } from './status-badge.types';

@Component({
  selector: 'app-status-badge',
  imports: [Tag],
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadge {
  readonly status = input.required<BookStatus>();

  protected readonly label = computed(() => STATUS_LABELS[this.status()]);
  protected readonly severity = computed(() => STATUS_SEVERITIES[this.status()]);
}
