import { Component } from '@angular/core';
import { Passenger, SearchFacade } from '@flight-workspace/passenger/domain';

@Component({
  selector: 'passenger-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent {
  firstname = '';
  name = 'Smith';
  passengerList$ = this.searchFacade.passengerList$;
  selectedPassenger: Passenger | undefined;

  constructor(private searchFacade: SearchFacade) {}

  load(): void {
    this.searchFacade.load(this.name, this.firstname);
  }

  toggleSelection(p: Passenger) {
    this.selectedPassenger = p;
  }
}
