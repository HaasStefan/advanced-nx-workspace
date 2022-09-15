import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PassengerDomainModule } from '@flight-workspace/passenger/domain';
import { EditComponent } from './edit.component';

@NgModule({
  imports: [
    CommonModule,
    PassengerDomainModule,
    RouterModule.forChild([
      {
        path: '',
        pathMatch: 'full',
        component: EditComponent
      }
    ])
  ],
  declarations: [EditComponent],
  exports: [EditComponent],
})
export class PassengerFeatureEditModule {}
