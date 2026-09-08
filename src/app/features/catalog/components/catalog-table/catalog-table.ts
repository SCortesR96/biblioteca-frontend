import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TableModule } from 'primeng/table';
import type { BookItem } from '../../../../core/services/book.types';
import { Button } from '../../../../shared/ui/atoms/button/button';
import { StatusBadge } from '../../../../shared/ui/atoms/status-badge/status-badge';

@Component({
  selector: 'app-catalog-table',
  imports: [TableModule, StatusBadge, Button],
  templateUrl: './catalog-table.html',
  styleUrl: './catalog-table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogTable {
  readonly books = input.required<BookItem[]>();
  readonly canManage = input(false);
  readonly loading = input(false);

  readonly deleteBook = output<BookItem>();

  protected trackById(_index: number, book: BookItem): number {
    return book.id;
  }
}
