import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { InventoryPagination } from '../product/product.types';
import { GroupService } from './group.service';
import { Group } from './group.types';


@Injectable({
    providedIn: 'root'
})
export class GroupResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _groupService: GroupService,
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
   resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Group>
    {
        return this._groupService.getGroupById(route.paramMap.get('id'))
                   .pipe(
                       // Error here means the requested user is not available
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

@Injectable({
    providedIn: 'root'
})
export class GroupsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _groupService: GroupService)
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<{ pagination: InventoryPagination; groups: any[] }>
    {
        return this._groupService.getGroup();
    }
}