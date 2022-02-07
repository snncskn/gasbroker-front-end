import { HttpClient } from "@angular/common/http";
import { Component, OnInit, Inject} from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { HelpCenterService } from "../../help-center.service";

export interface upHeaderData {
    id?: string;
    head: string;
}
@Component({
    selector: 'dialog-upHeader',
    templateUrl: 'dialog-upHeader.component.html',
    styleUrls  : ['../dialog.component.scss'],
})
export class upHeaderFaq {
    constructor(
        public dialogRef: MatDialogRef<upHeaderFaq>,
        private readonly helpService: HelpCenterService,
        @Inject(MAT_DIALOG_DATA) public data: upHeaderData,
    ) { 
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
    createHeader() {
        this.helpService.createHeader(this.data).subscribe(res => {
            this.dialogRef.close();
        })
    }
}