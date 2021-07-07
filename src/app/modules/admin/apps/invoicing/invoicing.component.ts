import { Component, ViewEncapsulation, ChangeDetectorRef, OnInit, AfterViewInit, OnDestroy, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { InvoicingService } from './invoicing.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Invoices } from './invoicing.types';
import { InvoiceForm } from './invoiceForm';


@Component({
  selector: `invoicing`,
  templateUrl: './invoicing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class InvoicingComponent implements OnInit {


  searchInputControl: FormControl = new FormControl();
  invoicingForm: FormGroup;
  invoices: Invoices[] | null = null;
  filteredOptions: Observable<string[]>;
  isLoading: boolean = false;
  customers: any[];
  newAddPanel: boolean = false;
  selectCustomerItem: any;
  

  public invoiceForm = new InvoiceForm();
  formInvoice: any;

  constructor(
    private _formBuilder: FormBuilder,
    private _invoicingService: InvoicingService,
    private _changeDetectorRef: ChangeDetectorRef,

  ) {
    /*
      this.invoicingForm = this._formBuilder.group({
          id              : [''],
          customers       : [''],
          customersId     : [''],
          buyer_id        : [''],
          buyer           : [''],
          invoice_type    : [''],
          invoice_no      : [''],
          invoice_date    : [''],
          maturity        : [''],
          invoice_status  : [''],
          content         : [''],
          items           : []



        });
        */
    this.formInvoice = {
      id: '', customers: '',
      customersId: '', buyer_id: '', buyer: '', invoice_type: '', invoice_no: '',
      invoice_date: '', maturity: '', invoice_status: '', content: '',sub_total:'0'
    };
    this.invoicingForm = this.invoiceForm.convertModelToFormGroup(this.formInvoice);

    this.list();
  }

  private _filter(value: string): string[] {

    let filterValue;
    if (value === '99') {
      filterValue = '';
    } else {
      filterValue = value;
    }

    return this.customers.filter(option => {
      return option.card_name?.indexOf(filterValue) === 0 || option.card_name?.indexOf(filterValue.toLowerCase()) === 0;
    });
  }

  public list() {
    this._invoicingService.Customers().subscribe(data => {
      this.customers = data.data;
      this.filteredOptions = this.invoicingForm.controls['customers'].valueChanges.pipe(
        startWith(''),
        map(value => this._filter(value === '' ? '99' : value))
      );
    });
  }
  ngOnInit(): void {
  }

  createInvoice(): void {

    // Create the product
    this._invoicingService.createInvoice(this.invoicingForm.value).subscribe((newInvoice) => {

      // Go to new product
      this.invoices = newInvoice.data;

      // Fill the form
      this.invoicingForm.patchValue(newInvoice.data);

      // Mark for check
      this._changeDetectorRef.markForCheck();
    });
  }
  addItems() {

    this.invoicingForm.value.item.push(this.addItemsOne());



  }
  add(item?: any) {
    const lessonForm = this._formBuilder.group({
      content: ['', Validators.required],
      price: ['', Validators.required],
      quantity: ['', Validators.required],
      total: ['', Validators.required,],

    });
    this.invoiceItems.push(lessonForm);
  }

  get invoiceItems() {
    return this.invoicingForm.controls["invoiceItems"] as FormArray;
  }


  addItemsOne() {
    return new FormBuilder().group({
      id: '',
      content: '',
      price: '',
      quantity: '1',
      total: '',
    });
  }
  selectCustomer(event: any) {
    let option = this.customers.filter(item => item.card_name.toUpperCase() === event.option.value.toUpperCase());
    if (option.length > 0) {
      this.selectCustomerItem = option[0];
      this.invoicingForm.get('customersId').setValue(option[0].id, { emitEvent: false });
      this.invoicingForm.get('buyer_id').setValue(option[0].id, { emitEvent: false });
      this.invoicingForm.get('buyer').setValue(option[0].card_name, { emitEvent: false });

    }
  }
  
  valuechange() {
    this.invoicingForm.get('sub_total').setValue('')
    const invoiceItems = this.invoicingForm.get('invoiceItems') as FormArray;
    for (const control of invoiceItems.controls) {
      const controlValue = control.value;
      this.invoicingForm.get('sub_total').setValue(+this.invoicingForm.get('sub_total').value+ controlValue.price * controlValue.quantity)
      control.get('total').setValue(controlValue.price * controlValue.quantity);
    }
  }
}
