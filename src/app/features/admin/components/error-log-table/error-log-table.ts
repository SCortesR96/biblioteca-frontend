import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import type { ErrorLogEntry, LogLevel } from '../../../../core/services/admin.types';

const LEVEL_SEVERITIES: Record<LogLevel, 'info' | 'warn' | 'danger'> = {
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'danger',
};

@Component({
  selector: 'app-error-log-table',
  imports: [TableModule, Tag, DatePipe],
  templateUrl: './error-log-table.html',
  styleUrl: './error-log-table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorLogTable {
  readonly logs = input.required<ErrorLogEntry[]>();

  protected trackById(_index: number, entry: ErrorLogEntry): number {
    return entry.id;
  }

  protected severityFor(level: LogLevel): 'info' | 'warn' | 'danger' {
    return LEVEL_SEVERITIES[level];
  }
}
