import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Admin } from '../../../../core/services/admin';
import type {
  ActivityLogPage,
  AdminStats,
  ErrorLogPage,
  ManagedUser,
} from '../../../../core/services/admin.types';
import type { LoanItem } from '../../../../core/services/loan.types';
import { UiFeedback } from '../../../../core/services/ui-feedback';
import { AdminPage } from './admin-page';

const stats: AdminStats = {
  prestamosActivos: 3,
  prestamosVencidos: 1,
  reservasActivas: 2,
  cuentasBloqueadas: 1,
};
const activeUser: ManagedUser = {
  id: 1,
  name: 'Ana',
  email: 'ana@biblioteca.com',
  role: 'BIBLIOTECARIO',
  blockedUntil: null,
  blocked: false,
  createdAt: '2026-01-01T00:00:00Z',
};
const blockedUser: ManagedUser = {
  id: 2,
  name: 'Beto',
  email: 'beto@biblioteca.com',
  role: 'BIBLIOTECARIO',
  blockedUntil: '2026-06-22T00:00:00Z',
  blocked: true,
  createdAt: '2026-02-01T00:00:00Z',
};
const logPage: ErrorLogPage = { content: [], totalElements: 0, totalPages: 0, number: 0, size: 20 };
const activityPage: ActivityLogPage = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  number: 0,
  size: 30,
};
const activeLoan: LoanItem = {
  id: 5,
  bookId: 1,
  bookTitle: 'El Hobbit',
  bookIsbn: '111',
  borrowerName: 'Ana',
  borrowerEmail: 'ana@biblioteca.com',
  loanDate: '2026-06-01',
  dueDate: '2026-06-15',
  returnDate: null,
  overdue: false,
  reminderSent: false,
};

describe('AdminPage', () => {
  let fixture: ComponentFixture<AdminPage>;
  let component: AdminPage;
  let adminStub: {
    stats: ReturnType<typeof signal>;
    users: ReturnType<typeof signal>;
    loans: ReturnType<typeof signal>;
    loansIncludeReturned: ReturnType<typeof signal>;
    activity: ReturnType<typeof signal>;
    errorLogs: ReturnType<typeof signal>;
    loadStats: ReturnType<typeof vi.fn>;
    loadUsers: ReturnType<typeof vi.fn>;
    loadLoans: ReturnType<typeof vi.fn>;
    loadActivity: ReturnType<typeof vi.fn>;
    loadErrorLogs: ReturnType<typeof vi.fn>;
    createUser: ReturnType<typeof vi.fn>;
    updateUser: ReturnType<typeof vi.fn>;
    deleteUser: ReturnType<typeof vi.fn>;
    blockUser: ReturnType<typeof vi.fn>;
    unblockUser: ReturnType<typeof vi.fn>;
    returnLoan: ReturnType<typeof vi.fn>;
  };
  let uiStub: {
    confirm: ReturnType<typeof vi.fn>;
    success: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    adminStub = {
      stats: signal<AdminStats | null>(stats),
      users: signal<ManagedUser[]>([activeUser, blockedUser]),
      loans: signal<LoanItem[]>([activeLoan]),
      loansIncludeReturned: signal(false),
      activity: signal<ActivityLogPage | null>(activityPage),
      errorLogs: signal<ErrorLogPage | null>(logPage),
      loadStats: vi.fn(),
      loadUsers: vi.fn(),
      loadLoans: vi.fn(),
      loadActivity: vi.fn(),
      loadErrorLogs: vi.fn(),
      createUser: vi.fn(),
      updateUser: vi.fn(),
      deleteUser: vi.fn().mockReturnValue(of(undefined)),
      blockUser: vi.fn().mockReturnValue(of(blockedUser)),
      unblockUser: vi.fn().mockReturnValue(of(undefined)),
      returnLoan: vi.fn().mockReturnValue(of(activeLoan)),
    };
    uiStub = { confirm: vi.fn().mockResolvedValue(true), success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [AdminPage],
      providers: [
        { provide: Admin, useValue: adminStub },
        { provide: UiFeedback, useValue: uiStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminPage);
    component = fixture.componentInstance;
  });

  it('loads stats, users, loans, activity and error logs on init', () => {
    fixture.detectChanges();

    expect(adminStub.loadStats).toHaveBeenCalled();
    expect(adminStub.loadUsers).toHaveBeenCalled();
    expect(adminStub.loadLoans).toHaveBeenCalled();
    expect(adminStub.loadActivity).toHaveBeenCalled();
    expect(adminStub.loadErrorLogs).toHaveBeenCalled();
  });

  it('toggleIncludeReturned() reloads loans with the flipped flag', () => {
    fixture.detectChanges();

    component['toggleIncludeReturned']();

    expect(adminStub.loadLoans).toHaveBeenLastCalledWith(true);
  });

  it('onReturnLoan() confirms, returns the loan and refreshes stats + activity', async () => {
    fixture.detectChanges();

    await component['onReturnLoan'](activeLoan);

    expect(uiStub.confirm).toHaveBeenCalledWith(expect.objectContaining({ severity: 'warn' }));
    expect(adminStub.returnLoan).toHaveBeenCalledWith(5);
    expect(uiStub.success).toHaveBeenCalled();
    expect(adminStub.loadActivity).toHaveBeenCalledTimes(2); // init + post-return
  });

  it('onReturnLoan() does nothing when the confirmation is cancelled', async () => {
    uiStub.confirm.mockResolvedValue(false);
    fixture.detectChanges();

    await component['onReturnLoan'](activeLoan);

    expect(adminStub.returnLoan).not.toHaveBeenCalled();
  });

  it('renders the stats and a user row', () => {
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('3');
    expect(text).toContain('ana@biblioteca.com');
  });

  it('startCreate() / startEdit() / closeForm() drive the form state', () => {
    fixture.detectChanges();

    component['startCreate']();
    expect(component['formOpen']()).toBe(true);
    expect(component['editing']()).toBeNull();

    component['startEdit'](activeUser);
    expect(component['editing']()).toBe(activeUser);
    expect(component['showCreate']()).toBe(false);

    component['closeForm']();
    expect(component['formOpen']()).toBe(false);
  });

  it('onFormSaved() shows a toast, closes the form and refreshes stats', () => {
    fixture.detectChanges();
    component['startCreate']();

    component['onFormSaved']();

    expect(uiStub.success).toHaveBeenCalled();
    expect(component['formOpen']()).toBe(false);
    expect(adminStub.loadStats).toHaveBeenCalledTimes(2); // init + post-save
  });

  it('openBlockDialog() targets the user and resets the days field to 7', () => {
    fixture.detectChanges();
    component['blockDays'].setValue('30');

    component['openBlockDialog'](activeUser);

    expect(component['blockTarget']()).toBe(activeUser);
    expect(component['blockDays'].value).toBe('7');
  });

  it('confirmBlock() blocks for the chosen number of days and shows a toast', () => {
    fixture.detectChanges();
    component['openBlockDialog'](activeUser);
    component['blockDays'].setValue('10');

    component['confirmBlock']();

    expect(adminStub.blockUser).toHaveBeenCalledWith(1, 10);
    expect(uiStub.success).toHaveBeenCalled();
    expect(component['blockTarget']()).toBeNull();
  });

  it('confirmBlock() does nothing when the days value is invalid', () => {
    fixture.detectChanges();
    component['openBlockDialog'](activeUser);
    component['blockDays'].setValue('0');

    component['confirmBlock']();

    expect(adminStub.blockUser).not.toHaveBeenCalled();
    expect(component['blockDaysError']()).not.toBeNull();
  });

  it('onUnblock() asks for confirmation and unblocks when confirmed', async () => {
    fixture.detectChanges();

    await component['onUnblock'](blockedUser);

    expect(uiStub.confirm).toHaveBeenCalledWith(expect.objectContaining({ severity: 'warn' }));
    expect(adminStub.unblockUser).toHaveBeenCalledWith(2);
    expect(uiStub.success).toHaveBeenCalled();
  });

  it('onUnblock() does nothing when the confirmation is cancelled', async () => {
    uiStub.confirm.mockResolvedValue(false);
    fixture.detectChanges();

    await component['onUnblock'](blockedUser);

    expect(adminStub.unblockUser).not.toHaveBeenCalled();
  });

  it('onRemove() deletes the account after a destructive confirmation', async () => {
    fixture.detectChanges();

    await component['onRemove'](activeUser);

    expect(uiStub.confirm).toHaveBeenCalledWith(expect.objectContaining({ severity: 'danger' }));
    expect(adminStub.deleteUser).toHaveBeenCalledWith(1);
    expect(uiStub.success).toHaveBeenCalled();
  });

  it('onRemove() surfaces the backend message when the delete is rejected', async () => {
    adminStub.deleteUser.mockReturnValue(
      throwError(() => ({
        error: { message: 'No puedes eliminar la última cuenta ADMIN del sistema.' },
      })),
    );
    fixture.detectChanges();

    await component['onRemove'](activeUser);

    expect(uiStub.error).toHaveBeenCalledWith(
      'No puedes eliminar la última cuenta ADMIN del sistema.',
    );
  });
});
