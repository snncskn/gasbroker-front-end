import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { clone, cloneDeep, isEqual, omit } from 'lodash-es';
import * as moment from 'moment';

import 'moment-timezone';


import { CalendarService } from '../calendar.service';
import { takeUntil } from 'rxjs/operators';
import { BaseClass, Calendar, CalendarDrawerMode, CalendarEvent, CalendarEventEditMode, CalendarEventPanelMode, CalendarSettings } from 'app/modules/admin/apps/calendar/calendar.types';
import { Subject } from 'rxjs';
import { MatSelectionList, MatSelectionListChange } from '@angular/material/list';
import { Observable } from 'rxjs';
import { tap, startWith, debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { RRule } from 'rrule';
import { CalendarRecurrenceComponent } from 'app/modules/admin/apps/calendar/recurrence/recurrence.component';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';


@Component({
  selector: 'app-event-dialog',
  templateUrl: './event-dialog.component.html',
  styleUrls: ['./event-dialog.component.scss']
})
export class EventDialogComponent {

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
  filteredOptions: Observable<any[]>;


  customers: any[];
  selectCustomerItem: any;
  customerPanel: boolean = false;
  detailPanel: boolean = true;
  eventEditMode: CalendarEventEditMode = 'single';
  event: CalendarEvent;
  @ViewChild('product1', { static: false }) product1: MatSelectionList;
  @ViewChild('product2', { static: false }) product2: MatSelectionList;
  @ViewChild('product3', { static: false }) product3: MatSelectionList;
  displayedColumns: string[] = ['product_name', 'minute', 'price'];

  displayedProductColumns: string[] = ['product_name', 'minute', 'price'];
  dataSourceProduct = new MatTableDataSource<any>();

  dataSourceProductChild = new MatTableDataSource<any>();

  selectData: MatTableDataSource<any>;
  customerForm: FormGroup;
  selectionChild = new SelectionModel<any>(true, []);
  selection = new SelectionModel<any>(true, []);
  selectedEvent: any;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  isLoading: boolean = true;

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    public dialogRef: MatDialogRef<EventDialogComponent>,
    private _snackBar: MatSnackBar,
    private _formBuilder: FormBuilder,
    private _matDialog: MatDialog,
    private _changeDetectorRef: ChangeDetectorRef,
    private _calendarService: CalendarService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.selectData = new MatTableDataSource<any>();
    this.selectedEvent = data;
try {
  if (this.selectedEvent.customer.gender === 'E') {
    this.selectedIndex = 1;
  } else if (this.selectedEvent.customer.gender === 'K') {
    this.selectedIndex = 2;
  } else {
    this.selectedIndex = 0;
  }
} catch (error) {
  this.selectedIndex=1;
}
    this.selectedProducts = [];
    this._calendarService.calendars$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((calendars) => {

        // Store the calendars
        this.calendars = calendars;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
    this._calendarService.settings$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((settings) => {

        // Store the settings
        this.settings = settings;

        // Set the FullCalendar event time format based on the time format setting
        this.eventTimeFormat = {
          hour: settings.timeFormat === '12' ? 'numeric' : '2-digit',
          hour12: settings.timeFormat === '12',
          minute: '2-digit',
          meridiem: settings.timeFormat === '12' ? 'short' : false,
          startTime: '10:00',
          endTime: '18:00',
        };


        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
    this.customerForm = this._formBuilder.group({
      card_name: [''],
      birthday: [''],
      gender: [''],
      email: [''],
      id: [''],
      phone: ['']

    });

    let queryParams = {
      filter: { product_name: "", product_id: "",active:true },
      pageNumber: 1,
      pageSize: 9999,
      sortField: 'id',
      sortOrder: 'asc'
    };
    this.isLoading = false;
    this._calendarService.Products(queryParams).subscribe(data => {
      this.products = cloneDeep(data.products);
      this.products.forEach(element => {
        element.selected = false;
        
      });
      this.dataSourceProduct.data = this.products.filter(item => item.product_code === 'MAN & WOMAN');
      this.dataSourceProductChild.data = this.products.filter(item => item.product_code === 'CHILDREN');
      this.productsChild = this.products.filter(item => item.product_code === 'CHILDREN');
      this.isLoading = true;

      this.productsChild.forEach(item => {
        item.selected = false;
        this.selectedEvent.products?.forEach(element => {
          if (element.id === item.id) {
            item.selected = true;
            this.selection.toggle(element);
          }
        });
      });
      this.productsMan = this.products.filter(item => item.product_code === 'MAN & WOMAN');
      this.productsMan.forEach(item => {
        item.selected = false;
        this.selectedEvent.products?.forEach(element => {
          if (element.id === item.id) {
            item.selected = true;
            this.selection.toggle(element);
          }
        });
      });
      this.productsOap = data.products.filter(item => item.product_code === 'MAN & WOMAN');
      this.productsOap?.forEach(item => {
        data.products?.forEach(element => {
          if (item.id === element.id) {
            item.selected = true;
          }
        });
      });
      this.calculatePrice();

    });

    this.eventForm = this._formBuilder.group({
      id: [''],
      calendarId: [''],
      aop: [true],
      recurringEventId: [null],
      customers: [''],
      customersId: [''],
      description: [''],
      start: [null],
      end: [null],
      allDay: [true],
      duration: [null],
      recurrence: [null],
      range: [{}],
      selectedProduct: [],
      minute: [''],
      price: [''],
      product1: [],
      product2: [],
      product3: [],
    });

    if (!data.id) {
      this.onInit(data);

    } else {
      this.edit(data);

    }

    this.filteredOptions = this.eventForm.get('customers').valueChanges.pipe(
      startWith(''),
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(val => {
        return this.filter(val || '')
      })
    );
    this.list();


  }
  onNoClick(): void {
    this.dialogRef.close();
  }


  addEvent(): void {
    
    this.eventForm.get('selectedProduct').setValue(this.selectedProducts);
    let newEvent = clone(this.eventForm.value);
    if (this.data.id) {
      newEvent.id = this.data.id;
    }
    this.selectData.data.forEach(item =>{
      if (this.eventForm.value.aop) {
        item.price = (item.aop_price);
        item.piece_unit = (item.aop_price);
      }  
    })
    newEvent.price = this.selectedPrice;
    newEvent.minute = this.selectedMin;
    if (newEvent.recurrence) {
      // Set the event duration
      newEvent.duration = moment(newEvent.range.end).diff(moment(newEvent.range.start), 'minutes');
    }
    //newEvent.start = this.eventForm.value.range.start.replace('0+03:00','Z').replace('0+01:00','Z');
    //newEvent.end = this.eventForm.value.range.end.replace('0+03:00','Z').replace('0+01:00','Z');

    newEvent.start = moment(this.eventForm.value.range.start).tz('Europe/London').toISOString();
    newEvent.end = moment(this.eventForm.value.range.end).tz('Europe/London').toISOString();


    newEvent.selectedProduct = this.selectData.data;

    newEvent = omit(newEvent, ['range', 'recurringEventId']);

    // Add the event
    if (this.eventForm.get('customers').value === null &&  !this.data.id) {
      this._snackBar.open('Customer is required', '', { duration: 3000 });
      
    }
    else if (this.selectData.data.length === 0) {
      this._snackBar.open('Product is required', '', { duration: 3000 });
     
    }
    else {
      this._calendarService.addEvent(newEvent).subscribe(() => {
        this._snackBar.open('Event saved', '', { duration: 3000 });
       // this._calendarService.reloadEvents().subscribe();
        this.dialogRef.close();
      }
      );
    }
  }
  getCalendar(id): Calendar {
    if (!id) {
      return { id: '99', color: '', full_name: 'mozcan', visible: true };
    }
    return this.calendars.find(calendar => calendar.id === id);
  }

  change(change: MatSelectionListChange) {
    if (change.option.selected) {
      this.selectedProducts.push(change.option.value);

    } else {
      this.selectedProducts = this.selectedProducts.filter(item => item.id != change.option.value.id);
    }
    this.selectData.data = this.selection.selected;
    this.calculatePrice();

  }
  public onInit(calendarEvent) {
    const userTimezone = 'America/Chicago';

    const start = moment(calendarEvent.startStr).tz('Europe/London').toISOString();
    const end = moment(calendarEvent.endStr).tz('Europe/London').toISOString();
    const endv2 = moment(end).add(this.selectedMin, 'minutes').toISOString();
    let agentID='';
    try {
      agentID= calendarEvent.resource._resource.id
    } catch (error) {
      
    }
    const event = {
      id: null,
      calendarId:agentID ,
      recurringEventId: null,
      isFirstInstance: false,
      customer: '',
      description: '',
      aop: false,
      start: start,
      end: end,
      duration: null,
      allDay: false,
      recurrence: [null],
      range: {
        start: start,
        end: endv2
      }
    };
    this.eventForm.reset();
    this.eventForm.patchValue(event);
  }
  public edit(calendarEvent) {
    this.isLoading = false;
    const start = moment(calendarEvent.start).tz('Europe/London').toISOString();
    const end = moment(calendarEvent.end).tz('Europe/London').toISOString();
    const endv2 = moment(end).add(this.selectedMin, 'minutes').toISOString();
 
    const event = {
      id: calendarEvent.id,
      calendarId: calendarEvent.calendarId,
      recurringEventId: null,
      isFirstInstance: false,
      customer: '',
      aop:  calendarEvent.oap,
      description: calendarEvent.description,
      start: start,
      end: end,
      duration: null,
      allDay: false,
      recurrence: [null],
      range: {
        start: start,
        end: end,
      },
      product1: calendarEvent.products,
      product2: calendarEvent.products,
      product3: calendarEvent.products,
    };
    calendarEvent.products.forEach(element => {
      element.selected = true;
      this.selectedProducts.push(element);
      this.selection.select(element);
      this.selectionChild.select(element);

    });
    this.selection = new SelectionModel<any>(true, calendarEvent.products);
    this.selectionChild = new SelectionModel<any>(true, calendarEvent.products);
    this.selectData.data = this.selection.selected;
    this.eventForm.reset();
    this.eventForm.patchValue(event);
    this.isLoading = true;
    this.calculatePrice();




  }
  
  public list() {
    this._calendarService.Customersv2().subscribe(data => {
      this.customers = data.data;
    });
  }

  filter(val: string): Observable<any[]> {
    
    return this._calendarService.CustomersFind(val)
      .pipe(
        map(response => {
          return response.customers;

        })
      )
  }


  selectCustomer(event: any) {
    let option = this.customers.filter(item => item.card_name.toUpperCase() === event.option.value.toUpperCase());
    if (option.length > 0) {
      this.selectCustomerItem = option[0];
      if (this.selectCustomerItem.gender === 'E') {
        this.selectedIndex = 1;
      } else if (this.selectCustomerItem.gender === 'K') {
        this.selectedIndex = 2;
      } else {
        this.selectedIndex = 0;
      }
      this.eventForm.get('customersId').setValue(option[0].id, { emitEvent: false });
    }


  }

  addCustomer() {
  
    this.customerForm.value.address = '';
    this._calendarService.saveCustomer(this.customerForm.value).subscribe(data => {
      this.selectCustomerItem = this.customerForm.value;
      this.eventForm.get('customers').setValue(this.customerForm.value.card_name);
      this.eventForm.get('customersId').setValue(data.data.id);
      this.selectCustomer = data;
      this._snackBar.open('Customer saved', '', { duration: 3000 });
      this.appointmentPanelShow();
      this.list();
    });
  }

  newCustomerPanelShow() {
    if (this.eventForm.value.customers) {
      if (this.selectCustomerItem) {
        this.selectCustomerItem.card_name = this.selectCustomerItem.card_name[0].toUpperCase()
          + this.selectCustomerItem.card_name.slice(1);
        this.customerForm.patchValue(this.selectCustomerItem);
      }

    } else {
      this.customerForm.reset();
    }
    this.customerPanel = true;
    this.detailPanel = false;
  }

  get recurrenceStatus(): string {
    // Get the recurrence from event form
    const recurrence = this.eventForm.get('recurrence').value;

    // Return null, if there is no recurrence on the event
    if (!recurrence) {
      return null;
    }

    let ruleText = 'asd';
    //      ruleText = ruleText.charAt(0).toUpperCase() + ruleText.slice(1);

    return ruleText;
  }
  openRecurrenceDialog(): void {
    // Open the dialog
    const dialogRef = this._matDialog.open(CalendarRecurrenceComponent, {
      panelClass: 'calendar-event-recurrence-dialog',
      data: {
        event: this.eventForm.value
      }
    });

    // After dialog closed
    dialogRef.afterClosed().subscribe((result) => {

      // Return if canceled
      if (!result || !result.recurrence) {
        return;
      }

      // Only update the recurrence if it actually changed
      if (this.eventForm.get('recurrence').value === result.recurrence) {
        return;
      }

      // If returned value is 'cleared'...
      if (result.recurrence === 'cleared') {
        // Clear the recurrence field if recurrence cleared
        this.eventForm.get('recurrence').setValue(null);
      }
      // Otherwise...
      else {
        // Update the recurrence field with the result
        this.eventForm.get('recurrence').setValue(result.recurrence);
      }
    });
  }

  appointmentPanelShow() {
    this.customerPanel = false;
    this.detailPanel = true;

  }

  closeEvent() {
    this.customerForm.reset();
    this.dialogRef.close();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceProduct.filter = filterValue.trim().toLowerCase();
  }
  checkProduct(row: any) {
    this.isLoading = false;
    let tmp = this.selectData.data;
    row.selected = !row.selected;
    if (row.selected) {
      tmp.push(row);
    } else {
      tmp = tmp.filter(item => item.id != row.id);
    }
    this.selectData.data = tmp;
    this.isLoading = true;
    this.calculatePrice();
    this.dataSourceProduct.data.forEach(item => {
      if (item.id === row.id) {
        item.selected = row.selected;
      }
    });
    this.dataSourceProductChild.data.forEach(item => {
      if (item.id === row.id) {
        item.selected = row.selected
      }
    });

  }

  calculatePrice() {
    this.selectedMin = 0, this.selectedPrice = 0;
    this.selectData.data.forEach(item => {
      this.selectedMin += parseInt(item.minute);
      if (this.eventForm.value.aop) {
        this.selectedPrice += parseInt(item.aop_price);
      } else {
        this.selectedPrice += parseInt(item.price);
      }

    });
    let start = this.eventForm.value.range.start;
    let end = moment(start).add(this.selectedMin, 'minutes').toLocaleString();
    this.eventForm.get('end').setValue(this.eventForm.value.range.end, { emitEvent: false });
    this.eventForm.get('range').setValue({ start: start, end: end });

  }
  public setStyle(it: any, item: any): string {
    if ((it % 2) === 0) {
      return 'zebra';
    } else {
      return '';
    }
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

}
