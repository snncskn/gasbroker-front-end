import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { VehiclesService } from './vehicles.service';
import { Vehicle } from './vehicles.types';

@Injectable({
    providedIn: 'root'
})
export class VehiclesResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _vehiclesService: VehiclesService)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any[]>
    {
        return this._vehiclesService.getVehicles();
    }
}

@Injectable({
    providedIn: 'root'
})
export class VehiclesDetailsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _vehiclesService: VehiclesService,
        private _router: Router
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Vehicle>
    {
        return this._vehiclesService.getVehicleById(route.paramMap.get('id'))
                   .pipe(
                       // Error here means the requested customer is not available
                       catchError((error) => {

                           // Log the error
                           console.error(error);

                           // Get the parent url
                           const parentUrl = state.url.split('/').slice(0, -1).join('/');

                           // Navigate to there
                           this._router.navigateByUrl(parentUrl);

                           // Throw an error
                           return throwError(error);
                       })
                   );
    }
}