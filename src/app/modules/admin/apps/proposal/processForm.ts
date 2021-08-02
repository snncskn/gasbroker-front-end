import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
 
import { IModelConvert } from './IModelConvert';



export class ProcessForm implements IModelConvert{
  constructor() { }

  convertModelToFormGroup(model: any): FormGroup {
   
    const group: any = {};    

    group.id = new FormControl(model.id || '');
    group.main_id = new FormControl(model.main_id || '');
    group.name = new FormControl(model.name || '');
    group.code = new FormControl(model.code || '');
    group.unit = new FormControl(model.unit || '');
    group.product = new FormControl(model.product || '');



    group.processItems =  new FormBuilder().array([])
  
    model.processItems?.forEach(element => {
      group.processItems.push(this.processItem(element));
    });
    
    return new FormGroup(group);
  }

  processItem(val: any){ 
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