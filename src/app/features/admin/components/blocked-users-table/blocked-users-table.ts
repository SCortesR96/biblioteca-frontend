import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TableModule } from 'primeng/table';
import type { BlockedUser } from '../../../../core/services/admin.types';
import { Button } from '../../../../shared/ui/atoms/button/button';

@Component({
  selector: 'app-blocked-users-table',
  imports: [TableModule, Button, DatePipe],
  templateUrl: './blocked-users-table.html',
  styleUrl: './blocked-users-table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlockedUsersTable {
  readonly users = input.required<BlockedUser[]>();

  readonly unblock = output<BlockedUser>();

  protected trackById(_index: number, user: BlockedUser): number {
    return user.id;
  }
}
