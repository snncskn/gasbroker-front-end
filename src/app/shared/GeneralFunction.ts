import { FormGroup } from "@angular/forms";

export class GeneralFunction {
    formValidationCheck(form:FormGroup,toastr:any,translocoService:any):boolean{
        let isCheck: boolean= false; 
        Object.keys(form.controls).forEach(key => {

            if(form.controls[key].status=="INVALID" && !isCheck)
            {
              toastr.warningToastr(translocoService.translate(key)+translocoService.translate('message.required'));
              isCheck=true;
            }
          });
          return isCheck;
    }
}