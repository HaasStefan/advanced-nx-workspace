import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EditFacade } from '@flight-workspace/passenger/domain';

@Component({
  selector: 'passenger-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class EditComponent {
  id: number | undefined;

  constructor(private editFacade: EditFacade, private route: ActivatedRoute) {
    this.route.paramMap.subscribe(
      (params) => (this.id = +(params.get('id') || '0'))
    );
  }
}
