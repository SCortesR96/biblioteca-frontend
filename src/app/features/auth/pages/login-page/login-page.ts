import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LoginForm } from '../../components/login-form/login-form';

@Component({
  selector: 'app-login-page',
  imports: [LoginForm],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private readonly router = inject(Router);

  protected onLoggedIn(): void {
    this.router.navigateByUrl('/');
  }
}
