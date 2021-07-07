import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsersService } from 'app/modules/admin/apps/users/users.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
    selector: 'settings-account',
    templateUrl: './account.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsAccountComponent implements OnInit {
    accountForm: FormGroup;

    constructor(
        private _formBuilder: FormBuilder,
        private readonly userApi: UsersService,
        private readonly ngxService: NgxUiLoaderService
    ) {
    }
    ngOnInit(): void {
        this.accountForm = this._formBuilder.group({
            id: [''],
            userName: [''],
            full_name: [''],
            email: [''],
            mobilePhone: [''],
            gender: [''],
            birthday: [''],
            address: [''],
        });
        this.ngxService.start();
        this.userApi.getUserInfo().subscribe(data => {
            this.accountForm.patchValue(data);
            this.ngxService.stop();
        });
    }

    updateUser(): void {
        // Get the user object
        const user = this.accountForm.getRawValue();

        // Update the user on the server
        this.userApi.updateUserProfile(user.id, user).subscribe(() => {
        });
    }
}
