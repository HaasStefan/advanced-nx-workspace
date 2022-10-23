import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExternalDashboardTileService {

  loaded = false;

  load(): void {
    if (this.loaded) return;
    this.loaded = true;

    const script = document.createElement('script');
    script.src = 'assets/external-dashboard-tile.bundle.js';
    document.body.appendChild(script);

    // TODO: Create a script element (document.createElement)
    //       that points to 'assets/external-dashboard-tile.bundle.js'
    //       and append it to document.body as a child element
    //
    // HINT: The goal is to dynamically add this to the end of the body:
    //         <script src="..."></script>
  }

}
