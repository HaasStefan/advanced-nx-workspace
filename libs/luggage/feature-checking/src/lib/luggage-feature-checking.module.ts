import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LuggageDomainModule } from '@flight-workspace/luggage/domain';
import { CheckingComponent } from './checking.component';


@NgModule({
  imports: [CommonModule, LuggageDomainModule],
  declarations: [CheckingComponent],
  exports: [CheckingComponent],
})
export class LuggageFeatureCheckingModule {}
