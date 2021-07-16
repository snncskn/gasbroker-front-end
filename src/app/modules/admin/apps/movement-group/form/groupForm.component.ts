import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrManager } from 'ng6-toastr-notifications';
import { GroupService } from '../group.service';
import { GroupForm } from './groupForm';

@Component({
    selector: 'group-form',
    templateUrl: './groupForm.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupFormComponent {

    groupForm: FormGroup;
    subGroupForm: any;
    formSubGroup: FormGroup;

    isSavedGroup: boolean = true;
    isSavedGroupInput: boolean = true;
    public groupsForm = new GroupForm();


    constructor(
        private _formBuilder: FormBuilder,
        public toastr: ToastrManager,
        private _router: Router,
        private _groupService: GroupService,
        private readonly activatedRouter: ActivatedRoute
    ) {
        this.groupForm = this._formBuilder.group({
            id: [''],
            description: [''],
        });

        this.subGroupForm={
            id:'', group_id:'',description:''
        }
        this.formSubGroup = this.groupsForm.convertModelToFormGroup(this.subGroupForm);


        this.activatedRouter.paramMap.subscribe(params => {
            if (params.has('id')) {
                this.isSavedGroup = false;
                this.isSavedGroupInput = false;
                this._groupService.getGroupById(params.get("id")).subscribe(data => {
                    this.groupForm.patchValue(data.body);
                    console.log(data.body.process_sub_groups)
                    console.log(this.formSubGroup.value)
                });
            };
        });
    }

    add(item?: any) {
        const subGroupForm = this._formBuilder.group({
            description: ['', Validators.required],
            group_id: this.groupForm.value.id
        });
        this.subGroupItems.push(subGroupForm);
    }

    get subGroupItems() {
        return this.formSubGroup.controls["subGroupItems"] as FormArray;
    }

    addGroup() {

        let createGroup = {
            id: '', description: ''
        };

        createGroup.id = '';
        createGroup.description = this.groupForm.value.description;

        if (createGroup.description === '') {
            this.toastr.errorToastr('Group Name required', 'Required!');
            return;
        }
        this.isSavedGroup = false;
        this.isSavedGroupInput = false;
        this._groupService.createProcessGroup(createGroup).subscribe(data => {
            this.toastr.successToastr('Group name saved', 'Saved!');
            this.groupForm.patchValue(data.body)
            this.subGroupForm.patchValue({
                group_id: data.body.id
            })
        });
    }

    addSubGroup() {
    }

    deleteGroup() {
        if(this.groupForm.value.id)
        {
            this._groupService.deleteGroup(this.groupForm.value).subscribe(data=>{
                this._router.navigateByUrl('/apps/group/list');
                this.toastr.errorToastr('Process Group deleted', 'deleted!');
            });
        }
    }
}