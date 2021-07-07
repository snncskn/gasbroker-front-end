import { ChangeDetectionStrategy, ViewChild, ElementRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UsersService } from 'app/modules/admin/apps/users/users.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
    selector: 'settings-security',
    templateUrl: './security.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsSecurityComponent implements OnInit {

    @ViewChild('confirmPass') _confirmPass: ElementRef;

    securityForm: FormGroup;


    /**
     * Constructor
     */
    constructor(
        private _formBuilder: FormBuilder,
        private readonly userApi: UsersService,
        public toastr: ToastrManager,
        private readonly ngxService: NgxUiLoaderService

    ) {
    }

    ngOnInit(): void {
        // Create the form
        this.securityForm = this._formBuilder.group({
            id: [''],
            confirmPass: [''],
            pass: [''],
            //    twoStep          : [true],
            //    askPasswordChange: [false]
        });
        this.ngxService.start();
        this.userApi.getUserInfo().subscribe(data => {
            this.securityForm.patchValue(data);
            this.ngxService.stop();
        });
    }

    changePassword() {
        const user = this.securityForm.getRawValue();
        if (this._confirmPass.nativeElement.value == user.pass && this._confirmPass.nativeElement.value != '') {
            this.userApi.updatePass(user.id, user).subscribe(() => { });
        }
        else
            this.toastr.warningToastr('Passwords is not matching ', 'Try Again!');
    }
}
