import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { UsersService } from 'app/modules/admin/apps/users/users.service';
import { UsersList } from 'app/modules/admin/apps/users/users.types';
import { ToastrManager } from 'ng6-toastr-notifications';

@Component({
    selector: 'auth-sign-up',
    templateUrl: './sign-up.component.html',
    styleUrls: ['./sign-up.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class AuthSignUpComponent implements OnInit {
    @ViewChild('signUpNgForm') signUpNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: ''
    };
    signUpForm: FormGroup;
    showAlert: boolean = false;
    user: UsersList | null = null;

    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService,
        private _formBuilder: FormBuilder,
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _changeDetectorRef: ChangeDetectorRef,
        private _usersService: UsersService,
        public toastr: ToastrManager
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the form
        this.signUpForm = this._formBuilder.group({
            step1: this._formBuilder.group({
                id: [''],
                userName: ['', Validators.required],
                full_name: ['', Validators.required],
            }),
            step2: this._formBuilder.group({
                email: ['', Validators.required, Validators.email],
                mobilePhone: ['', Validators.required],
            }),
            step3: this._formBuilder.group({
                pass: ['', Validators.required],
                confirmPass: ['', Validators.required],
            })

        }
        );
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign up
     */
    signUp(): void {
        // Get the user object
        const user = this.signUpForm.getRawValue();

        let tmpUser = {
            full_name: user.step1.full_name,
            firstName: user.step1.full_name,
            userName: user.step1.userName,
            email: user.step2.email,
            mobilePhone: user.step2.mobilePhone,
            pass: user.step3.pass,
            gender: '',
            color: 'bg-teal-500',
        };

        // Update the user on the server
        this._usersService.createUserSingUp(tmpUser).subscribe(() => {

            // Show a success message
            this.toastr.successToastr('New User Added', 'New User!');

            const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/sign-in';

            // Navigate to the redirect url
            this._router.navigateByUrl(redirectURL);

        });
    }
}
