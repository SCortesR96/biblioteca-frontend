import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Book } from '../../../../core/services/book';
import { Button } from '../../../../shared/ui/atoms/button/button';
import { TextInput } from '../../../../shared/ui/atoms/text-input/text-input';
import { FormField } from '../../../../shared/ui/molecules/form-field/form-field';

// Alta de libro. "Autocompletar desde ISBN" solo precarga el formulario, nunca guarda solo;
// si no encuentra nada, queda intacto para completarlo a mano.
@Component({
  selector: 'app-book-form',
  imports: [ReactiveFormsModule, TextInput, Button, FormField],
  templateUrl: './book-form.html',
  styleUrl: './book-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookForm {
  private readonly bookService = inject(Book);

  readonly created = output<void>();

  // publicationYear vive como string en el form (app-text-input, como todos los campos de
  // texto, solo produce/consume string vía su ControlValueAccessor) y se convierte a
  // número recién al construir el payload en submit() — nunca se le pasa un number al
  // FormControl, o writeValue() de app-text-input lo recibiría con el tipo equivocado.
  protected readonly form = new FormGroup({
    isbn: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    author: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    publicationYear: new FormControl('', { nonNullable: true }),
    coverUrl: new FormControl<string | null>(null),
    subjects: new FormControl<string | null>(null),
  });

  protected readonly lookingUp = signal(false);
  protected readonly lookupMessage = signal<string | null>(null);
  protected readonly submitting = signal(false);
  protected readonly submitError = signal<string | null>(null);

  protected autocomplete(): void {
    const isbn = this.form.controls.isbn.value.trim();
    if (!isbn) {
      return;
    }

    this.lookingUp.set(true);
    this.lookupMessage.set(null);
    this.bookService.lookupByIsbn(isbn).subscribe({
      next: (data) => {
        this.lookingUp.set(false);
        if (data.title) this.form.controls.title.setValue(data.title);
        if (data.author) this.form.controls.author.setValue(data.author);
        if (data.publicationYear) this.form.controls.publicationYear.setValue(String(data.publicationYear));
        this.form.controls.coverUrl.setValue(data.coverUrl);
        this.form.controls.subjects.setValue(data.subjects);
        this.lookupMessage.set('Datos completados desde Open Library. Revísalos antes de guardar.');
      },
      error: () => {
        this.lookingUp.set(false);
        this.lookupMessage.set('No se encontró información para ese ISBN. Completa los datos manualmente.');
      },
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.submitError.set(null);
    const raw = this.form.getRawValue();
    const yearAsNumber = raw.publicationYear.trim() ? Number(raw.publicationYear) : null;

    this.bookService.create({ ...raw, publicationYear: yearAsNumber }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.form.reset();
        this.lookupMessage.set(null);
        this.created.emit();
      },
      error: (error: HttpErrorResponse) => {
        this.submitting.set(false);
        this.submitError.set(
          error.status === 409 ? 'Ya existe un libro con ese ISBN' : 'No se pudo guardar el libro. Intenta de nuevo.',
        );
      },
    });
  }
}
