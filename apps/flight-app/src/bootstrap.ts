import { bootstrap } from '@angular-architects/module-federation-tools';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

bootstrap(AppModule, {
  production: environment.production,
  appType: 'shell'
});






