import { ChangeDetectionStrategy, Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UsersService } from '../users.service';
import { UsersRoles } from '../users.types';

export interface UserPasswordDialog {
  userId: ''
}

@Component({
  selector: 'usersroles',
  templateUrl: './usersRoles.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class UsersRolesComponent implements OnInit {

  roles$: Observable<UsersRoles[]>;

  displayedUserRolesColumn: string[] = ['title'];
  dataSourceUserRoles = new MatTableDataSource<any>();

  constructor(@Inject(MAT_DIALOG_DATA)
  public data: any,
    private _usersService: UsersService,
  ) { }

  ngOnInit(): void {
    this._usersService.getRoles(this.data.userId).subscribe(res => {
      this.dataSourceUserRoles.data = res.data;
    });
  }

  public setStyle2(it: any, item: any): string {
    if (item.selected) {
      return 'zebraActive';
    } else if ((it % 2) === 0) {
      return 'zebra';
    } else {
      return '';
    }
  }

  checkRole(row: any) {
    let tmp = { user_id: this.data.userId, role_id: row.id };
    if (!row.selected) {
      this._usersService.roleSave(tmp).subscribe(data => {
      })
    } else {
      this._usersService.roleDelete(tmp).subscribe(data => {
      })
    }
    row.selected = !row.selected;
    this.dataSourceUserRoles.data.forEach(item => {
      if (item.id === row.id) {
        item.selected = row.selected;
      }
    });
  }
}
