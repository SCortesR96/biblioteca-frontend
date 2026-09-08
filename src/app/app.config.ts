import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { ConfirmationService, MessageService } from 'primeng/api';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

import { routes } from './app.routes';
import { apiInterceptor } from './core/interceptors/api-interceptor';

/**
 * Aura viene con verde/esmeralda como color primario por defecto — se pidió azul.
 * Se referencian los tokens `{blue.*}` que el propio tema ya trae (no hex fijos): así el
 * contraste en modo oscuro lo sigue resolviendo el sistema de diseño, no un valor pegado
 * a mano que solo se vería bien en un tema.
 */
const BibliotecaPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{blue.50}',
      100: '{blue.100}',
      200: '{blue.200}',
      300: '{blue.300}',
      400: '{blue.400}',
      500: '{blue.500}',
      600: '{blue.600}',
      700: '{blue.700}',
      800: '{blue.800}',
      900: '{blue.900}',
      950: '{blue.950}',
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([apiInterceptor])),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: BibliotecaPreset,
        options: {
          darkModeSelector: '.dark',
        },
      },
    }),
    // Instancia única para toda la app: MessageService/ConfirmationService no son
    // providedIn: 'root' en PrimeNG, así que sin esto cada componente que las inyecte
    // obtendría su propia instancia y los <p-toast>/<p-confirmdialog> globales de app.html
    // nunca recibirían sus eventos.
    MessageService,
    ConfirmationService,
  ]
};
