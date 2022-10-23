import {Component, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent {
  value1 = true;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  changed(event: any) {
    this.value1 = event.detail;
  }
}
