import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrManager } from 'ng6-toastr-notifications';
import { CustomersService } from '../company.service';

@Component({
    selector: 'companyTD',
    templateUrl: './companyTD.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomersTDComponent implements OnInit {
    customerForm: FormGroup;
    dataSourceTypes: any[];
    resetPassForm: FormGroup;
    addressesForm: FormGroup;
    addressList:any[];

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
                })

                this._customersService.getAddressByCompanyId(params.get("id")).subscribe(data => {
                    this.addressList=data.body;
                    console.log(this.addressList)
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
        this._customersService.createAddress(this.addressesForm.value).subscribe();
    }
}
