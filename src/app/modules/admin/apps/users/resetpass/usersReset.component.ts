import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { merge, Observable, Subject } from 'rxjs';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UsersPagination, UsersList } from 'app/modules/admin/apps/users/users.types';
import { UsersService } from 'app/modules/admin/apps/users/users.service';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface UserPasswordDialog {
    userId: ''
}

@Component({
    selector: 'users-reset',
    templateUrl: './usersReset.component.html',
})
export class UsersResetComponent implements OnInit {

    users$: Observable<UsersList[]>;

    ResetPasswordForm: FormGroup;
    flashMessage: 'success' | 'error' | null = null;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    usersCount: number = 0;

    constructor(@Inject(MAT_DIALOG_DATA)
    public data: UserPasswordDialog,
        private _changeDetectorRef: ChangeDetectorRef,
        public dialogRef: MatDialogRef<UsersResetComponent>,
        private _snackBar: MatSnackBar,
        private _formBuilder: FormBuilder,
        private _usersService: UsersService,) {
    }
    ngOnInit(): void {
        this.ResetPasswordForm = this._formBuilder.group({
            id: this.data.userId,
            pass: new FormControl('', Validators.compose([]),),
            confirmPass: new FormControl('', Validators.compose([])),
        }, 
        { validators: this.password.bind(this) });
    }
    password(formGroup: FormGroup) {
        const { value: pass } = formGroup.get('pass');
        const { value: confirmPass } = formGroup.get('confirmPass');

        return pass === confirmPass ? null : { passwordNotMatch: true };
    }

    showFlashMessage(type: 'success' | 'error'): void {
        this.flashMessage = type;
        this._changeDetectorRef.markForCheck();
        setTimeout(() => {
            this.flashMessage = null;
            this._changeDetectorRef.markForCheck();
        }, 3000);
    }

    resetPassword() {
        const user = this.ResetPasswordForm.getRawValue();

        this._usersService.updatePass(user.id, user).subscribe(() => {

            this.showFlashMessage('success');
            this._snackBar.open('Password Changed', '', { duration: 3000 });
            this.dialogRef.close();
        });
    }
}