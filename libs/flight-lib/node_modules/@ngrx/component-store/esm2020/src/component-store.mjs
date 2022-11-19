import { isObservable, of, ReplaySubject, throwError, combineLatest, Subject, queueScheduler, scheduled, asapScheduler, EMPTY, } from 'rxjs';
import { takeUntil, withLatestFrom, map, distinctUntilChanged, shareReplay, take, tap, catchError, observeOn, } from 'rxjs/operators';
import { debounceSync } from './debounce-sync';
import { Injectable, Optional, InjectionToken, Inject, isDevMode, } from '@angular/core';
import { isOnStateInitDefined, isOnStoreInitDefined } from './lifecycle_hooks';
import * as i0 from "@angular/core";
export const INITIAL_STATE_TOKEN = new InjectionToken('@ngrx/component-store Initial State');
export class ComponentStore {
    constructor(defaultState) {
        // Should be used only in ngOnDestroy.
        this.destroySubject$ = new ReplaySubject(1);
        // Exposed to any extending Store to be used for the teardown.
        this.destroy$ = this.destroySubject$.asObservable();
        this.stateSubject$ = new ReplaySubject(1);
        this.isInitialized = false;
        // Needs to be after destroy$ is declared because it's used in select.
        this.state$ = this.select((s) => s);
        this.ɵhasProvider = false;
        // State can be initialized either through constructor or setState.
        if (defaultState) {
            this.initState(defaultState);
        }
        this.checkProviderForHooks();
    }
    /** Completes all relevant Observable streams. */
    ngOnDestroy() {
        this.stateSubject$.complete();
        this.destroySubject$.next();
    }
    /**
     * Creates an updater.
     *
     * Throws an error if updater is called with synchronous values (either
     * imperative value or Observable that is synchronous) before ComponentStore
     * is initialized. If called with async Observable before initialization then
     * state will not be updated and subscription would be closed.
     *
     * @param updaterFn A static updater function that takes 2 parameters (the
     * current state and an argument object) and returns a new instance of the
     * state.
     * @return A function that accepts one argument which is forwarded as the
     *     second argument to `updaterFn`. Every time this function is called
     *     subscribers will be notified of the state change.
     */
    updater(updaterFn) {
        return ((observableOrValue) => {
            // We need to explicitly throw an error if a synchronous error occurs.
            // This is necessary to make synchronous errors catchable.
            let isSyncUpdate = true;
            let syncError;
            // We can receive either the value or an observable. In case it's a
            // simple value, we'll wrap it with `of` operator to turn it into
            // Observable.
            const observable$ = isObservable(observableOrValue)
                ? observableOrValue
                : of(observableOrValue);
            const subscription = observable$
                .pipe(
            // Push the value into queueScheduler
            observeOn(queueScheduler), 
            // If the state is not initialized yet, we'll throw an error.
            tap(() => this.assertStateIsInitialized()), withLatestFrom(this.stateSubject$), 
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            map(([value, currentState]) => updaterFn(currentState, value)), tap((newState) => this.stateSubject$.next(newState)), catchError((error) => {
                if (isSyncUpdate) {
                    syncError = error;
                    return EMPTY;
                }
                return throwError(() => error);
            }), takeUntil(this.destroy$))
                .subscribe();
            if (syncError) {
                throw syncError;
            }
            isSyncUpdate = false;
            return subscription;
        });
    }
    /**
     * Initializes state. If it was already initialized then it resets the
     * state.
     */
    initState(state) {
        scheduled([state], queueScheduler).subscribe((s) => {
            this.isInitialized = true;
            this.stateSubject$.next(s);
        });
    }
    /**
     * Sets the state specific value.
     * @param stateOrUpdaterFn object of the same type as the state or an
     * updaterFn, returning such object.
     */
    setState(stateOrUpdaterFn) {
        if (typeof stateOrUpdaterFn !== 'function') {
            this.initState(stateOrUpdaterFn);
        }
        else {
            this.updater(stateOrUpdaterFn)();
        }
    }
    /**
     * Patches the state with provided partial state.
     *
     * @param partialStateOrUpdaterFn a partial state or a partial updater
     * function that accepts the state and returns the partial state.
     * @throws Error if the state is not initialized.
     */
    patchState(partialStateOrUpdaterFn) {
        const patchedState = typeof partialStateOrUpdaterFn === 'function'
            ? partialStateOrUpdaterFn(this.get())
            : partialStateOrUpdaterFn;
        this.updater((state, partialState) => ({
            ...state,
            ...partialState,
        }))(patchedState);
    }
    get(projector) {
        this.assertStateIsInitialized();
        let value;
        this.stateSubject$.pipe(take(1)).subscribe((state) => {
            value = projector ? projector(state) : state;
        });
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return value;
    }
    select(...args) {
        const { observables, projector, config } = processSelectorArgs(args);
        let observable$;
        // If there are no Observables to combine, then we'll just map the value.
        if (observables.length === 0) {
            observable$ = this.stateSubject$.pipe(config.debounce ? debounceSync() : (source$) => source$, map((state) => projector(state)));
        }
        else {
            // If there are multiple arguments, then we're aggregating selectors, so we need
            // to take the combineLatest of them before calling the map function.
            observable$ = combineLatest(observables).pipe(config.debounce ? debounceSync() : (source$) => source$, map((projectorArgs) => projector(...projectorArgs)));
        }
        return observable$.pipe(distinctUntilChanged(), shareReplay({
            refCount: true,
            bufferSize: 1,
        }), takeUntil(this.destroy$));
    }
    /**
     * Creates an effect.
     *
     * This effect is subscribed to throughout the lifecycle of the ComponentStore.
     * @param generator A function that takes an origin Observable input and
     *     returns an Observable. The Observable that is returned will be
     *     subscribed to for the life of the component.
     * @return A function that, when called, will trigger the origin Observable.
     */
    effect(generator) {
        const origin$ = new Subject();
        generator(origin$)
            // tied to the lifecycle 👇 of ComponentStore
            .pipe(takeUntil(this.destroy$))
            .subscribe();
        return ((observableOrValue) => {
            const observable$ = isObservable(observableOrValue)
                ? observableOrValue
                : of(observableOrValue);
            return observable$.pipe(takeUntil(this.destroy$)).subscribe((value) => {
                // any new 👇 value is pushed into a stream
                origin$.next(value);
            });
        });
    }
    /**
     * Used to check if lifecycle hooks are defined
     * but not used with provideComponentStore()
     */
    checkProviderForHooks() {
        asapScheduler.schedule(() => {
            if (isDevMode() &&
                (isOnStoreInitDefined(this) || isOnStateInitDefined(this)) &&
                !this.ɵhasProvider) {
                const warnings = [
                    isOnStoreInitDefined(this) ? 'OnStoreInit' : '',
                    isOnStateInitDefined(this) ? 'OnStateInit' : '',
                ].filter((defined) => defined);
                console.warn(`@ngrx/component-store: ${this.constructor.name} has the ${warnings.join(' and ')} ` +
                    'lifecycle hook(s) implemented without being provided using the ' +
                    `provideComponentStore(${this.constructor.name}) function. ` +
                    `To resolve this, provide the component store via provideComponentStore(${this.constructor.name})`);
            }
        });
    }
    assertStateIsInitialized() {
        if (!this.isInitialized) {
            throw new Error(`${this.constructor.name} has not been initialized yet. ` +
                `Please make sure it is initialized before updating/getting.`);
        }
    }
}
/** @nocollapse */ ComponentStore.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.2", ngImport: i0, type: ComponentStore, deps: [{ token: INITIAL_STATE_TOKEN, optional: true }], target: i0.ɵɵFactoryTarget.Injectable });
/** @nocollapse */ ComponentStore.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.2.2", ngImport: i0, type: ComponentStore });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.2", ngImport: i0, type: ComponentStore, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [INITIAL_STATE_TOKEN]
                }] }]; } });
function processSelectorArgs(args) {
    const selectorArgs = Array.from(args);
    // Assign default values.
    let config = { debounce: false };
    let projector;
    // Last argument is either projector or config
    const projectorOrConfig = selectorArgs.pop();
    if (typeof projectorOrConfig !== 'function') {
        // We got the config as the last argument, replace any default values with it.
        config = { ...config, ...projectorOrConfig };
        // Pop the next args, which would be the projector fn.
        projector = selectorArgs.pop();
    }
    else {
        projector = projectorOrConfig;
    }
    // The Observables to combine, if there are any.
    const observables = selectorArgs;
    return {
        observables,
        projector,
        config,
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50LXN0b3JlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vbW9kdWxlcy9jb21wb25lbnQtc3RvcmUvc3JjL2NvbXBvbmVudC1zdG9yZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQ0wsWUFBWSxFQUVaLEVBQUUsRUFDRixhQUFhLEVBRWIsVUFBVSxFQUNWLGFBQWEsRUFDYixPQUFPLEVBQ1AsY0FBYyxFQUNkLFNBQVMsRUFDVCxhQUFhLEVBQ2IsS0FBSyxHQUNOLE1BQU0sTUFBTSxDQUFDO0FBQ2QsT0FBTyxFQUNMLFNBQVMsRUFDVCxjQUFjLEVBQ2QsR0FBRyxFQUNILG9CQUFvQixFQUNwQixXQUFXLEVBQ1gsSUFBSSxFQUNKLEdBQUcsRUFDSCxVQUFVLEVBQ1YsU0FBUyxHQUNWLE1BQU0sZ0JBQWdCLENBQUM7QUFDeEIsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQy9DLE9BQU8sRUFDTCxVQUFVLEVBRVYsUUFBUSxFQUNSLGNBQWMsRUFDZCxNQUFNLEVBQ04sU0FBUyxHQUNWLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxvQkFBb0IsRUFBRSxNQUFNLG1CQUFtQixDQUFDOztBQU0vRSxNQUFNLENBQUMsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLGNBQWMsQ0FDbkQscUNBQXFDLENBQ3RDLENBQUM7QUFhRixNQUFNLE9BQU8sY0FBYztJQVl6QixZQUFxRCxZQUFnQjtRQVhyRSxzQ0FBc0M7UUFDckIsb0JBQWUsR0FBRyxJQUFJLGFBQWEsQ0FBTyxDQUFDLENBQUMsQ0FBQztRQUM5RCw4REFBOEQ7UUFDckQsYUFBUSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxFQUFFLENBQUM7UUFFdkMsa0JBQWEsR0FBRyxJQUFJLGFBQWEsQ0FBSSxDQUFDLENBQUMsQ0FBQztRQUNqRCxrQkFBYSxHQUFHLEtBQUssQ0FBQztRQUM5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QyxhQUFhLEVBQUU7WUFDdkIsTUFBTSxJQUFJLEtBQUssQ0FDYixHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxpQ0FBaUM7Z0JBQ3ZELDZEQUE2RCxDQUNoRSxDQUFDO1NBQ0g7SUFDSCxDQUFDOzs4SEE1U1UsY0FBYyxrQkFZTyxtQkFBbUI7a0lBWnhDLGNBQWM7MkZBQWQsY0FBYztrQkFEMUIsVUFBVTs7MEJBYUksUUFBUTs7MEJBQUksTUFBTTsyQkFBQyxtQkFBbUI7O0FBbVNyRCxTQUFTLG1CQUFtQixDQUsxQixJQUFlO0lBTWYsTUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN0Qyx5QkFBeUI7SUFDekIsSUFBSSxNQUFNLEdBQTJCLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxDQUFDO0lBQ3pELElBQUksU0FBc0IsQ0FBQztJQUMzQiw4Q0FBOEM7SUFDOUMsTUFBTSxpQkFBaUIsR0FBRyxZQUFZLENBQUMsR0FBRyxFQUFnQyxDQUFDO0lBRTNFLElBQUksT0FBTyxpQkFBaUIsS0FBSyxVQUFVLEVBQUU7UUFDM0MsOEVBQThFO1FBQzlFLE1BQU0sR0FBRyxFQUFFLEdBQUcsTUFBTSxFQUFFLEdBQUcsaUJBQWlCLEVBQUUsQ0FBQztRQUM3QyxzREFBc0Q7UUFDdEQsU0FBUyxHQUFHLFlBQVksQ0FBQyxHQUFHLEVBQWlCLENBQUM7S0FDL0M7U0FBTTtRQUNMLFNBQVMsR0FBRyxpQkFBaUIsQ0FBQztLQUMvQjtJQUNELGdEQUFnRDtJQUNoRCxNQUFNLFdBQVcsR0FBRyxZQUFxQyxDQUFDO0lBQzFELE9BQU87UUFDTCxXQUFXO1FBQ1gsU0FBUztRQUNULE1BQU07S0FDUCxDQUFDO0FBQ0osQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIGlzT2JzZXJ2YWJsZSxcbiAgT2JzZXJ2YWJsZSxcbiAgb2YsXG4gIFJlcGxheVN1YmplY3QsXG4gIFN1YnNjcmlwdGlvbixcbiAgdGhyb3dFcnJvcixcbiAgY29tYmluZUxhdGVzdCxcbiAgU3ViamVjdCxcbiAgcXVldWVTY2hlZHVsZXIsXG4gIHNjaGVkdWxlZCxcbiAgYXNhcFNjaGVkdWxlcixcbiAgRU1QVFksXG59IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtcbiAgdGFrZVVudGlsLFxuICB3aXRoTGF0ZXN0RnJvbSxcbiAgbWFwLFxuICBkaXN0aW5jdFVudGlsQ2hhbmdlZCxcbiAgc2hhcmVSZXBsYXksXG4gIHRha2UsXG4gIHRhcCxcbiAgY2F0Y2hFcnJvcixcbiAgb2JzZXJ2ZU9uLFxufSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQgeyBkZWJvdW5jZVN5bmMgfSBmcm9tICcuL2RlYm91bmNlLXN5bmMnO1xuaW1wb3J0IHtcbiAgSW5qZWN0YWJsZSxcbiAgT25EZXN0cm95LFxuICBPcHRpb25hbCxcbiAgSW5qZWN0aW9uVG9rZW4sXG4gIEluamVjdCxcbiAgaXNEZXZNb2RlLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IGlzT25TdGF0ZUluaXREZWZpbmVkLCBpc09uU3RvcmVJbml0RGVmaW5lZCB9IGZyb20gJy4vbGlmZWN5Y2xlX2hvb2tzJztcblxuZXhwb3J0IGludGVyZmFjZSBTZWxlY3RDb25maWcge1xuICBkZWJvdW5jZT86IGJvb2xlYW47XG59XG5cbmV4cG9ydCBjb25zdCBJTklUSUFMX1NUQVRFX1RPS0VOID0gbmV3IEluamVjdGlvblRva2VuKFxuICAnQG5ncngvY29tcG9uZW50LXN0b3JlIEluaXRpYWwgU3RhdGUnXG4pO1xuXG5leHBvcnQgdHlwZSBTZWxlY3RvclJlc3VsdHM8U2VsZWN0b3JzIGV4dGVuZHMgT2JzZXJ2YWJsZTx1bmtub3duPltdPiA9IHtcbiAgW0tleSBpbiBrZXlvZiBTZWxlY3RvcnNdOiBTZWxlY3RvcnNbS2V5XSBleHRlbmRzIE9ic2VydmFibGU8aW5mZXIgVT5cbiAgICA/IFVcbiAgICA6IG5ldmVyO1xufTtcblxuZXhwb3J0IHR5cGUgUHJvamVjdG9yPFNlbGVjdG9ycyBleHRlbmRzIE9ic2VydmFibGU8dW5rbm93bj5bXSwgUmVzdWx0PiA9IChcbiAgLi4uYXJnczogU2VsZWN0b3JSZXN1bHRzPFNlbGVjdG9ycz5cbikgPT4gUmVzdWx0O1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQ29tcG9uZW50U3RvcmU8VCBleHRlbmRzIG9iamVjdD4gaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICAvLyBTaG91bGQgYmUgdXNlZCBvbmx5IGluIG5nT25EZXN0cm95LlxuICBwcml2YXRlIHJlYWRvbmx5IGRlc3Ryb3lTdWJqZWN0JCA9IG5ldyBSZXBsYXlTdWJqZWN0PHZvaWQ+KDEpO1xuICAvLyBFeHBvc2VkIHRvIGFueSBleHRlbmRpbmcgU3RvcmUgdG8gYmUgdXNlZCBmb3IgdGhlIHRlYXJkb3duLlxuICByZWFkb25seSBkZXN0cm95JCA9IHRoaXMuZGVzdHJveVN1YmplY3QkLmFzT2JzZXJ2YWJsZSgpO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgc3RhdGVTdWJqZWN0JCA9IG5ldyBSZXBsYXlTdWJqZWN0PFQ+KDEpO1xuICBwcml2YXRlIGlzSW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgLy8gTmVlZHMgdG8gYmUgYWZ0ZXIgZGVzdHJveSQgaXMgZGVjbGFyZWQgYmVjYXVzZSBpdCdzIHVzZWQgaW4gc2VsZWN0LlxuICByZWFkb25seSBzdGF0ZSQ6IE9ic2VydmFibGU8VD4gPSB0aGlzLnNlbGVjdCgocykgPT4gcyk7XG4gIHByaXZhdGUgybVoYXNQcm92aWRlciA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKEBPcHRpb25hbCgpIEBJbmplY3QoSU5JVElBTF9TVEFURV9UT0tFTikgZGVmYXVsdFN0YXRlPzogVCkge1xuICAgIC8vIFN0YXRlIGNhbiBiZSBpbml0aWFsaXplZCBlaXRoZXIgdGhyb3VnaCBjb25zdHJ1Y3RvciBvciBzZXRTdGF0ZS5cbiAgICBpZiAoZGVmYXVsdFN0YXRlKSB7XG4gICAgICB0aGlzLmluaXRTdGF0ZShkZWZhdWx0U3RhdGUpO1xuICAgIH1cblxuICAgIHRoaXMuY2hlY2tQcm92aWRlckZvckhvb2tzKCk7XG4gIH1cblxuICAvKiogQ29tcGxldGVzIGFsbCByZWxldmFudCBPYnNlcnZhYmxlIHN0cmVhbXMuICovXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuc3RhdGVTdWJqZWN0JC5jb21wbGV0ZSgpO1xuICAgIHRoaXMuZGVzdHJveVN1YmplY3QkLm5leHQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIHVwZGF0ZXIuXG4gICAqXG4gICAqIFRocm93cyBhbiBlcnJvciBpZiB1cGRhdGVyIGlzIGNhbGxlZCB3aXRoIHN5bmNocm9ub3VzIHZhbHVlcyAoZWl0aGVyXG4gICAqIGltcGVyYXRpdmUgdmFsdWUgb3IgT2JzZXJ2YWJsZSB0aGF0IGlzIHN5bmNocm9ub3VzKSBiZWZvcmUgQ29tcG9uZW50U3RvcmVcbiAgICogaXMgaW5pdGlhbGl6ZWQuIElmIGNhbGxlZCB3aXRoIGFzeW5jIE9ic2VydmFibGUgYmVmb3JlIGluaXRpYWxpemF0aW9uIHRoZW5cbiAgICogc3RhdGUgd2lsbCBub3QgYmUgdXBkYXRlZCBhbmQgc3Vic2NyaXB0aW9uIHdvdWxkIGJlIGNsb3NlZC5cbiAgICpcbiAgICogQHBhcmFtIHVwZGF0ZXJGbiBBIHN0YXRpYyB1cGRhdGVyIGZ1bmN0aW9uIHRoYXQgdGFrZXMgMiBwYXJhbWV0ZXJzICh0aGVcbiAgICogY3VycmVudCBzdGF0ZSBhbmQgYW4gYXJndW1lbnQgb2JqZWN0KSBhbmQgcmV0dXJucyBhIG5ldyBpbnN0YW5jZSBvZiB0aGVcbiAgICogc3RhdGUuXG4gICAqIEByZXR1cm4gQSBmdW5jdGlvbiB0aGF0IGFjY2VwdHMgb25lIGFyZ3VtZW50IHdoaWNoIGlzIGZvcndhcmRlZCBhcyB0aGVcbiAgICogICAgIHNlY29uZCBhcmd1bWVudCB0byBgdXBkYXRlckZuYC4gRXZlcnkgdGltZSB0aGlzIGZ1bmN0aW9uIGlzIGNhbGxlZFxuICAgKiAgICAgc3Vic2NyaWJlcnMgd2lsbCBiZSBub3RpZmllZCBvZiB0aGUgc3RhdGUgY2hhbmdlLlxuICAgKi9cbiAgdXBkYXRlcjxcbiAgICAvLyBBbGxvdyB0byBmb3JjZS1wcm92aWRlIHRoZSB0eXBlXG4gICAgUHJvdmlkZWRUeXBlID0gdm9pZCxcbiAgICAvLyBUaGlzIHR5cGUgaXMgZGVyaXZlZCBmcm9tIHRoZSBgdmFsdWVgIHByb3BlcnR5LCBkZWZhdWx0aW5nIHRvIHZvaWQgaWYgaXQncyBtaXNzaW5nXG4gICAgT3JpZ2luVHlwZSA9IFByb3ZpZGVkVHlwZSxcbiAgICAvLyBUaGUgVmFsdWUgdHlwZSBpcyBhc3NpZ25lZCBmcm9tIHRoZSBPcmlnaW5cbiAgICBWYWx1ZVR5cGUgPSBPcmlnaW5UeXBlLFxuICAgIC8vIFJldHVybiBlaXRoZXIgYW4gZW1wdHkgY2FsbGJhY2sgb3IgYSBmdW5jdGlvbiByZXF1aXJpbmcgc3BlY2lmaWMgdHlwZXMgYXMgaW5wdXRzXG4gICAgUmV0dXJuVHlwZSA9IE9yaWdpblR5cGUgZXh0ZW5kcyB2b2lkXG4gICAgICA/ICgpID0+IHZvaWRcbiAgICAgIDogKG9ic2VydmFibGVPclZhbHVlOiBWYWx1ZVR5cGUgfCBPYnNlcnZhYmxlPFZhbHVlVHlwZT4pID0+IFN1YnNjcmlwdGlvblxuICA+KHVwZGF0ZXJGbjogKHN0YXRlOiBULCB2YWx1ZTogT3JpZ2luVHlwZSkgPT4gVCk6IFJldHVyblR5cGUge1xuICAgIHJldHVybiAoKFxuICAgICAgb2JzZXJ2YWJsZU9yVmFsdWU/OiBPcmlnaW5UeXBlIHwgT2JzZXJ2YWJsZTxPcmlnaW5UeXBlPlxuICAgICk6IFN1YnNjcmlwdGlvbiA9PiB7XG4gICAgICAvLyBXZSBuZWVkIHRvIGV4cGxpY2l0bHkgdGhyb3cgYW4gZXJyb3IgaWYgYSBzeW5jaHJvbm91cyBlcnJvciBvY2N1cnMuXG4gICAgICAvLyBUaGlzIGlzIG5lY2Vzc2FyeSB0byBtYWtlIHN5bmNocm9ub3VzIGVycm9ycyBjYXRjaGFibGUuXG4gICAgICBsZXQgaXNTeW5jVXBkYXRlID0gdHJ1ZTtcbiAgICAgIGxldCBzeW5jRXJyb3I6IHVua25vd247XG4gICAgICAvLyBXZSBjYW4gcmVjZWl2ZSBlaXRoZXIgdGhlIHZhbHVlIG9yIGFuIG9ic2VydmFibGUuIEluIGNhc2UgaXQncyBhXG4gICAgICAvLyBzaW1wbGUgdmFsdWUsIHdlJ2xsIHdyYXAgaXQgd2l0aCBgb2ZgIG9wZXJhdG9yIHRvIHR1cm4gaXQgaW50b1xuICAgICAgLy8gT2JzZXJ2YWJsZS5cbiAgICAgIGNvbnN0IG9ic2VydmFibGUkID0gaXNPYnNlcnZhYmxlKG9ic2VydmFibGVPclZhbHVlKVxuICAgICAgICA/IG9ic2VydmFibGVPclZhbHVlXG4gICAgICAgIDogb2Yob2JzZXJ2YWJsZU9yVmFsdWUpO1xuICAgICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gb2JzZXJ2YWJsZSRcbiAgICAgICAgLnBpcGUoXG4gICAgICAgICAgLy8gUHVzaCB0aGUgdmFsdWUgaW50byBxdWV1ZVNjaGVkdWxlclxuICAgICAgICAgIG9ic2VydmVPbihxdWV1ZVNjaGVkdWxlciksXG4gICAgICAgICAgLy8gSWYgdGhlIHN0YXRlIGlzIG5vdCBpbml0aWFsaXplZCB5ZXQsIHdlJ2xsIHRocm93IGFuIGVycm9yLlxuICAgICAgICAgIHRhcCgoKSA9PiB0aGlzLmFzc2VydFN0YXRlSXNJbml0aWFsaXplZCgpKSxcbiAgICAgICAgICB3aXRoTGF0ZXN0RnJvbSh0aGlzLnN0YXRlU3ViamVjdCQpLFxuICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tbm9uLW51bGwtYXNzZXJ0aW9uXG4gICAgICAgICAgbWFwKChbdmFsdWUsIGN1cnJlbnRTdGF0ZV0pID0+IHVwZGF0ZXJGbihjdXJyZW50U3RhdGUsIHZhbHVlISkpLFxuICAgICAgICAgIHRhcCgobmV3U3RhdGUpID0+IHRoaXMuc3RhdGVTdWJqZWN0JC5uZXh0KG5ld1N0YXRlKSksXG4gICAgICAgICAgY2F0Y2hFcnJvcigoZXJyb3I6IHVua25vd24pID0+IHtcbiAgICAgICAgICAgIGlmIChpc1N5bmNVcGRhdGUpIHtcbiAgICAgICAgICAgICAgc3luY0Vycm9yID0gZXJyb3I7XG4gICAgICAgICAgICAgIHJldHVybiBFTVBUWTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRocm93RXJyb3IoKCkgPT4gZXJyb3IpO1xuICAgICAgICAgIH0pLFxuICAgICAgICAgIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3kkKVxuICAgICAgICApXG4gICAgICAgIC5zdWJzY3JpYmUoKTtcblxuICAgICAgaWYgKHN5bmNFcnJvcikge1xuICAgICAgICB0aHJvdyBzeW5jRXJyb3I7XG4gICAgICB9XG4gICAgICBpc1N5bmNVcGRhdGUgPSBmYWxzZTtcblxuICAgICAgcmV0dXJuIHN1YnNjcmlwdGlvbjtcbiAgICB9KSBhcyB1bmtub3duIGFzIFJldHVyblR5cGU7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgc3RhdGUuIElmIGl0IHdhcyBhbHJlYWR5IGluaXRpYWxpemVkIHRoZW4gaXQgcmVzZXRzIHRoZVxuICAgKiBzdGF0ZS5cbiAgICovXG4gIHByaXZhdGUgaW5pdFN0YXRlKHN0YXRlOiBUKTogdm9pZCB7XG4gICAgc2NoZWR1bGVkKFtzdGF0ZV0sIHF1ZXVlU2NoZWR1bGVyKS5zdWJzY3JpYmUoKHMpID0+IHtcbiAgICAgIHRoaXMuaXNJbml0aWFsaXplZCA9IHRydWU7XG4gICAgICB0aGlzLnN0YXRlU3ViamVjdCQubmV4dChzKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBzdGF0ZSBzcGVjaWZpYyB2YWx1ZS5cbiAgICogQHBhcmFtIHN0YXRlT3JVcGRhdGVyRm4gb2JqZWN0IG9mIHRoZSBzYW1lIHR5cGUgYXMgdGhlIHN0YXRlIG9yIGFuXG4gICAqIHVwZGF0ZXJGbiwgcmV0dXJuaW5nIHN1Y2ggb2JqZWN0LlxuICAgKi9cbiAgc2V0U3RhdGUoc3RhdGVPclVwZGF0ZXJGbjogVCB8ICgoc3RhdGU6IFQpID0+IFQpKTogdm9pZCB7XG4gICAgaWYgKHR5cGVvZiBzdGF0ZU9yVXBkYXRlckZuICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLmluaXRTdGF0ZShzdGF0ZU9yVXBkYXRlckZuKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy51cGRhdGVyKHN0YXRlT3JVcGRhdGVyRm4gYXMgKHN0YXRlOiBUKSA9PiBUKSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBQYXRjaGVzIHRoZSBzdGF0ZSB3aXRoIHByb3ZpZGVkIHBhcnRpYWwgc3RhdGUuXG4gICAqXG4gICAqIEBwYXJhbSBwYXJ0aWFsU3RhdGVPclVwZGF0ZXJGbiBhIHBhcnRpYWwgc3RhdGUgb3IgYSBwYXJ0aWFsIHVwZGF0ZXJcbiAgICogZnVuY3Rpb24gdGhhdCBhY2NlcHRzIHRoZSBzdGF0ZSBhbmQgcmV0dXJucyB0aGUgcGFydGlhbCBzdGF0ZS5cbiAgICogQHRocm93cyBFcnJvciBpZiB0aGUgc3RhdGUgaXMgbm90IGluaXRpYWxpemVkLlxuICAgKi9cbiAgcGF0Y2hTdGF0ZShcbiAgICBwYXJ0aWFsU3RhdGVPclVwZGF0ZXJGbjpcbiAgICAgIHwgUGFydGlhbDxUPlxuICAgICAgfCBPYnNlcnZhYmxlPFBhcnRpYWw8VD4+XG4gICAgICB8ICgoc3RhdGU6IFQpID0+IFBhcnRpYWw8VD4pXG4gICk6IHZvaWQge1xuICAgIGNvbnN0IHBhdGNoZWRTdGF0ZSA9XG4gICAgICB0eXBlb2YgcGFydGlhbFN0YXRlT3JVcGRhdGVyRm4gPT09ICdmdW5jdGlvbidcbiAgICAgICAgPyBwYXJ0aWFsU3RhdGVPclVwZGF0ZXJGbih0aGlzLmdldCgpKVxuICAgICAgICA6IHBhcnRpYWxTdGF0ZU9yVXBkYXRlckZuO1xuXG4gICAgdGhpcy51cGRhdGVyKChzdGF0ZSwgcGFydGlhbFN0YXRlOiBQYXJ0aWFsPFQ+KSA9PiAoe1xuICAgICAgLi4uc3RhdGUsXG4gICAgICAuLi5wYXJ0aWFsU3RhdGUsXG4gICAgfSkpKHBhdGNoZWRTdGF0ZSk7XG4gIH1cblxuICBwcm90ZWN0ZWQgZ2V0KCk6IFQ7XG4gIHByb3RlY3RlZCBnZXQ8Uj4ocHJvamVjdG9yOiAoczogVCkgPT4gUik6IFI7XG4gIHByb3RlY3RlZCBnZXQ8Uj4ocHJvamVjdG9yPzogKHM6IFQpID0+IFIpOiBSIHwgVCB7XG4gICAgdGhpcy5hc3NlcnRTdGF0ZUlzSW5pdGlhbGl6ZWQoKTtcbiAgICBsZXQgdmFsdWU6IFIgfCBUO1xuXG4gICAgdGhpcy5zdGF0ZVN1YmplY3QkLnBpcGUodGFrZSgxKSkuc3Vic2NyaWJlKChzdGF0ZSkgPT4ge1xuICAgICAgdmFsdWUgPSBwcm9qZWN0b3IgPyBwcm9qZWN0b3Ioc3RhdGUpIDogc3RhdGU7XG4gICAgfSk7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1ub24tbnVsbC1hc3NlcnRpb25cbiAgICByZXR1cm4gdmFsdWUhO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBzZWxlY3Rvci5cbiAgICpcbiAgICogQHBhcmFtIHByb2plY3RvciBBIHB1cmUgcHJvamVjdGlvbiBmdW5jdGlvbiB0aGF0IHRha2VzIHRoZSBjdXJyZW50IHN0YXRlIGFuZFxuICAgKiAgIHJldHVybnMgc29tZSBuZXcgc2xpY2UvcHJvamVjdGlvbiBvZiB0aGF0IHN0YXRlLlxuICAgKiBAcGFyYW0gY29uZmlnIFNlbGVjdENvbmZpZyB0aGF0IGNoYW5nZXMgdGhlIGJlaGF2aW9yIG9mIHNlbGVjdG9yLCBpbmNsdWRpbmdcbiAgICogICB0aGUgZGVib3VuY2luZyBvZiB0aGUgdmFsdWVzIHVudGlsIHRoZSBzdGF0ZSBpcyBzZXR0bGVkLlxuICAgKiBAcmV0dXJuIEFuIG9ic2VydmFibGUgb2YgdGhlIHByb2plY3RvciByZXN1bHRzLlxuICAgKi9cbiAgc2VsZWN0PFJlc3VsdD4oXG4gICAgcHJvamVjdG9yOiAoczogVCkgPT4gUmVzdWx0LFxuICAgIGNvbmZpZz86IFNlbGVjdENvbmZpZ1xuICApOiBPYnNlcnZhYmxlPFJlc3VsdD47XG4gIHNlbGVjdDxTZWxlY3RvcnMgZXh0ZW5kcyBPYnNlcnZhYmxlPHVua25vd24+W10sIFJlc3VsdD4oXG4gICAgLi4uYXJnczogWy4uLnNlbGVjdG9yczogU2VsZWN0b3JzLCBwcm9qZWN0b3I6IFByb2plY3RvcjxTZWxlY3RvcnMsIFJlc3VsdD5dXG4gICk6IE9ic2VydmFibGU8UmVzdWx0PjtcbiAgc2VsZWN0PFNlbGVjdG9ycyBleHRlbmRzIE9ic2VydmFibGU8dW5rbm93bj5bXSwgUmVzdWx0PihcbiAgICAuLi5hcmdzOiBbXG4gICAgICAuLi5zZWxlY3RvcnM6IFNlbGVjdG9ycyxcbiAgICAgIHByb2plY3RvcjogUHJvamVjdG9yPFNlbGVjdG9ycywgUmVzdWx0PixcbiAgICAgIGNvbmZpZzogU2VsZWN0Q29uZmlnXG4gICAgXVxuICApOiBPYnNlcnZhYmxlPFJlc3VsdD47XG4gIHNlbGVjdDxcbiAgICBTZWxlY3RvcnMgZXh0ZW5kcyBBcnJheTxPYnNlcnZhYmxlPHVua25vd24+IHwgU2VsZWN0Q29uZmlnIHwgUHJvamVjdG9yRm4+LFxuICAgIFJlc3VsdCxcbiAgICBQcm9qZWN0b3JGbiBleHRlbmRzICguLi5hOiB1bmtub3duW10pID0+IFJlc3VsdFxuICA+KC4uLmFyZ3M6IFNlbGVjdG9ycyk6IE9ic2VydmFibGU8UmVzdWx0PiB7XG4gICAgY29uc3QgeyBvYnNlcnZhYmxlcywgcHJvamVjdG9yLCBjb25maWcgfSA9IHByb2Nlc3NTZWxlY3RvckFyZ3M8XG4gICAgICBTZWxlY3RvcnMsXG4gICAgICBSZXN1bHQsXG4gICAgICBQcm9qZWN0b3JGblxuICAgID4oYXJncyk7XG5cbiAgICBsZXQgb2JzZXJ2YWJsZSQ6IE9ic2VydmFibGU8UmVzdWx0PjtcbiAgICAvLyBJZiB0aGVyZSBhcmUgbm8gT2JzZXJ2YWJsZXMgdG8gY29tYmluZSwgdGhlbiB3ZSdsbCBqdXN0IG1hcCB0aGUgdmFsdWUuXG4gICAgaWYgKG9ic2VydmFibGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgb2JzZXJ2YWJsZSQgPSB0aGlzLnN0YXRlU3ViamVjdCQucGlwZShcbiAgICAgICAgY29uZmlnLmRlYm91bmNlID8gZGVib3VuY2VTeW5jKCkgOiAoc291cmNlJCkgPT4gc291cmNlJCxcbiAgICAgICAgbWFwKChzdGF0ZSkgPT4gcHJvamVjdG9yKHN0YXRlKSlcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIElmIHRoZXJlIGFyZSBtdWx0aXBsZSBhcmd1bWVudHMsIHRoZW4gd2UncmUgYWdncmVnYXRpbmcgc2VsZWN0b3JzLCBzbyB3ZSBuZWVkXG4gICAgICAvLyB0byB0YWtlIHRoZSBjb21iaW5lTGF0ZXN0IG9mIHRoZW0gYmVmb3JlIGNhbGxpbmcgdGhlIG1hcCBmdW5jdGlvbi5cbiAgICAgIG9ic2VydmFibGUkID0gY29tYmluZUxhdGVzdChvYnNlcnZhYmxlcykucGlwZShcbiAgICAgICAgY29uZmlnLmRlYm91bmNlID8gZGVib3VuY2VTeW5jKCkgOiAoc291cmNlJCkgPT4gc291cmNlJCxcbiAgICAgICAgbWFwKChwcm9qZWN0b3JBcmdzKSA9PiBwcm9qZWN0b3IoLi4ucHJvamVjdG9yQXJncykpXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiBvYnNlcnZhYmxlJC5waXBlKFxuICAgICAgZGlzdGluY3RVbnRpbENoYW5nZWQoKSxcbiAgICAgIHNoYXJlUmVwbGF5KHtcbiAgICAgICAgcmVmQ291bnQ6IHRydWUsXG4gICAgICAgIGJ1ZmZlclNpemU6IDEsXG4gICAgICB9KSxcbiAgICAgIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3kkKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiBlZmZlY3QuXG4gICAqXG4gICAqIFRoaXMgZWZmZWN0IGlzIHN1YnNjcmliZWQgdG8gdGhyb3VnaG91dCB0aGUgbGlmZWN5Y2xlIG9mIHRoZSBDb21wb25lbnRTdG9yZS5cbiAgICogQHBhcmFtIGdlbmVyYXRvciBBIGZ1bmN0aW9uIHRoYXQgdGFrZXMgYW4gb3JpZ2luIE9ic2VydmFibGUgaW5wdXQgYW5kXG4gICAqICAgICByZXR1cm5zIGFuIE9ic2VydmFibGUuIFRoZSBPYnNlcnZhYmxlIHRoYXQgaXMgcmV0dXJuZWQgd2lsbCBiZVxuICAgKiAgICAgc3Vic2NyaWJlZCB0byBmb3IgdGhlIGxpZmUgb2YgdGhlIGNvbXBvbmVudC5cbiAgICogQHJldHVybiBBIGZ1bmN0aW9uIHRoYXQsIHdoZW4gY2FsbGVkLCB3aWxsIHRyaWdnZXIgdGhlIG9yaWdpbiBPYnNlcnZhYmxlLlxuICAgKi9cbiAgZWZmZWN0PFxuICAgIC8vIFRoaXMgdHlwZSBxdWlja2x5IGJlY2FtZSBwYXJ0IG9mIGVmZmVjdCAnQVBJJ1xuICAgIFByb3ZpZGVkVHlwZSA9IHZvaWQsXG4gICAgLy8gVGhlIGFjdHVhbCBvcmlnaW4kIHR5cGUsIHdoaWNoIGNvdWxkIGJlIHVua25vd24sIHdoZW4gbm90IHNwZWNpZmllZFxuICAgIE9yaWdpblR5cGUgZXh0ZW5kc1xuICAgICAgfCBPYnNlcnZhYmxlPFByb3ZpZGVkVHlwZT5cbiAgICAgIHwgdW5rbm93biA9IE9ic2VydmFibGU8UHJvdmlkZWRUeXBlPixcbiAgICAvLyBVbndyYXBwZWQgYWN0dWFsIHR5cGUgb2YgdGhlIG9yaWdpbiQgT2JzZXJ2YWJsZSwgYWZ0ZXIgZGVmYXVsdCB3YXMgYXBwbGllZFxuICAgIE9ic2VydmFibGVUeXBlID0gT3JpZ2luVHlwZSBleHRlbmRzIE9ic2VydmFibGU8aW5mZXIgQT4gPyBBIDogbmV2ZXIsXG4gICAgLy8gUmV0dXJuIGVpdGhlciBhbiBvcHRpb25hbCBjYWxsYmFjayBvciBhIGZ1bmN0aW9uIHJlcXVpcmluZyBzcGVjaWZpYyB0eXBlcyBhcyBpbnB1dHNcbiAgICBSZXR1cm5UeXBlID0gUHJvdmlkZWRUeXBlIHwgT2JzZXJ2YWJsZVR5cGUgZXh0ZW5kcyB2b2lkXG4gICAgICA/IChcbiAgICAgICAgICBvYnNlcnZhYmxlT3JWYWx1ZT86IE9ic2VydmFibGVUeXBlIHwgT2JzZXJ2YWJsZTxPYnNlcnZhYmxlVHlwZT5cbiAgICAgICAgKSA9PiBTdWJzY3JpcHRpb25cbiAgICAgIDogKFxuICAgICAgICAgIG9ic2VydmFibGVPclZhbHVlOiBPYnNlcnZhYmxlVHlwZSB8IE9ic2VydmFibGU8T2JzZXJ2YWJsZVR5cGU+XG4gICAgICAgICkgPT4gU3Vic2NyaXB0aW9uXG4gID4oZ2VuZXJhdG9yOiAob3JpZ2luJDogT3JpZ2luVHlwZSkgPT4gT2JzZXJ2YWJsZTx1bmtub3duPik6IFJldHVyblR5cGUge1xuICAgIGNvbnN0IG9yaWdpbiQgPSBuZXcgU3ViamVjdDxPYnNlcnZhYmxlVHlwZT4oKTtcbiAgICBnZW5lcmF0b3Iob3JpZ2luJCBhcyBPcmlnaW5UeXBlKVxuICAgICAgLy8gdGllZCB0byB0aGUgbGlmZWN5Y2xlIPCfkYcgb2YgQ29tcG9uZW50U3RvcmVcbiAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLmRlc3Ryb3kkKSlcbiAgICAgIC5zdWJzY3JpYmUoKTtcblxuICAgIHJldHVybiAoKFxuICAgICAgb2JzZXJ2YWJsZU9yVmFsdWU/OiBPYnNlcnZhYmxlVHlwZSB8IE9ic2VydmFibGU8T2JzZXJ2YWJsZVR5cGU+XG4gICAgKTogU3Vic2NyaXB0aW9uID0+IHtcbiAgICAgIGNvbnN0IG9ic2VydmFibGUkID0gaXNPYnNlcnZhYmxlKG9ic2VydmFibGVPclZhbHVlKVxuICAgICAgICA/IG9ic2VydmFibGVPclZhbHVlXG4gICAgICAgIDogb2Yob2JzZXJ2YWJsZU9yVmFsdWUpO1xuICAgICAgcmV0dXJuIG9ic2VydmFibGUkLnBpcGUodGFrZVVudGlsKHRoaXMuZGVzdHJveSQpKS5zdWJzY3JpYmUoKHZhbHVlKSA9PiB7XG4gICAgICAgIC8vIGFueSBuZXcg8J+RhyB2YWx1ZSBpcyBwdXNoZWQgaW50byBhIHN0cmVhbVxuICAgICAgICBvcmlnaW4kLm5leHQodmFsdWUgYXMgT2JzZXJ2YWJsZVR5cGUpO1xuICAgICAgfSk7XG4gICAgfSkgYXMgdW5rbm93biBhcyBSZXR1cm5UeXBlO1xuICB9XG5cbiAgLyoqXG4gICAqIFVzZWQgdG8gY2hlY2sgaWYgbGlmZWN5Y2xlIGhvb2tzIGFyZSBkZWZpbmVkXG4gICAqIGJ1dCBub3QgdXNlZCB3aXRoIHByb3ZpZGVDb21wb25lbnRTdG9yZSgpXG4gICAqL1xuICBwcml2YXRlIGNoZWNrUHJvdmlkZXJGb3JIb29rcygpIHtcbiAgICBhc2FwU2NoZWR1bGVyLnNjaGVkdWxlKCgpID0+IHtcbiAgICAgIGlmIChcbiAgICAgICAgaXNEZXZNb2RlKCkgJiZcbiAgICAgICAgKGlzT25TdG9yZUluaXREZWZpbmVkKHRoaXMpIHx8IGlzT25TdGF0ZUluaXREZWZpbmVkKHRoaXMpKSAmJlxuICAgICAgICAhdGhpcy7JtWhhc1Byb3ZpZGVyXG4gICAgICApIHtcbiAgICAgICAgY29uc3Qgd2FybmluZ3MgPSBbXG4gICAgICAgICAgaXNPblN0b3JlSW5pdERlZmluZWQodGhpcykgPyAnT25TdG9yZUluaXQnIDogJycsXG4gICAgICAgICAgaXNPblN0YXRlSW5pdERlZmluZWQodGhpcykgPyAnT25TdGF0ZUluaXQnIDogJycsXG4gICAgICAgIF0uZmlsdGVyKChkZWZpbmVkKSA9PiBkZWZpbmVkKTtcblxuICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgYEBuZ3J4L2NvbXBvbmVudC1zdG9yZTogJHtcbiAgICAgICAgICAgIHRoaXMuY29uc3RydWN0b3IubmFtZVxuICAgICAgICAgIH0gaGFzIHRoZSAke3dhcm5pbmdzLmpvaW4oJyBhbmQgJyl9IGAgK1xuICAgICAgICAgICAgJ2xpZmVjeWNsZSBob29rKHMpIGltcGxlbWVudGVkIHdpdGhvdXQgYmVpbmcgcHJvdmlkZWQgdXNpbmcgdGhlICcgK1xuICAgICAgICAgICAgYHByb3ZpZGVDb21wb25lbnRTdG9yZSgke3RoaXMuY29uc3RydWN0b3IubmFtZX0pIGZ1bmN0aW9uLiBgICtcbiAgICAgICAgICAgIGBUbyByZXNvbHZlIHRoaXMsIHByb3ZpZGUgdGhlIGNvbXBvbmVudCBzdG9yZSB2aWEgcHJvdmlkZUNvbXBvbmVudFN0b3JlKCR7dGhpcy5jb25zdHJ1Y3Rvci5uYW1lfSlgXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGFzc2VydFN0YXRlSXNJbml0aWFsaXplZCgpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuaXNJbml0aWFsaXplZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9IGhhcyBub3QgYmVlbiBpbml0aWFsaXplZCB5ZXQuIGAgK1xuICAgICAgICAgIGBQbGVhc2UgbWFrZSBzdXJlIGl0IGlzIGluaXRpYWxpemVkIGJlZm9yZSB1cGRhdGluZy9nZXR0aW5nLmBcbiAgICAgICk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NTZWxlY3RvckFyZ3M8XG4gIFNlbGVjdG9ycyBleHRlbmRzIEFycmF5PE9ic2VydmFibGU8dW5rbm93bj4gfCBTZWxlY3RDb25maWcgfCBQcm9qZWN0b3JGbj4sXG4gIFJlc3VsdCxcbiAgUHJvamVjdG9yRm4gZXh0ZW5kcyAoLi4uYTogdW5rbm93bltdKSA9PiBSZXN1bHRcbj4oXG4gIGFyZ3M6IFNlbGVjdG9yc1xuKToge1xuICBvYnNlcnZhYmxlczogT2JzZXJ2YWJsZTx1bmtub3duPltdO1xuICBwcm9qZWN0b3I6IFByb2plY3RvckZuO1xuICBjb25maWc6IFJlcXVpcmVkPFNlbGVjdENvbmZpZz47XG59IHtcbiAgY29uc3Qgc2VsZWN0b3JBcmdzID0gQXJyYXkuZnJvbShhcmdzKTtcbiAgLy8gQXNzaWduIGRlZmF1bHQgdmFsdWVzLlxuICBsZXQgY29uZmlnOiBSZXF1aXJlZDxTZWxlY3RDb25maWc+ID0geyBkZWJvdW5jZTogZmFsc2UgfTtcbiAgbGV0IHByb2plY3RvcjogUHJvamVjdG9yRm47XG4gIC8vIExhc3QgYXJndW1lbnQgaXMgZWl0aGVyIHByb2plY3RvciBvciBjb25maWdcbiAgY29uc3QgcHJvamVjdG9yT3JDb25maWcgPSBzZWxlY3RvckFyZ3MucG9wKCkgYXMgUHJvamVjdG9yRm4gfCBTZWxlY3RDb25maWc7XG5cbiAgaWYgKHR5cGVvZiBwcm9qZWN0b3JPckNvbmZpZyAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIC8vIFdlIGdvdCB0aGUgY29uZmlnIGFzIHRoZSBsYXN0IGFyZ3VtZW50LCByZXBsYWNlIGFueSBkZWZhdWx0IHZhbHVlcyB3aXRoIGl0LlxuICAgIGNvbmZpZyA9IHsgLi4uY29uZmlnLCAuLi5wcm9qZWN0b3JPckNvbmZpZyB9O1xuICAgIC8vIFBvcCB0aGUgbmV4dCBhcmdzLCB3aGljaCB3b3VsZCBiZSB0aGUgcHJvamVjdG9yIGZuLlxuICAgIHByb2plY3RvciA9IHNlbGVjdG9yQXJncy5wb3AoKSBhcyBQcm9qZWN0b3JGbjtcbiAgfSBlbHNlIHtcbiAgICBwcm9qZWN0b3IgPSBwcm9qZWN0b3JPckNvbmZpZztcbiAgfVxuICAvLyBUaGUgT2JzZXJ2YWJsZXMgdG8gY29tYmluZSwgaWYgdGhlcmUgYXJlIGFueS5cbiAgY29uc3Qgb2JzZXJ2YWJsZXMgPSBzZWxlY3RvckFyZ3MgYXMgT2JzZXJ2YWJsZTx1bmtub3duPltdO1xuICByZXR1cm4ge1xuICAgIG9ic2VydmFibGVzLFxuICAgIHByb2plY3RvcixcbiAgICBjb25maWcsXG4gIH07XG59XG4iXX0=