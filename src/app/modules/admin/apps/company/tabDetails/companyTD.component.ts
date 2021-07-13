import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrManager } from 'ng6-toastr-notifications';
import { CustomersService } from '../company.service';

@Component({
    selector: 'companyTD',
    templateUrl: './companyTD.component.html',
    styleUrls: ['./companyTD.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomersTDComponent implements OnInit {
    customerForm: FormGroup;
    dataSourceTypes: any[];
    resetPassForm: FormGroup;
    addressesForm: FormGroup;
    addressList:any[];

    center: google.maps.LatLngLiteral = {lat: 41, lng: 29};
    zoom = 7;
    markerOptions: google.maps.MarkerOptions = {draggable: false};
    markerPositions: google.maps.LatLngLiteral[] = [];

    addMarker(event: google.maps.MapMouseEvent) {
        this.markerPositions=[];
        this.markerPositions.push(event.latLng.toJSON());
        this.markerPositions.forEach((element)=>(
            this.addressesForm.patchValue({
                lat:element.lat,
                long:element.lng
            })
        ))
      }

    companyDetail: string;
    constructor(
        private router: Router,
        private _formBuilder: FormBuilder,
        private _customersService: CustomersService,
        public toastr: ToastrManager,
        private _router: Router,
        private readonly activatedRouter: ActivatedRoute


    ) {


        this.customerForm = this._formBuilder.group({
            id: [''],
            types: [null],
            full_name: ['', [Validators.required]],
            email: [null],
            phone: [null],
            name: ['', [Validators.required]],
            website: [null],
            registered_date: [null],
        });

        this.addressesForm = this._formBuilder.group({
            id: [''],
            company_id: this.companyDetail,
            title: [''],
            description: [''],
            type: [''],
            lat: [''],
            long: [''],
        })
        this.resetPassForm = this._formBuilder.group({
            pass: ['', Validators.required],
            confirmPass: ['', Validators.required],
        });

        this.activatedRouter.paramMap.subscribe(params => {
            if (params.has('id')) {
                this._customersService.getCompanyById(params.get("id")).subscribe(data => {
                    this.companyDetail = data.body.id;
                    this.customerForm.patchValue(data.body);
                    this.addressesForm.patchValue({company_id:data.body.id})
                    this.loadAddress();
                })
            };
        });

        this._customersService.getTypes().subscribe(res => {
            this.dataSourceTypes = res.body;
        });
    }

    ngOnInit(): void {

    }

    addNewCompany() {
        let createCompany = {
            id: '', types: '', full_name: '', email: '', phone: '', name: '',
            website: '', registered_date: ''
        };
        createCompany.id = this.companyDetail;
        createCompany.types = this.customerForm.value.types;
        createCompany.full_name = this.customerForm.value.full_name;
        createCompany.email = this.customerForm.value.email;
        createCompany.phone = this.customerForm.value.phone;
        createCompany.name = this.customerForm.value.name;
        createCompany.website = this.customerForm.value.website;
        createCompany.registered_date = this.customerForm.value.registered_date;

        this._customersService.createCustomer(createCompany).subscribe(data => {
            this._router.navigateByUrl('/apps/company/list');
        });
    }

    deleteCompany() {
        if (this.companyDetail) {
            this._customersService.deleteCompany(this.companyDetail).subscribe();
        }
    }

    createAddress(){
        if(this.companyDetail) {
            this._customersService.createAddress(this.addressesForm.value).subscribe(data =>{
                this.loadAddress()
            })
        }
    }

    newAddress()
    {
        this.addressList.push({id:'',isNew:true,description:'',title:'',type:''})
    }

    loadAddress()
    {
        this._customersService.getAddressByCompanyId(this.companyDetail).subscribe(data => {
            this.addressList=data.body;
        })
    }
}
