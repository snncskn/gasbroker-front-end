import {Component, OnInit ,Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {DialogService} from '../dialog/dialog.service';

export interface DialogData {
  content: string;
  head: string;
  links: string;
}
@Component({
  selector: 'dialog.faq',
  templateUrl: 'dialog.faq.component.html',
  styleUrls  : ['./dialog.component.css'],
  providers : [DialogService]
})
export class DialogFaq {
  constructor(
    public dialogRef: MatDialogRef<DialogFaq>,
    private _dialogService: DialogService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
  dialogUpdate(){
    this._dialogService.getDialog()
    console.log(this.data);
  }
}