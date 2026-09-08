import { TestBed } from '@angular/core/testing';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UiFeedback } from './ui-feedback';

describe('UiFeedback', () => {
  let service: UiFeedback;
  let messageService: MessageService;
  let confirmationService: ConfirmationService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [MessageService, ConfirmationService] });
    service = TestBed.inject(UiFeedback);
    messageService = TestBed.inject(MessageService);
    confirmationService = TestBed.inject(ConfirmationService);
  });

  it('success() adds a success toast', () => {
    const addSpy = vi.spyOn(messageService, 'add');
    service.success('Todo bien');
    expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success', detail: 'Todo bien' }));
  });

  it('error() adds an error toast', () => {
    const addSpy = vi.spyOn(messageService, 'add');
    service.error('Algo falló');
    expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error', detail: 'Algo falló' }));
  });

  it('info() adds an info toast', () => {
    const addSpy = vi.spyOn(messageService, 'add');
    service.info('Dato curioso');
    expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'info', detail: 'Dato curioso' }));
  });

  it('confirm() resolves true when the user accepts', async () => {
    vi.spyOn(confirmationService, 'confirm').mockImplementation((opts) => {
      opts.accept?.();
      return confirmationService;
    });

    const result = await service.confirm({ message: '¿Seguro?' });

    expect(result).toBe(true);
  });

  it('confirm() resolves false when the user rejects', async () => {
    vi.spyOn(confirmationService, 'confirm').mockImplementation((opts) => {
      opts.reject?.();
      return confirmationService;
    });

    const result = await service.confirm({ message: '¿Seguro?' });

    expect(result).toBe(false);
  });

  it('confirm() forwards custom labels and severity', async () => {
    const confirmSpy = vi.spyOn(confirmationService, 'confirm').mockImplementation((opts) => {
      opts.accept?.();
      return confirmationService;
    });

    await service.confirm({ message: 'Eliminar', header: 'Cuidado', acceptLabel: 'Sí', rejectLabel: 'No', severity: 'danger' });

    expect(confirmSpy).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Eliminar', header: 'Cuidado', acceptLabel: 'Sí', rejectLabel: 'No',
      acceptButtonProps: { severity: 'danger' },
    }));
  });
});
