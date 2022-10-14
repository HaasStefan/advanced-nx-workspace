import { debounceTime, distinctUntilChanged, Observable } from 'rxjs';

// parameterized operator
// something(): (o$: Observable) => Observable { return o$ => o$.pipe() } 
export function lookAhead<T>(
  debounce: number = 0
): (source$: Observable<T>) => Observable<T> {
  return (source$) =>
    source$.pipe(distinctUntilChanged(), debounceTime(debounce));
}
