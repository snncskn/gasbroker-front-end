import {Component, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

export interface DialogData {
  content: string;
  head: string;
  links: string;
}
@Component({
  selector: 'dialog-example',
  templateUrl: 'dialog-example.component.html',
})
export class DialogFaq {
  constructor(
    public dialogRef: MatDialogRef<DialogFaq>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
  update(){
    console.log(this.data);
  }
}