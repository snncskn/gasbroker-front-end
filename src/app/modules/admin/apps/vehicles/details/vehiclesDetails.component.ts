import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrManager } from 'ng6-toastr-notifications';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { VehiclesService } from '../vehicles.service';

@Component({
    selector: 'vehiclesDetails',
    templateUrl: './vehiclesDetails.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehiclesDetailsComponent implements OnInit {

    vehicleForm: FormGroup;
    dataSourceTypes: any[];
    vehicleDetail: string;
    customers: any[];
    filteredOptions: Observable<string[]>;
    selectCustomerItem: any;




    constructor(
        private router: Router,
        private _formBuilder: FormBuilder,
        private _vehicleService: VehiclesService,
        public toastr: ToastrManager,
        private _router: Router,
        private readonly activatedRouter: ActivatedRoute


    ) {
        this.list();
        this.vehicleForm = this._formBuilder.group({
            id: [''],
            type: [''],
            name: ['', [Validators.required]],
            company: ['',[Validators.required]],
            company_id: [''],
            registered_date: [null],
        });
        
     

        
    }

    ngOnInit(): void {
        this._vehicleService.getTypes().subscribe(res => {
            this.dataSourceTypes = res.body;
        });
       
    }

    addNewVehicle() {
        let createVehicle = {
            id: '', type: '', name: '', company_id: '', registered_date: ''};

        createVehicle.id = this.vehicleDetail;
        createVehicle.type = this.vehicleForm.value.type;
        createVehicle.name = this.vehicleForm.value.name;
        createVehicle.company_id = this.vehicleForm.value.company_id;
        createVehicle.registered_date = this.vehicleForm.value.registered_date;


        this._vehicleService.createVehicle(createVehicle).subscribe(data => {
        this._router.navigateByUrl('/apps/vehicles/list');
        });
    }

    private _filter(value: string): string[] {

        let filterValue;
        if (value === '99') {
          filterValue = '';
        } else {
          filterValue = value;
        }
    
        return this.customers.filter(option => {
            if( typeof filterValue === 'object'){
                return option?.full_name?.indexOf(filterValue.full_name) === 0 || option?.full_name?.indexOf(filterValue.full_name?.toLowerCase()) === 0;

            }else{
                return option?.full_name?.indexOf(filterValue) === 0 || option?.full_name?.indexOf(filterValue?.toLowerCase()) === 0;

            }
        });
    }

    public list() {
        this._vehicleService.getCustomers().subscribe(data => {
          this.customers = data.body;
          this.activatedRouter.paramMap.subscribe(params => {
            if (params.has('id')) {
                this._vehicleService.getVehicleById(params.get("id")).subscribe(data=>{
                    this.vehicleDetail = data.body.id;
                    this.vehicleForm.patchValue(data.body);
                    this.vehicleForm.value.company_id = data.body.company.id;
                    this.vehicleForm.value.company = data.body.company.name;
                }) 
            };
        });
        this.filteredOptions = this.vehicleForm.controls['company'].valueChanges.pipe(
        startWith(''),
        map(value => this._filter(value === '' ? '99' : value))
        );
        });
    }

    selectCustomer(event: any) {
        let option = this.customers.filter(item => item.full_name.toUpperCase() === event.option.value.full_name.toUpperCase());
        if (option.length > 0) {
          this.selectCustomerItem = option[0];
          this.vehicleForm.get('company_id').setValue(option[0].id, { emitEvent: false });
        }
    }
    displayFn(x) {
        return x.full_name;
      }

    deleteVehicle()
    {
        if(this.vehicleDetail)
        {
            this._vehicleService.deleteVehicle(this.vehicleDetail).subscribe();
        }
    }
}
