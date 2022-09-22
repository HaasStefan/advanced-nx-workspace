import { Component } from '@angular/core';
import { AuthService } from '@flight-workspace/shared/util-auth';

@Component({
  selector: 'flight-workspace-passenger',
  templateUrl: './passenger.component.html',
  styleUrls: ['./passenger.component.css']
})
export class PassengerComponent {
  constructor(auth: AuthService) {
    auth.userName = auth.userName + ' Passenger ';
    console.log(auth.userName);
  }
}
