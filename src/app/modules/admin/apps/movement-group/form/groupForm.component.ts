import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { GeneralFunction } from 'app/shared/GeneralFunction';
import { ToastrManager } from 'ng6-toastr-notifications';
import { ConfirmationDialog } from '../../delete-dialog/delete.component';
import { GroupService } from '../group.service';
import { GroupForm } from './groupForm';

@Component({
    selector: 'group-form',
    templateUrl: './groupForm.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default
})
export class GroupFormComponent {

    dialogRef: MatDialogRef<ConfirmationDialog>;
    public generalFunction = new GeneralFunction();

    groupForm: FormGroup;
    subGroupForm: any;
    formSubGroup: FormGroup;
    public groupsForm = new GroupForm();

    groupId: string;


    constructor(
        private _formBuilder: FormBuilder,
        public toastr: ToastrManager,
        private _router: Router,
        private _groupService: GroupService,
        private readonly activatedRouter: ActivatedRoute,
        private translocoService: TranslocoService,
        private changeDetection: ChangeDetectorRef,
        private dialog: MatDialog
    ) {
        this.groupForm = this._formBuilder.group({
            id: [''],
            description: ['', Validators.required],
        });

        this.subGroupForm = {
            id: '', group_id: '', description: ''
        }
        this.formSubGroup = this.groupsForm.convertModelToFormGroup(this.subGroupForm);

        this.getGroupAndSubGroup();

    }

    getGroupAndSubGroup() {
        this.activatedRouter.paramMap.subscribe(params => {
            if (params.has('id')) {
                this._groupService.getGroupById(params.get("id")).subscribe(data => {
                    this.groupForm.patchValue(data.body);
                    //this.groupId=data.body.id;
                    data.body.process_sub_groups.forEach(element => {
                        this.add(element)
                    });
                });
            };
        });
    }

    add(item?: any) {
        const subGroupForm = this._formBuilder.group({
            description: [item.description || '', Validators.required],
            group_id: this.groupForm.value.id,
            id: item.id || ''
        });
        this.subGroupItems.push(subGroupForm);
    }

    get subGroupItems() {
        return this.formSubGroup.controls["subGroupItems"] as FormArray;
    }

    addGroup() {
        let status = this.generalFunction.formValidationCheck(this.groupForm,this.toastr,this.translocoService);
        let status2 = this.generalFunction.formValidationCheck(this.formSubGroup,this.toastr,this.translocoService);
        if(status)
        {
          return
        }
        if(status2)
        {
          return
        }
        this._groupService.createProcessGroup(this.groupForm.value).subscribe(data => {
            this.groupId = data.body.id
            this.toastr.successToastr(this.translocoService.translate('message.groupNameSaved'));
            this.subGroupItems.value.forEach(element => {
                element.group_id = this.groupId;
                this._groupService.createProcessSubGroup(element).subscribe()
            });
        });
        this._router.navigateByUrl('/apps/group/list');

    }

    deleteGroup() {
        if (this.groupForm.value.id) {
            this.dialogRef = this.dialog.open(ConfirmationDialog, {
                disableClose: false
              });
              this.dialogRef.afterClosed().subscribe(result => {
                if(result) {
                    this._groupService.deleteGroup(this.groupForm.value).subscribe(data => {
                        this._router.navigateByUrl('/apps/group/list/');
                        this.toastr.errorToastr(this.translocoService.translate('message.deleteProcessGroup'));
                    });
                }
                this.dialogRef = null;
              });

        }
    }

    deleteSubGroup(item: any,index: number) {
        console.log(123);
        if(item.id){
            this._groupService.deleteSubGroup(item).subscribe(data => {
                this.toastr.errorToastr(this.translocoService.translate('message.deleteProcessSubGroup'));
                //this._router.navigateByUrl('/apps/group/form/' + data.body.id);
                let tmp = this.formSubGroup.controls["subGroupItems"] as FormArray;
                tmp.removeAt(index);
                this.changeDetection.detectChanges();
            });
        }else{
          let tmp = this.formSubGroup.controls["subGroupItems"] as FormArray;
          tmp.removeAt(index);
        }
         
    }
}