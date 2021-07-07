import { FormControl, FormGroup, FormArray, Validators, FormBuilder } from '@angular/forms';
 
import { IModelConvert } from './IModelConvert';



export class InvoiceForm implements IModelConvert{
  constructor() { }

  convertModelToFormGroup(model: any): FormGroup {
   
    const group: any = {};    

    group.id = new FormControl(model.id || '');
    group.customers = new FormControl(model.customers || '');
    group.customersId = new FormControl(model.customersId || '');
    group.buyer_id = new FormControl(model.buyer_id || '');
    group.buyer = new FormControl(model.buyer || '');
    group.invoice_type = new FormControl(model.invoice_type || '');
    group.invoice_no = new FormControl(model.invoice_no || '');
    group.invoice_date = new FormControl(model.invoice_date || '');
    group.maturity = new FormControl(model.maturity || '');
    group.invoice_status = new FormControl(model.invoice_status || '');
    group.content = new FormControl(model.content || '');
    group.sub_total = new FormControl(model.sub_total || '');

    group.invoiceItems =  new FormBuilder().array([])
  
    model.invoiceItems?.forEach(element => {
      group.invoiceItems.push(this.invoiceItem(element));
    });
    
    return new FormGroup(group);
  }

  invoiceItem(val: any){ 
    return new FormBuilder().group({
              id: val.id,
              content:val.content,
              price: val.price,
              quantity: val.quantity,
              total: val.total
    });
  }
  
}