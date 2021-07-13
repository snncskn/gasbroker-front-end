import { ChangeDetectionStrategy, Component, ViewEncapsulation, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UsersService } from '../../users/users.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CustomersService } from '../../company/company.service';

@Component({
    selector: 'profile-info',
    templateUrl: './profile-info.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileInfoComponent implements OnInit {

    avatarSrc: string;
    profileForm: FormGroup;
    isLoading: boolean = false;
    user: any | null = null;
    @ViewChild('avatarFileInput') private _avatarFileInput: ElementRef;


    constructor(
        private _formBuilder: FormBuilder,
        private readonly userApi: UsersService,
        private _customersService: CustomersService,
        private readonly ngxService: NgxUiLoaderService
    ) { }

    ngOnInit(): void {
        this.profileForm = this._formBuilder.group({
            id: [''],
            userName: [''],
            full_name: [''],
            email: [''],
            mobilePhone: [''],
            gender: [''],
            birthday: [''],
            address: [''],
            avatar: [''],
        });
        this.isLoading = true;
        this.ngxService.start();
        this.userApi.getUserInfo().subscribe(data => {
            this.profileForm.patchValue(data);
            this.avatarSrc = data.avatar;
            this.isLoading = false;
            this.ngxService.stop();
        });
    }

    updateUser(): void {
        // Get the user object
        const user = this.profileForm.getRawValue();

        // Update the user on the server
        this.userApi.updateUserProfile(user.id, user).subscribe(() => {
        });
    }

    uploadAvatar(fileList: FileList): void {
        if (!fileList.length) {
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/png'];
        const file = fileList[0];
        if (!allowedTypes.includes(file.type)) {
            return;
        }
        this._customersService.uploadAvatar(this.profileForm.value.id, file).subscribe();
    }

    removeAvatar(): void {
        
    }

}