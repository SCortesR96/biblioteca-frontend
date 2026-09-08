import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import type { BookSearchParams, BookStatus } from '../../../../core/services/book.types';
import { Button } from '../../../../shared/ui/atoms/button/button';
import { TextInput } from '../../../../shared/ui/atoms/text-input/text-input';
import { STATUS_OPTIONS } from './catalog-search.types';

@Component({
  selector: 'app-catalog-search',
  imports: [ReactiveFormsModule, TextInput, Button, Select],
  templateUrl: './catalog-search.html',
  styleUrl: './catalog-search.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogSearch {
  readonly search = output<BookSearchParams>();

  protected readonly statusOptions = STATUS_OPTIONS;

  protected readonly form = new FormGroup({
    title: new FormControl('', { nonNullable: true }),
    author: new FormControl('', { nonNullable: true }),
    status: new FormControl<BookStatus | null>(null),
  });

  protected submit(): void {
    const { title, author, status } = this.form.getRawValue();
    this.search.emit({
      title: title.trim() || undefined,
      author: author.trim() || undefined,
      status: status ?? undefined,
    });
  }
}
