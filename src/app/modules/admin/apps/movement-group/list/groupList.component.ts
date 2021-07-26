import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { ToastrManager } from 'ng6-toastr-notifications';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GroupService } from '../group.service';
import { Group } from '../group.types';

@Component({
    selector       : 'group-list',
    templateUrl    : './groupList.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupListComponent
{
    @ViewChild('matDrawer', {static: true}) matDrawer: MatDrawer;

    groupCount: number = 0;
    groups$:Observable<Group[]>
    drawerMode: 'side' | 'over';
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    groupTableColumns: string[] = ['description','detail'];
    selectedGroup:any;

    /**
     * Constructor
     */
    constructor(
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _groupService: GroupService,
        public toastr: ToastrManager,
        private translocoService: TranslocoService
    )
    {
        this._groupService.getGroup().subscribe();
    }

    ngOnInit(): void{

        this.groups$ = this._groupService.groups$;
        this._groupService.groups$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((group: Group[]) => {

               if(group){
                this.selectedGroup=group
                this.groupCount = group.length;
               }
                this._changeDetectorRef.markForCheck();
            });
    }

    newGroup(){
        this._router.navigate(['/apps/group/form']);
    }

    deleteGroup(item :any){
        this._groupService.deleteGroup(item).subscribe(data=>{
            this._router.navigateByUrl('/apps/group/list');
            this._groupService.getGroup().subscribe();
            this.toastr.errorToastr(this.translocoService.translate('message.deleteProcessGroup'));
        });
    }
    openGroup(item:any)
    {
        this._router.navigate(['/apps/group/form/'+item.id]);
    }

    onBackdropClicked(): void
    {
        // Go back to the list
        this._router.navigate(['./'], {relativeTo: this._activatedRoute});

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
