import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Flight } from '@flight-workspace/flight-lib';
import { debounceTime, Observable, switchMap, tap } from 'rxjs';

@Component({
  selector: 'flight-workspace-flight-lookahead',
  templateUrl: './flight-lookahead.component.html',
  styleUrls: ['./flight-lookahead.component.css'],
})
export class FlightLookaheadComponent implements OnInit {

  control!: FormControl;
  flights$!: Observable<Flight[]>;
  loading = false; // this is bad --> should be reactive instead!

  constructor(
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.control = new FormControl();

    this.flights$ =
        this.control
            .valueChanges
            .pipe(
                debounceTime(300),
                tap(() => this.loading = true),
                switchMap(input => this.load(input)),
                tap(() => this.loading = false)
            );
  }

  load(from: string): Observable<Flight[]> {
    const url = "http://www.angular.at/api/flight";

    const params = new HttpParams().set('from', from);

    // If you use json-server, use the parameter from_like:
    // const params = new HttpParams().set('from_like', from);

    const headers = new HttpHeaders().set('Accept', 'application/json');

    return this.http.get<Flight[]>(url, {params, headers});
}
}
