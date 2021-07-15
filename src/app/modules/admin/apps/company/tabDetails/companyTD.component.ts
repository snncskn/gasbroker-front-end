import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FileUploadValidators } from '@iplab/ngx-file-upload';
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
    dataSourceDocs: any[];
    resetPassForm: FormGroup;

    //file upload
    public animation: boolean = false;
    public multiple: boolean = false;
    private filesControl = new FormControl(null);
    private label = new FormControl(null);

    public demoForm = new FormGroup({
        files: this.filesControl,
        label: this.label,
    });
    //file upload

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
        this.resetPassForm = this._formBuilder.group({
            pass: ['', Validators.required],
            confirmPass: ['', Validators.required],

        });

        this.activatedRouter.paramMap.subscribe(params => {
            if (params.has('id')) {
                this._customersService.getCompanyById(params.get("id")).subscribe(data => {
                    this.companyDetail = data.body.id;
                    this.customerForm.patchValue(data.body);
                })
            };
        });

    }

    ngOnInit(): void {
        this._customersService.getTypes().subscribe(res => {
            this.dataSourceTypes = res.body;
        });
        this._customersService.getCompanyDocs().subscribe(res => {
            this.dataSourceDocs = res.body;
        });
        
        
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
        console.log(createCompany)

        this._customersService.createCustomer(createCompany).subscribe(data => {
            this._router.navigateByUrl('/apps/company/list');
        });
    }

    deleteCompany() {
        if (this.companyDetail) {
            this._customersService.deleteCompany(this.companyDetail).subscribe();
        }
    }

    public toggleStatus(): void {
        this.filesControl.disabled ? this.filesControl.enable() : this.filesControl.disable();
    }

    public toggleMultiple() {
        this.multiple = !this.multiple;
    }

    public clear(): void {
        this.filesControl.setValue([]);
    }

    upload(){
        console.log(this.demoForm.value);
        this._customersService.uploadMedia(this.demoForm.value.files[0], this.companyDetail,'de46be50-b221-4dc3-9d7e-db409389d668',this.demoForm.value.label,'','test','').subscribe(data=>{
            console.log(data);
        });
    }
    formUrunEkle(val: any){ 
        return new FormBuilder().group({
            files: this.filesControl,
            label: this.label,
        })
      }
}
