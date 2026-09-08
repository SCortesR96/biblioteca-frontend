import { Injectable, inject } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';

export type ConfirmOptions = {
  message: string;
  header?: string;
  acceptLabel?: string;
  rejectLabel?: string;
  /** 'danger' para acciones destructivas (eliminar), 'warn' para las que solo importan (desbloquear). */
  severity?: 'danger' | 'warn';
};

// Envuelve MessageService/ConfirmationService de PrimeNG para no repetir la config de
// íconos/labels en cada componente. confirm() devuelve una Promise para poder escribir
// `if (!(await ui.confirm(...))) return;`, igual que hacía window.confirm.
@Injectable({
  providedIn: 'root',
})
export class UiFeedback {
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  success(detail: string, summary = 'Listo'): void {
    this.messageService.add({ severity: 'success', summary, detail, life: 4000 });
  }

  error(detail: string, summary = 'Error'): void {
    this.messageService.add({ severity: 'error', summary, detail, life: 6000 });
  }

  info(detail: string, summary = 'Aviso'): void {
    this.messageService.add({ severity: 'info', summary, detail, life: 4000 });
  }

  confirm(options: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmationService.confirm({
        message: options.message,
        header: options.header ?? 'Confirmar',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: options.acceptLabel ?? 'Sí, continuar',
        rejectLabel: options.rejectLabel ?? 'Cancelar',
        acceptButtonProps: { severity: options.severity ?? 'danger' },
        rejectButtonProps: { severity: 'secondary', outlined: true },
        accept: () => resolve(true),
        reject: () => resolve(false),
      });
    });
  }
}
