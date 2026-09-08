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

/**
 * Envoltorio delgado sobre {@link MessageService}/{@link ConfirmationService} de PrimeNG:
 * ningún componente de página habla con esas dos clases directamente. Centraliza el
 * "look & feel" del feedback (íconos, labels por defecto, severidad) en un solo lugar y
 * hace que los componentes de página sean triviales de testear (un solo servicio para
 * mockear, en vez de dos, y sin depender de `window.alert`/`window.confirm`).
 *
 * `confirm()` devuelve una Promise en vez de aceptar callbacks: permite escribir
 * `if (!(await this.ui.confirm(...))) return;`, el mismo flujo lineal que tenía
 * `window.confirm`, pero con un modal real en vez de un diálogo nativo del navegador.
 */
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
