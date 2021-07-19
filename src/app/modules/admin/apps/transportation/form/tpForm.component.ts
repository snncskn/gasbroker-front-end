import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { stubFalse } from 'lodash';
import { ToastrManager } from 'ng6-toastr-notifications';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ProcessService } from '../transportation.service';

@Component({
    selector: 'tp-form',
    templateUrl: './tpForm.component.html',
    styleUrls: ['./tpForm.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransportationFormComponent implements OnInit {

    processForm: FormGroup;
    dataSourceGroup: any[];
    dataSourceSubGroup: any[];
    vehicleDetail: string;
    customers: any[];
    filteredOptions: Observable<string[]>;
    selectCustomerItem: any;

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
        private readonly activatedRouter: ActivatedRoute


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

        this.activatedRouter.paramMap.subscribe(params => {
            if (params.has('id')) {
                this._processService.getProcessById(params.get("id")).subscribe(data => {
                    this.processForm.patchValue(data.body);
                })
            };
        });
    }

    ngOnInit(): void {
        this._processService.getProcessGroup().subscribe(res => {
            this.dataSourceGroup = res.body;
        });
    }

    changeGroup($event) {
        this._processService.getProcessGroupById($event.value).subscribe(data => {
            this.dataSourceSubGroup = data.body.process_sub_groups;
        });
    }

    addNewProcess() {
        this._processService.getProcessSave(this.processForm.getRawValue()).subscribe(data => {
            this.dataSourceSubGroup = data.body.process_sub_groups;
            this.toastr.successToastr('Process Added/Updated', 'Added/Updated!');
            this._router.navigate(['/apps/transportation/list']);
        });
    }

    deleteProcess() {
        this._processService.getProcessDelete(this.processForm.getRawValue()).subscribe(data => {
            this.dataSourceSubGroup = data.body.process_sub_groups;
            this.toastr.warningToastr('Process Deleted', 'Deleted!');
            this._router.navigate(['/apps/transportation/list']);

        });
    }
}
