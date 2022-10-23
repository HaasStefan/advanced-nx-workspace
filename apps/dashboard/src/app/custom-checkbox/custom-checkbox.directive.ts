// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Directive, HostListener, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: 'custom-checkbox'
})
export class CustomCheckboxDirective {

  @Output() checkedChange = new EventEmitter<boolean>();

  @HostListener('changed', ['$event'])
  changed($event: CustomEvent) {
      this.checkedChange.next($event.detail);
  }
}
