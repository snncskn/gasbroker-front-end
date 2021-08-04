import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
 
import { IModelConvert } from './IModelConvert';



export class ProcessForm implements IModelConvert{
  constructor() { }

  convertModelToFormGroup(model: any): FormGroup {
   
    const group: any = {};    

    group.id = new FormControl(model.id || '');
    group.process_id = new FormControl(model.process_id || '');
    group.group_id = new FormControl(model.group_id || '');
    group.group_sub_id = new FormControl(model.group_sub_id || '');
    group.process_date = new FormControl(model.process_date || '');
    group.address = new FormControl(model.address || '');
    group.latitude = new FormControl(model.latitude || '');
    group.longitude = new FormControl(model.longitude || '');
    group.map = new FormControl(model.map || '');



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