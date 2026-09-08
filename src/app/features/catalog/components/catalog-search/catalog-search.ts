import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import type { BookSearchParams, BookStatus } from '../../../../core/services/book.types';
import { Button } from '../../../../shared/ui/atoms/button/button';
import { TextInput } from '../../../../shared/ui/atoms/text-input/text-input';
import { STATUS_OPTIONS } from './catalog-search.types';

// Búsqueda reactiva: cada cambio dispara sola (debounced), el botón "Buscar" queda como atajo.
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

  constructor() {
    this.form.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)), takeUntilDestroyed())
      .subscribe(() => this.submit());
  }

  protected submit(): void {
    const { title, author, status } = this.form.getRawValue();
    this.search.emit({
      title: title.trim() || undefined,
      author: author.trim() || undefined,
      status: status ?? undefined,
    });
  }
}
