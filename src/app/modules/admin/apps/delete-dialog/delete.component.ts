import { Component, Input } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';



@Component({
  selector: 'delete-dialog',
  templateUrl: './delete.component.html',
  styleUrls: ['./delete.component.scss'],
})
export class ConfirmationDialog {
  constructor(public dialogRef: MatDialogRef<ConfirmationDialog>) {}
}