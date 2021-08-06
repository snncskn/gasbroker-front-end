import { ChangeDetectionStrategy, Component, Inject, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CustomersService } from '../company.service';

@Component({
    selector       : 'approval',
    templateUrl    : './approval.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApprovalComponent
{
    dataSourceApprovalStatus: any[];
    approvalForm: FormGroup;
    /**
     * Constructor
     */
    constructor(
        public dialogRef: MatDialogRef<ApprovalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _formBuilder: FormBuilder,
        private _customersService: CustomersService,
    )
    {
        this.approvalForm = this._formBuilder.group({
            id: [''],
            company_id: this.data.company,
            status: this.data.status,
            description: [''],
        });
    }

    closeDialog(){
        this.dialogRef.close();
    }
    saveApproval()
    {
        this._customersService.createApproval(this.approvalForm.value).subscribe(data=>{
            this.dialogRef.close();
        })
    }
}
