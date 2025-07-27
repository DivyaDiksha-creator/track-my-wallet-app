import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'; 
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes'; 
import { HTTP_INTERCEPTORS } from '@angular/common/http'; 
import { TokenInterceptor } from './app/core/auth/token-interceptor'; 
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes), 
    provideHttpClient(withInterceptorsFromDi()), 
    {
      provide: HTTP_INTERCEPTORS, 
      useClass: TokenInterceptor, 
      multi: true 
    }
  ]
}).catch((err) => console.error(err));
