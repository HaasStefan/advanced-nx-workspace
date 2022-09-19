/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Flight } from '@flight-workspace/flight-lib';
import { filter, interval, tap } from 'rxjs';

@Component({
  selector: 'flight-card',
  templateUrl: './flight-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlightCardComponent implements OnInit, OnChanges, OnDestroy {
  @Input() item: Flight | undefined; // delay must be immutable!
  @Input() selected: boolean | undefined;
  @Output() selectedChange = new EventEmitter<boolean>();

  get someProperty() {
    return Math.random();
  }

  constructor(private element: ElementRef, private zone: NgZone) {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {}

  ngOnDestroy(): void {}

  select() {
    this.selected = true;
    this.selectedChange.next(true);
  }

  deselect() {
    this.selected = false;
    this.selectedChange.next(false);
  }

  blink() {
    // Dirty Hack used to visualize the change detector
    this.zone.runOutsideAngular(() => {
      setTimeout(() => {
        // let originalColor = this.element.nativeElement.firstChild.style.backgroundColor;
        this.element.nativeElement.firstChild.style.backgroundColor = 'crimson';
        //              ^----- DOM-Element
      });

      setTimeout(() => {
        this.element.nativeElement.firstChild.style.backgroundColor = this
          .selected
          ? 'rgb(204, 197, 185)'
          : 'white';
      }, 1000);
    });

    return null;
  }
}
