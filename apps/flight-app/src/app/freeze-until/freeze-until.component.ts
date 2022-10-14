import { Component } from '@angular/core';
import { freezeUntil } from '@flight-workspace/shared/util-rxjs-operators';
import { interval, Subject } from 'rxjs';

@Component({
  selector: 'flight-workspace-freeze-until',
  templateUrl: './freeze-until.component.html',
  styleUrls: ['./freeze-until.component.css'],
})
export class FreezeUntilComponent {
  reset = new Subject<void>();
  value$ = interval(1000).pipe(
    freezeUntil(this.reset)
  );

  resetObservable() {
    this.reset.next();
  }
}
