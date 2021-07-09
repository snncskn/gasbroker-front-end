import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProposalService } from './proposals.service';
import { Proposal } from './proposals.types';

@Injectable({
    providedIn: 'root'
})
export class ProposalResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _proposalService: ProposalService)
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Proposal[]>
    {
        return this._proposalService.getProposals();
    }
}

@Injectable({
    providedIn: 'root'
})
export class ProposalDetailsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _vehiclesService: ProposalService,
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Proposal>
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