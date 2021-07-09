import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomersService } from '../customers.service';

@Component({
    selector       : 'customersTD',
    templateUrl    : './customersTD.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomersTDComponent implements OnInit
{
    customerForm: FormGroup;
    dataSourceTypes: any[];
    resetPassForm:FormGroup;

     customerId:string;
     constructor(
        private router: Router,
        private _formBuilder: FormBuilder,
        private _customersService: CustomersService
        ) 
    { 
    const navigation = this.router.getCurrentNavigation();
    /*const state = navigation.extras.state as {example: string};
    this.customerId = state.example;*/

    this.customerForm = this._formBuilder.group({
        id: [''],
        types: [null],
        full_name: ['', [Validators.required]],
        email: [null],
        phone: [null],
        name: ['', [Validators.required]],
        fax: [null],
        registered_date: [null],
    });
    this.resetPassForm = this._formBuilder.group({
        pass: ['', Validators.required],
        confirmPass: ['', Validators.required],

    });
    }

    ngOnInit(): void
    {
        this._customersService.getTypes().subscribe(res => {
            this.dataSourceTypes = res.body;
        });
    }
}
