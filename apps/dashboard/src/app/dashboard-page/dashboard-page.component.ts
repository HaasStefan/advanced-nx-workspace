/* eslint-disable @typescript-eslint/no-unused-vars */
import { Component } from '@angular/core';
import { ExternalDashboardTileService } from './external-dashboard-tile.service';

@Component({
	templateUrl: './dashboard-page.component.html',
	styleUrls: ['./dashboard-page.component.css']
})
export class DashboardPageComponent {

	constructor(
		private externalService: ExternalDashboardTileService
	) { }


	addTile(): void {
		this._add('dashboard-tile');
	}

	private _add(elementName: string): void {

		const data =	[
			Math.round(Math.random() * 100),
			Math.round(Math.random() * 100),
			Math.round(Math.random() * 100)
		];

		const content = document.getElementById('content');
		
		const tile = document.createElement(elementName);
		
		tile.setAttribute('class', 'col-lg-4 col-md-3 col-sm-2');
		tile.setAttribute('a', '' + data[0]);
		tile.setAttribute('b', '' + data[1]);
		tile.setAttribute('c', '' + data[2]);

		content?.appendChild(tile);
	}


	addExternal(): void {
		this.externalService.load();
		this._add('external-dashboard-tile');
	}


}
