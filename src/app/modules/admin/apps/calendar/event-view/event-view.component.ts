import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { clone, cloneDeep, isEqual, omit } from 'lodash-es';
import * as moment from 'moment';
import { CalendarService } from '../calendar.service';
import { takeUntil } from 'rxjs/operators';
import { BaseClass, Calendar, CalendarDrawerMode, CalendarEvent, CalendarEventEditMode, CalendarEventPanelMode, CalendarSettings } from 'app/modules/admin/apps/calendar/calendar.types';
import { Subject } from 'rxjs';
import { MatSelectionList, MatSelectionListChange } from '@angular/material/list';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { RRule } from 'rrule';
import { CalendarRecurrenceComponent } from 'app/modules/admin/apps/calendar/recurrence/recurrence.component';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { OverlayRef } from '@angular/cdk/overlay';
import { EventDialogComponent } from '../event-dialog/event-dialog.component';

@Component({
  selector: 'app-event-view',
  templateUrl: './event-view.component.html',
  styleUrls: ['./event-view.component.scss']
})
export class EventViewComponent {

  eventForm: FormGroup;
  selectedProducts: any[];
  selectedPrice: number;
  selectedMin: number;
  calendars: Calendar[];
  settings: CalendarSettings;
  eventTimeFormat: any;
  products: any[];
  productsChild: any[];
  productsMan: any[];
  productsOap: any[];
  icCheck: boolean = false;
  selectedIndex: number = 0;
  filteredOptions: Observable<string[]>;
  customers: any[];
  selectCustomerItem: any;
  customerPanel: boolean = false;
  detailPanel: boolean = true;
  eventEditMode: CalendarEventEditMode = 'single';
  event: any;
  @ViewChild('product1', { static: false }) product1: MatSelectionList;
  @ViewChild('product2', { static: false }) product2: MatSelectionList;
  @ViewChild('product3', { static: false }) product3: MatSelectionList;

  paymentForm: FormGroup;

  displayedProductColumns: string[] = ['select', 'product_name', 'minute', 'price'];
  dataSourceProduct = new MatTableDataSource<any>();

  dataSourceProductChild = new MatTableDataSource<any>();

  selectData: MatTableDataSource<any>;
  customerForm: FormGroup;
  selection = new SelectionModel<any>(true, []);
  isLoading: boolean = true;

  displayedHistoryColumns: string[] = ['date', 'price', 'minute', 'note', 'search'];
  displayedPaymentsColumns: string[] = ['price', 'method','sys_date'];
  displayedColumns: string[] = ['product_name', 'price', 'minute', 'symbol'];
  displayedNotesColumns: string[]=['app_date','therapist','text'];

  panelMode: CalendarEventPanelMode = 'view';
  private _eventPanelOverlayRef: OverlayRef;




  private _unsubscribeAll: Subject<any> = new Subject<any>();


  constructor(
    public dialogRef: MatDialogRef<EventViewComponent>,
    private _calendarService: CalendarService,
    private _matDialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _formBuilder: FormBuilder,
    private _changeDetectorRef: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.selectData = new MatTableDataSource<any>();

    
    this.isLoading = false;
    this._calendarService.findEvent(data.event.id).subscribe(data => {
      this.event = data.data[0];
      this.isLoading = true;
    });
    this.paymentForm = this._formBuilder.group({
      price: [''],
      method: [false]
    });

    this._calendarService.calendars$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((calendars) => {

        // Store the calendars
        this.calendars = calendars;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });

  }

  getCalendar(id): Calendar {
    if (!id) {
      return { id: '99', color: '', full_name: 'mozcan', visible: true };
    }

    return this.calendars.find(calendar => calendar.id === id);
  }


  changeEventPanelMode(panelMode: CalendarEventPanelMode, eventEditMode: CalendarEventEditMode = 'single'): void {
    this.panelMode = panelMode;
    this.eventEditMode = eventEditMode;

    if (panelMode.toString() === 'payments') {
      this.paymentForm.get('price').setValue(this.event.price);
    }
  }


  editEvent(event: any) {
    this._closeEventPanel();

    const dialogRef1 = this._matDialog.open(EventDialogComponent, {
      data: event
    });
    dialogRef1.afterClosed().subscribe((result) => {
      this._calendarService.reloadEvents().subscribe();
    });


  }


  cancelPayment() {
    this.changeEventPanelMode('view', 'single')
  }
  deleteEvent(event, mode: CalendarEventEditMode = 'single'): void {
    this._calendarService.deleteEvent(event.id).subscribe(() => {
      this._calendarService.reloadEvents().subscribe();
      this._closeEventPanel();
    });
  }
  private _closeEventPanel(): void {
    // Detach the overlay from the portal
    this.dialogRef.close();
    this._calendarService.reloadEvents().subscribe();


    // Reset the panel and event edit modes
    this.panelMode = 'view';
    this.eventEditMode = 'single';

    // Mark for check
    this._changeDetectorRef.markForCheck();
  }


  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();

    // Dispose the overlay
    if (this._eventPanelOverlayRef) {
      this._eventPanelOverlayRef.dispose();
    }
  }
  addPayment() {

    let paymentItem = this.paymentForm.value;
    paymentItem.eventId = this.event.id;
    this._calendarService.addPayment(paymentItem).subscribe(data => {
      this.paymentForm.get('price').setValue(data.abs);
      this.event.status = data.status;
      this.event.paymentStatus = data.status === 'success' ?  false: true;
      this.event.payments.push(data.payment);
      this._calendarService.reloadEvents().subscribe();
      this.event.price = data.abs;
      this._snackBar.open('Payment saved', '', { duration: 3000 });
      if(!this.event.paymentStatus){
        this.changeEventPanelMode('view', 'single');

      }

    });

  }
  public setStyle(it: any,item: any): string {
    if ((it % 2) === 0) {
       return 'zebra';
   }else {
       return '';
   }
}

}
