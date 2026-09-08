import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';
import { AppHeader } from './shared/ui/organisms/app-header/app-header';

/**
 * Layout raíz: el header vive acá (una sola vez, siempre visible) en vez de repetido en
 * cada página — antes cada página lo incluía por su cuenta y el panel admin directamente
 * se había quedado sin él (sin forma de navegar fuera de /admin salvo con el botón atrás
 * del navegador). `<p-toast>`/`<p-confirmdialog>` también van acá: son overlays globales,
 * un solo lugar para montarlos evita duplicarlos por página.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppHeader, Toast, ConfirmDialog],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
