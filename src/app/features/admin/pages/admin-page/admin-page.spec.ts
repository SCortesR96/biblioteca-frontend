import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Admin } from '../../../../core/services/admin';
import type { AdminStats, BlockedUser, ErrorLogPage } from '../../../../core/services/admin.types';
import { AdminPage } from './admin-page';

const stats: AdminStats = { prestamosActivos: 3, prestamosVencidos: 1, reservasActivas: 2, cuentasBloqueadas: 1 };
const blockedUser: BlockedUser = { id: 1, name: 'Ana', email: 'ana@biblioteca.com', blockedUntil: '2026-06-22T00:00:00Z' };
const logPage: ErrorLogPage = { content: [], totalElements: 0, totalPages: 0, number: 0, size: 20 };

describe('AdminPage', () => {
  let fixture: ComponentFixture<AdminPage>;
  let component: AdminPage;
  let adminStub: {
    stats: ReturnType<typeof signal>; blockedUsers: ReturnType<typeof signal>; errorLogs: ReturnType<typeof signal>;
    loadStats: ReturnType<typeof vi.fn>; loadBlockedUsers: ReturnType<typeof vi.fn>;
    loadErrorLogs: ReturnType<typeof vi.fn>; unblockUser: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    adminStub = {
      stats: signal<AdminStats | null>(stats),
      blockedUsers: signal<BlockedUser[]>([blockedUser]),
      errorLogs: signal<ErrorLogPage | null>(logPage),
      loadStats: vi.fn(),
      loadBlockedUsers: vi.fn(),
      loadErrorLogs: vi.fn(),
      unblockUser: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [AdminPage],
      providers: [{ provide: Admin, useValue: adminStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminPage);
    component = fixture.componentInstance;
  });

  it('loads stats, blocked users and error logs on init', () => {
    fixture.detectChanges();

    expect(adminStub.loadStats).toHaveBeenCalled();
    expect(adminStub.loadBlockedUsers).toHaveBeenCalled();
    expect(adminStub.loadErrorLogs).toHaveBeenCalled();
  });

  it('renders the stats and the blocked user', () => {
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('3');
    expect(text).toContain('ana@biblioteca.com');
  });

  it('onUnblock() does nothing when the user cancels the confirm dialog', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    fixture.detectChanges();

    component['onUnblock'](blockedUser);

    expect(adminStub.unblockUser).not.toHaveBeenCalled();
  });

  it('onUnblock() unblocks and refreshes stats when confirmed', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    adminStub.unblockUser.mockReturnValue(of(undefined));
    fixture.detectChanges();

    component['onUnblock'](blockedUser);

    expect(adminStub.unblockUser).toHaveBeenCalledWith(1);
    expect(adminStub.loadStats).toHaveBeenCalledTimes(2); // init + post-unblock refresh
  });

  it('onUnblock() alerts the user when the request fails', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    adminStub.unblockUser.mockReturnValue(throwError(() => new Error('fail')));
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    fixture.detectChanges();

    component['onUnblock'](blockedUser);

    expect(alertSpy).toHaveBeenCalled();
  });
});
