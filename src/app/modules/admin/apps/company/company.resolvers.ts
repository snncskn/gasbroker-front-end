import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CustomersService } from 'app/modules/admin/apps/company/company.service';
import { Company } from 'app/modules/admin/apps/company/company.types';

@Injectable({
    providedIn: 'root'
})
export class CustomersResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _customersService: CustomersService)
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Company[]>
    {
        return this._customersService.getCustomers();
    }
}

@Injectable({
    providedIn: 'root'
})
export class CustomersCustomerResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _customersService: CustomersService,
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Company>
    {
        return this._customersService.getCustomerById(route.paramMap.get('id'))
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

/*@Injectable({
    providedIn: 'root'
})
export class CustomersCountriesResolver implements Resolve<any>
{
    /**
     * Constructor
     
    constructor(private _customersService: CustomersService)
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
     
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Country[]>
    {
        return this._customersService.getCountries();
    }
}

@Injectable({
    providedIn: 'root'
})
export class CustomersTagsResolver implements Resolve<any>
{
    /*
     * Constructor
     
    constructor(private _customersService: CustomersService)
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
     
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Tag[]>
    {
        return this._customersService.getTags();
    }
}*/
