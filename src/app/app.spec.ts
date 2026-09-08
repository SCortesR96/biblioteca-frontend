import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { ConfirmationService, MessageService } from 'primeng/api';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), MessageService, ConfirmationService],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('renders the global header, the router outlet and the toast/confirm overlays', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-header')).toBeTruthy();
    expect(el.querySelector('p-toast')).toBeTruthy();
    expect(el.querySelector('p-confirmdialog')).toBeTruthy();
  });

  it('renders a footer linking to logiczone.dev', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector('footer a') as HTMLAnchorElement;
    expect(link.href).toBe('https://logiczone.dev/');
  });
});
