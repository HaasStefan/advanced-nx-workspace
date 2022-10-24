import { Component, OnInit } from '@angular/core';
import { CheckingFacade } from '@flight-workspace/luggage/domain';

@Component({
  selector: 'luggage-checking',
  templateUrl: './checking.component.html',
  styleUrls: ['./checking.component.scss'],
})
export class CheckingComponent implements OnInit {
  luggageList$ = this.checkingFacade.luggageList$;

  constructor(private checkingFacade: CheckingFacade) {}

  ngOnInit() {
    this.load();
  }

  load(): void {
    this.checkingFacade.load();
  }
}
