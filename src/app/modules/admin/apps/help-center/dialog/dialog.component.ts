import { HttpClient } from '@angular/common/http';
import {Component, OnInit ,Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { HelpCenterService } from '../help-center.service';

export interface DialogData {
  id?: string;
  content: string;
  head: string;
  links: string;
}
@Component({
  selector: 'dialog.faq',
  templateUrl: 'dialog.faq.component.html',
  styleUrls  : ['./dialog.component.css'],
})
export class DialogFaq {
  constructor(
    public dialogRef: MatDialogRef<DialogFaq>,
    private readonly helpService: HelpCenterService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
  dialogUpdate()
  {
    this.helpService.saveHelp(this.data).subscribe(res => {
      this.dialogRef.close();
    })
  }
}