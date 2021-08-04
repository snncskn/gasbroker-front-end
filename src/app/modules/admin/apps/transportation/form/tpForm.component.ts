import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { stubFalse } from 'lodash';
import { ToastrManager } from 'ng6-toastr-notifications';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ConfirmationDialog } from '../../delete-dialog/delete.component';
import { ProcessService } from '../transportation.service';

@Component({
    selector: 'tp-form',
    templateUrl: './tpForm.component.html',
    styleUrls: ['./tpForm.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransportationFormComponent implements OnInit {

    dialogRef: MatDialogRef<ConfirmationDialog>;

    processForm: FormGroup;
    dataSourceGroup: any[];
    dataSourceSubGroup: any[];
    vehicleDetail: string;
    customers: any[];
    filteredOptions: Observable<string[]>;
    selectCustomerItem: any;
    selectedItem: any;

    center: google.maps.LatLngLiteral = { lat: 41, lng: 29 };
    zoom = 7;
    markerOptions: google.maps.MarkerOptions = { draggable: false };
    markerPositions: google.maps.LatLngLiteral[] = [];

    addMarker(event: google.maps.MapMouseEvent) {
        this.markerPositions = [];
        this.markerPositions.push(event.latLng.toJSON());
        this.markerPositions.forEach((element) => (
            this.processForm.patchValue({
                latitude: element.lat,
                longitude: element.lng
            })
        ))
    }



    constructor(
        private router: Router,
        private _formBuilder: FormBuilder,
        public toastr: ToastrManager,
        private _router: Router,
        private _processService: ProcessService,
        private readonly activatedRouter: ActivatedRoute,
        private translocoService: TranslocoService,
        private dialog: MatDialog



    ) {
        this.processForm = this._formBuilder.group({
            id: [''],
            group_id: [''],
            group_sub_id: [''],
            process_date: [null],
            address: [''],
            latitude: [''],
            longitude: [''],
        });
        this._processService.getProcessGroup().subscribe(res => {
            this.dataSourceGroup = res.body;
        });
        this.activatedRouter.paramMap.subscribe(params => {
            if (params.has('id')) {
                this._processService.getProcessById(params.get("id")).subscribe(data => {
                    this.changeGroup(data.body.group_id);
                    this.selectedItem = data.body;
                    this.processForm.patchValue(data.body);
                    let center: google.maps.LatLngLiteral = { lat: Number(data.body.latitude), lng: Number(data.body.longitude) };
                    this.markerPositions.push(center);

                   
                })
            };
        });
    }

    ngOnInit(): void {
       
    }

    changeGroup(val: string) {
        this._processService.getProcessGroupById(val).subscribe(data => {
            this.dataSourceSubGroup = data.body.process_sub_groups;
            if(this.selectedItem){
                this.processForm.patchValue({group_sub_id: this.selectedItem.group_sub_id});
            }
        });
    }

    addNewProcess() {
        this._processService.getProcessSave(this.processForm.getRawValue()).subscribe(data => {
            this.dataSourceSubGroup = data.body.process_sub_groups;
            this.toastr.successToastr(this.translocoService.translate('message.savedProcess'));
            this._router.navigate(['/apps/transportation/list']);
        });
    }

    deleteProcess() {
        this.dialogRef = this.dialog.open(ConfirmationDialog, {
            disableClose: false
          });
          this.dialogRef.afterClosed().subscribe(result => {
            if(result) {
                this._processService.getProcessDelete(this.processForm.getRawValue()).subscribe(data => {
                    this.dataSourceSubGroup = data.body.process_sub_groups;
                    this._router.navigate(['/apps/transportation/list']);
        
                });
            }
            this.dialogRef = null;
          });
    }
}
