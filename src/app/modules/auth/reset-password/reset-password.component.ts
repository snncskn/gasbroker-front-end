import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { FuseValidators } from '@fuse/validators';
import { FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

enum TokenStatus {
    Validating,
    Valid,
    Invalid
}
@Component({
    selector     : 'auth-reset-password',
    templateUrl  : './reset-password.component.html',
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class AuthResetPasswordComponent implements OnInit
{
    TokenStatus = TokenStatus;
    tokenStatus = TokenStatus.Validating;
    token = null;

    @ViewChild('resetPasswordNgForm') resetPasswordNgForm: NgForm;

    isToken: boolean = false;
    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: ''
    };
    resetPasswordForm: FormGroup;
    showAlert: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService,
        private _formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
    )
    {
        this.activatedRouter.paramMap.subscribe(params => {
            if (params.has('id')) {
                this._authService.getToken().subscribe(tokens => {
                    console.log(tokens)
                })
                if(params.get('id')=='4444')
                {
                    this.isToken=true;
                }
            }
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Create the form
        this.resetPasswordForm = this._formBuilder.group({
                password       : ['', Validators.required],
                passwordConfirm: ['', Validators.required]
            },
            {
                validators: FuseValidators.mustMatch('password', 'passwordConfirm')
            }
        );

        const token = this.route.snapshot.queryParams['token'];

        //console.log(token)
        this.router.navigate([], { relativeTo: this.route, replaceUrl: true });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Reset password
     */
    resetPassword(): void
    {
        // Return if the form is invalid
        if ( this.resetPasswordForm.invalid )
        {
            return;
        }

        // Disable the form
        this.resetPasswordForm.disable();

        // Hide the alert
        this.showAlert = false;

        // Send the request to the server
        this._authService.resetPassword(this.resetPasswordForm.get('password').value)
            .pipe(
                finalize(() => {

                    // Re-enable the form
                    this.resetPasswordForm.enable();

                    // Reset the form
                    this.resetPasswordNgForm.resetForm();

                    // Show the alert
                    this.showAlert = true;
                })
            )
            .subscribe(
                (response) => {

                    // Set the alert
                    this.alert = {
                        type   : 'success',
                        message: 'Your password has been reset.'
                    };
                },
                (response) => {

                    // Set the alert
                    this.alert = {
                        type   : 'error',
                        message: 'Something went wrong, please try again.'
                    };
                }
            );
    }
}
