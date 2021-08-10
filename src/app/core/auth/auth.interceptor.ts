import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from 'app/core/auth/auth.service';
import { AuthUtils } from 'app/core/auth/auth.utils';

@Injectable()
export class AuthInterceptor implements HttpInterceptor
{
    /**
     * Constructor
     */
    constructor(private _authService: AuthService)
    {
    }

    /**
     * Intercept
     *
     * @param req
     * @param next
     */
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>
    {
        let newReq = req.clone();
        // Request
        //
        // If the access token didn't expire, add the Authorization header.
        // We won't add the Authorization header if the access token expired.
        // This will force the server to return a "401 Unauthorized" response
        // for the protected API routes which our response interceptor will
        // catch and delete the access token from the local storage while logging
        // the user out from the app.
        //&& !AuthUtils.isTokenExpired(this._authService.accessToken
        if ( this._authService.accessToken &&  req.url.indexOf('svg')<0)
        {
            let companyId='', user_id='';
            if(this._authService.CompanyId){
                companyId = this._authService.CompanyId;
                user_id = this._authService.user_id;
                
            }
            newReq = req.clone({
                headers: req.headers.set('Cache-Control', 'no-cache')
                .set('Authorization', `Bearer ${this._authService.accessToken}`) 
                .set('company_id', `${companyId}`) 
                .set('user_id', `${user_id}`) 
                .set('Pragma', 'no-cache')
                .set('accept', 'text/plain')
                .set('content-type','application/json; charset=utf-8')
                .set('If-Modified-Since', '0')
            });
        }

        // Response
        return next.handle(newReq).pipe(
            catchError((error) => {
                // Catch "  401 Unauthorized" responses
                if ( error instanceof HttpErrorResponse && error.status === 401 )
                {
                    // Sign out
                   // this._authService.signOut();

                    // Reload the app
                    //location.reload();
                }

                return throwError(error);
            })
        );
    }
}
