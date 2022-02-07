import { HttpClient } from '@angular/common/http';
import {Component, OnInit ,Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { HelpCenterService } from 'app/modules/admin/apps/help-center/help-center.service'

export interface HeaderData {
    id?: string
    head: string;
    code: string;
}

@Component({
    selector: 'dialog-header',
    templateUrl: './dialog-header.component.html',
    styleUrls  : ['../dialog.component.scss'],
  })
export class HeaderFaq {
  constructor( 
    public dialogRef: MatDialogRef<HeaderFaq>,
    private readonly helpService: HelpCenterService,
    @Inject(MAT_DIALOG_DATA) public data: HeaderData,
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
  dialogHeaderUpdate()
  {
    this.helpService.saveHelpHeader(this.data).subscribe(res => {
      this.dialogRef.close();
    })
  }
}