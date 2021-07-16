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
    public groupsForm = new GroupForm();

    groupId: string;


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
            description: item.description || '',
            group_id: this.groupForm.value.id,
            id: item.id || ''
        });
        this.subGroupItems.push(subGroupForm);
    }

    get subGroupItems() {
        return this.formSubGroup.controls["subGroupItems"] as FormArray;
    }

    addGroup() {
        if (this.groupForm.value.description === '') {
            this.toastr.errorToastr('Group Name required', 'Required!');
            return;
        }
        this._groupService.createProcessGroup(this.groupForm.value).subscribe(data => {
            this.groupId = data.body.id
            this.toastr.successToastr('Group name saved', 'Saved!');
            this.subGroupItems.value.forEach(element => {
                element.group_id = this.groupId;
                this._groupService.createProcessSubGroup(element).subscribe()
            });
            this._router.navigateByUrl('/apps/group/form/' + data.body.id);

        });
    }

    deleteGroup() {
        if (this.groupForm.value.id) {
            this._groupService.deleteGroup(this.groupForm.value).subscribe(data => {
                this._router.navigateByUrl('/apps/group/list/');
                this.toastr.errorToastr('Process Group deleted', 'deleted!');
            });
        }
    }

    deleteSubGroup(item: any) {
        if (this.groupId) {
            this._groupService.deleteSubGroup(this.subGroupItems.value[item]).subscribe(data => {
                this.toastr.errorToastr('Process Sub Group deleted', 'deleted!');
                this._router.navigateByUrl('/apps/group/form/' + data.body.id);

            })
        }
    }
}