import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { CustomersDetailsComponent } from 'app/modules/admin/apps/customers/details/details.component';

@Injectable({
    providedIn: 'root'
})
export class CanDeactivateCustomersDetails implements CanDeactivate<CustomersDetailsComponent>
{
    canDeactivate(
        component: CustomersDetailsComponent,
        currentRoute: ActivatedRouteSnapshot,
        currentState: RouterStateSnapshot,
        nextState: RouterStateSnapshot
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree
    {
        // Get the next route
        let nextRoute: ActivatedRouteSnapshot = nextState.root;
        while ( nextRoute.firstChild )
        {
            nextRoute = nextRoute.firstChild;
        }

        // If the next state doesn't contain '/customers'
        // it means we are navigating away from the
        // customers app
        if ( !nextState.url.includes('/customers') )
        {
            // Let it navigate
            return true;
        }

        // If we are navigating to another customer...
        if ( nextRoute.paramMap.get('id') )
        {
            // Just navigate
            return true;
        }
        // Otherwise...
        else
        {
            // Close the drawer first, and then navigate
            return component.closeDrawer().then(() => true);
        }
    }
}
