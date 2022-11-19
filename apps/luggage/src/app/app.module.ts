import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { NxWelcomeComponent } from './nx-welcome.component';
import { LuggageFeatureCheckingModule } from '@flight-workspace/luggage/feature-checking';
import { HttpClientModule } from '@angular/common/http';
import { LuggageFeatureReportLossModule } from '@flight-workspace/luggage/feature-report-loss';

@NgModule({
  declarations: [AppComponent, NxWelcomeComponent],
  imports: [
    BrowserModule,
    LuggageFeatureCheckingModule,
    HttpClientModule,
    LuggageFeatureReportLossModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
