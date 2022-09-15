import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ReactiveComponentModule } from '@ngrx/component';
import { SearchComponent } from './search.component';
import { PassengerDomainModule } from '@flight-workspace/passenger/domain';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([
      {
        path: '',
        pathMatch: 'full',
        component: SearchComponent
      }
    ]),
    ReactiveComponentModule,
    PassengerDomainModule
  ],
  declarations: [SearchComponent],
  exports: [SearchComponent],
})
export class PassengerFeatureSearchModule {}
