import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { Admin } from '../../../../core/services/admin';
import type { ManagedUser } from '../../../../core/services/admin.types';
import type { LoanItem } from '../../../../core/services/loan.types';
import { UiFeedback } from '../../../../core/services/ui-feedback';
import { Button } from '../../../../shared/ui/atoms/button/button';
import { StatCard } from '../../../../shared/ui/atoms/stat-card/stat-card';
import { TextInput } from '../../../../shared/ui/atoms/text-input/text-input';
import { FormField } from '../../../../shared/ui/molecules/form-field/form-field';
import { ActivityLogTable } from '../../components/activity-log-table/activity-log-table';
import { AdminLoansTable } from '../../components/admin-loans-table/admin-loans-table';
import { ErrorLogTable } from '../../components/error-log-table/error-log-table';
import { UserForm } from '../../components/user-form/user-form';
import { UsersTable } from '../../components/users-table/users-table';

const MIN_BLOCK_DAYS = 1;
const MAX_BLOCK_DAYS = 365;

/**
 * Une los tres bloques del panel: stats, gestión de usuarios y bitácora de errores. Cada
 * bloque es su propio sub-componente "tonto" (recibe datos por input, emite eventos) — la
 * página es la única que conoce el servicio {@link Admin} y la que pide confirmación /
 * muestra toasts, mismo patrón que {@code CatalogPage}/{@code MyLoansPage}.
 *
 * El diálogo de "bloquear N días" vive acá y no en {@code UsersTable} a propósito: la tabla
 * se mantiene tonta (solo emite `block` con el usuario) y toda la orquestación —elegir los
 * días, validar, confirmar, refrescar— queda en un único lugar.
 */
@Component({
  selector: 'app-admin-page',
  imports: [
    ReactiveFormsModule,
    Dialog,
    StatCard,
    Button,
    TextInput,
    FormField,
    UsersTable,
    UserForm,
    AdminLoansTable,
    ActivityLogTable,
    ErrorLogTable,
  ],
  templateUrl: './admin-page.html',
  styleUrl: './admin-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPage implements OnInit {
  private readonly admin = inject(Admin);
  private readonly ui = inject(UiFeedback);

  protected readonly stats = this.admin.stats;
  protected readonly users = this.admin.users;
  protected readonly loans = this.admin.loans;
  protected readonly loansIncludeReturned = this.admin.loansIncludeReturned;
  protected readonly activity = this.admin.activity;
  protected readonly errorLogs = this.admin.errorLogs;

  /** null = formulario oculto; null-con-flag = alta; un usuario = edición de esa cuenta. */
  protected readonly showCreate = signal(false);
  protected readonly editing = signal<ManagedUser | null>(null);
  protected readonly formOpen = computed(() => this.showCreate() || this.editing() !== null);

  protected readonly blockTarget = signal<ManagedUser | null>(null);
  protected readonly blockDays = new FormControl('7', {
    nonNullable: true,
    validators: [Validators.required, Validators.pattern(/^\d+$/)],
  });
  private readonly blockDaysValue = toSignal(this.blockDays.valueChanges, {
    initialValue: this.blockDays.value,
  });
  protected readonly blockDaysError = computed(() => {
    const raw = this.blockDaysValue().trim();
    if (!raw) return 'Indica cuántos días';
    if (!/^\d+$/.test(raw)) return 'Solo números enteros';
    const n = Number(raw);
    if (n < MIN_BLOCK_DAYS || n > MAX_BLOCK_DAYS)
      return `Entre ${MIN_BLOCK_DAYS} y ${MAX_BLOCK_DAYS} días`;
    return null;
  });

  ngOnInit(): void {
    this.admin.loadStats();
    this.admin.loadUsers();
    this.admin.loadLoans();
    this.admin.loadActivity();
    this.admin.loadErrorLogs();
  }

  // ---- Préstamos (devolución por el admin) ----

  protected toggleIncludeReturned(): void {
    this.admin.loadLoans(!this.loansIncludeReturned());
  }

  protected async onReturnLoan(loan: LoanItem): Promise<void> {
    const confirmed = await this.ui.confirm({
      message: `¿Registrar la devolución de «${loan.bookTitle}» a nombre de ${loan.borrowerName}?`,
      header: 'Devolver préstamo',
      acceptLabel: 'Sí, devolver',
      severity: 'warn',
    });
    if (!confirmed) {
      return;
    }
    this.admin.returnLoan(loan.id).subscribe({
      next: () => {
        this.ui.success(`«${loan.bookTitle}» quedó devuelto.`);
        this.admin.loadStats();
        this.admin.loadActivity();
      },
      error: (error: HttpErrorResponse) =>
        this.ui.error(this.messageFor(error, 'No se pudo registrar la devolución.')),
    });
  }

  // ---- Alta / edición ----

  protected startCreate(): void {
    this.editing.set(null);
    this.showCreate.set(true);
  }

  protected startEdit(user: ManagedUser): void {
    this.showCreate.set(false);
    this.editing.set(user);
  }

  protected closeForm(): void {
    this.showCreate.set(false);
    this.editing.set(null);
  }

  protected onFormSaved(): void {
    this.ui.success(this.editing() ? 'Cuenta actualizada.' : 'Cuenta creada.');
    this.closeForm();
    this.admin.loadStats();
  }

  // ---- Bloqueo / desbloqueo ----

  protected openBlockDialog(user: ManagedUser): void {
    this.blockTarget.set(user);
    this.blockDays.setValue('7');
  }

  protected closeBlockDialog(): void {
    this.blockTarget.set(null);
  }

  protected confirmBlock(): void {
    const user = this.blockTarget();
    if (!user || this.blockDaysError()) {
      return;
    }
    const days = Number(this.blockDays.value.trim());
    this.admin.blockUser(user.id, days).subscribe({
      next: () => {
        this.ui.success(`La cuenta de ${user.name} quedó bloqueada por ${days} día(s).`);
        this.closeBlockDialog();
        this.admin.loadStats();
      },
      error: (error: HttpErrorResponse) =>
        this.ui.error(this.messageFor(error, 'No se pudo bloquear la cuenta.')),
    });
  }

  protected async onUnblock(user: ManagedUser): Promise<void> {
    const confirmed = await this.ui.confirm({
      message: `¿Desbloquear la cuenta de ${user.name}? Podrá volver a pedir préstamos de inmediato.`,
      header: 'Desbloquear cuenta',
      acceptLabel: 'Sí, desbloquear',
      severity: 'warn',
    });
    if (!confirmed) {
      return;
    }
    this.admin.unblockUser(user.id).subscribe({
      next: () => {
        this.ui.success(`La cuenta de ${user.name} fue desbloqueada.`);
        this.admin.loadStats();
      },
      error: (error: HttpErrorResponse) =>
        this.ui.error(this.messageFor(error, 'No se pudo desbloquear la cuenta.')),
    });
  }

  // ---- Eliminación ----

  protected async onRemove(user: ManagedUser): Promise<void> {
    const confirmed = await this.ui.confirm({
      message: `¿Eliminar la cuenta de ${user.name} (${user.email})? Esta acción no se puede deshacer.`,
      header: 'Eliminar cuenta',
      acceptLabel: 'Sí, eliminar',
      severity: 'danger',
    });
    if (!confirmed) {
      return;
    }
    this.admin.deleteUser(user.id).subscribe({
      next: () => {
        this.ui.success(`La cuenta de ${user.name} fue eliminada.`);
        this.admin.loadStats();
      },
      error: (error: HttpErrorResponse) =>
        this.ui.error(this.messageFor(error, 'No se pudo eliminar la cuenta.')),
    });
  }

  /** Prefiere el mensaje del backend (ApiError.message) — p. ej. "No puedes eliminar la última cuenta ADMIN". */
  private messageFor(error: HttpErrorResponse, fallback: string): string {
    const backendMessage = (error.error as { message?: string } | null)?.message;
    return backendMessage ?? fallback;
  }
}
