import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
 
import { IModelConvert } from './IModelConvert';



export class ProductForm implements IModelConvert{
  constructor() { }

  convertModelToFormGroup(model: any): FormGroup {
   
    const group: any = {};    

    group.id = new FormControl(model.id || '');
    group.main_id = new FormControl(model.main_id || '');
    group.name = new FormControl(model.name || '');
    group.code = new FormControl(model.code || '');
    group.unit = new FormControl(model.unit || '');
    group.product = new FormControl(model.product || '');



    group.subProductItems =  new FormBuilder().array([])
  
    model.subProductItems?.forEach(element => {
      group.subProductItems.push(this.subProductItem(element));
    });
    
    return new FormGroup(group);
  }

  subProductItem(val: any){ 
    return new FormBuilder().group({
              id: val.id,
              main_id: val.main_id,
              name: val.name,
              code: val.code,
              unit: val.unit,
              product: val.product,
    });
  }
  
}