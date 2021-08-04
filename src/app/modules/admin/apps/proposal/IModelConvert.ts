
import { FormGroup } from "@angular/forms";

export interface IModelConvert {
  convertModelToFormGroup(model: any):FormGroup;
}