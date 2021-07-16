import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
 
import { IModelConvert } from './IModelConvert';



export class GroupForm implements IModelConvert{
  constructor() { }

  convertModelToFormGroup(model: any): FormGroup {
   
    const group: any = {};    

    group.id = new FormControl(model.id || '');
    group.group_id = new FormControl(model.group_id || '');
    group.description = new FormControl(model.description || '');

    group.subGroupItems =  new FormBuilder().array([])
  
    model.subGroupItems?.forEach(element => {
      group.subGroupItems.push(this.subGroupItem(element));
    });
    
    return new FormGroup(group);
  }

  subGroupItem(val: any){ 
    return new FormBuilder().group({
              id: val.id,
              group_id: val.group_id,
              description: val.description,
    });
  }
  
}