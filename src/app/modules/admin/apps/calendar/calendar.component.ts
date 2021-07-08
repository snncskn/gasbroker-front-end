
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { MatDrawer } from '@angular/material/sidenav';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { Calendar as FullCalendar, CalendarOptions, DateSelectArg, EventApi, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import momentPlugin from '@fullcalendar/moment';
import rrulePlugin from '@fullcalendar/rrule';
import timeGridPlugin from '@fullcalendar/timegrid';
import { clone, cloneDeep, isEqual, omit } from 'lodash-es';
import * as moment from 'moment';
import { RRule } from 'rrule';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { CalendarRecurrenceComponent } from 'app/modules/admin/apps/calendar/recurrence/recurrence.component';
import { CalendarService } from 'app/modules/admin/apps/calendar/calendar.service';
import { BaseClass, Calendar, CalendarDrawerMode, CalendarEvent, CalendarEventEditMode, CalendarEventPanelMode, CalendarSettings } from 'app/modules/admin/apps/calendar/calendar.types';
import { map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ApiService } from 'app/services/api.service';
import { MatSelectionListChange } from '@angular/material/list';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EventDialogComponent } from './event-dialog/event-dialog.component';
import { MatTableDataSource } from '@angular/material/table';
import { createEventId, INITIAL_EVENTS } from './event-utils';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
import { environment } from 'environments/environment';
import { EventViewComponent } from './event-view/event-view.component';
import tippy from 'tippy.js';



@Component({
    selector: 'calendar',
    templateUrl: './calendar.component.html',
    styleUrls: ['./calendar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class CalendarComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('eventPanel') private _eventPanel: TemplateRef<any>;
    @ViewChild('fullCalendar') private _fullCalendar: FullCalendarComponent;
    @ViewChild('drawer') private _drawer: MatDrawer;

    calendars: Calendar[];
    calendarPlugins: any[] = [dayGridPlugin, interactionPlugin, listPlugin, momentPlugin, rrulePlugin, timeGridPlugin];
    drawerMode: CalendarDrawerMode = 'side';
    drawerOpened: boolean = true;
    event: BaseClass;
    eventEditMode: CalendarEventEditMode = 'single';
    eventTimeFormat: any;
    events: CalendarEvent[] = [];
    currentEvents: EventApi[] = [];
    agends: any[] = [];

    settings: CalendarSettings;
    view: 'resourceTimeGridDay' | 'resourceTimeGridWeek' | 'timeGridDay' | 'listYear' | 'resourceTimeGridFourDay' = 'resourceTimeGridDay';
    views: any;
    viewTitle: string;
    private _fullCalendarApi: FullCalendar;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    filteredOptions: Observable<string[]>;
    private _eventPanelOverlayRef: OverlayRef;
    currentView: string;



    //mozcan
    customers: any[];
    products: any[];
    selectedProducts: any[];
    selectedPrice: number;
    selectedMin: number;
    @ViewChild('product1') product1;
    @ViewChild('product2') product2;
    @ViewChild('product3') product3;
    displayedColumns: string[] = ['product_name', 'price', 'minute', 'symbol'];
    displayedHistoryColumns: string[] = ['date', 'price', 'minute', 'note', 'search'];
    displayedPaymentsColumns: string[] = ['price', 'sys_date'];
    icCheck: boolean = false;
    step = 0;
    selectedIndex: number = 0;
    customerPanel: boolean = false;
    detailPanel: boolean = true;
    selectCustomerItem: any;
    dataSourceProduct = new MatTableDataSource<any>();

    isLoading: boolean = true;

    /**
     * Constructor
     */
    constructor(
        private _calendarService: CalendarService,
        private _changeDetectorRef: ChangeDetectorRef,
        @Inject(DOCUMENT) private _document: Document,
        private _formBuilder: FormBuilder,
        private _matDialog: MatDialog,
        private _overlay: Overlay,
        private _snackBar: MatSnackBar,
        public dialog: MatDialog,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _viewContainerRef: ViewContainerRef
    ) {
        let queryParams = {
            filter: { product_name: "", product_id: "" },
            pageNumber: 1,
            pageSize: 9999,
            sortField: 'id',
            sortOrder: 'asc'
        };
        this._calendarService.Products(queryParams).subscribe(data => {
            this.products = data.data;
            this.dataSourceProduct.data = data.data;
        })
        this.selectedProducts = [];
        this.selectedMin = 0;
        this.selectedPrice = 0;

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

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.isLoading = false;

        this._calendarService.calendars$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((calendars) => {

                // Store the calendars
                this.calendars = calendars;
                this.calendars.forEach(item => {
                    this.agends.push({
                        id: item.id,
                        title: item.full_name
                    });
                })

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get events
        this._calendarService.events$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((events) => {
                this.events = cloneDeep(events);
                this.reload();
                this._changeDetectorRef.markForCheck();
            });

        // Get settings
        this._calendarService.settings$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((settings) => {
                this.settings = settings;
                this.eventTimeFormat = {
                    hour: settings.timeFormat === '12' ? 'numeric' : '2-digit',
                    hour12: settings.timeFormat === '24',
                    minute: '2-digit',
                    meridiem: settings.timeFormat === '24' ? 'long' : false,
                    startTime: '08:00',
                    endTime: '22:00',
                };
                this._changeDetectorRef.markForCheck();
            });
        setTimeout(() => {
            this.changeView('resourceTimeGridDay');
        }, 3000);
        this.isLoading = true;
    }
    ngAfterViewInit(): void {
        this.isLoading = false;
        // Get the full calendar API
        this._fullCalendarApi = this._fullCalendar.getApi();

        // Get the current view's title
        this.viewTitle = this._fullCalendarApi.view.title;
        // const viewStart = moment(this._fullCalendarApi.view.currentStart).subtract(7, 'days');
        const viewStart = moment(this._fullCalendarApi.view.currentStart);
        //const viewEnd = moment(this._fullCalendarApi.view.currentEnd).add(7, 'days');
        const viewEnd = moment(this._fullCalendarApi.view.currentEnd);
        // Get events
        this._calendarService.getEvents(viewStart, viewEnd, true, this._fullCalendarApi.view.title).subscribe();
        this.isLoading = true;

    }
    toggleDrawer(): void {
        // Toggle the drawer
        this._drawer.toggle();
    }

    getCalendar(id): Calendar {
        if (!id) {
            return { id: '99', color: '', full_name: 'mozcan', visible: true };
        }

        return this.calendars.find(calendar => calendar.id === id);
    }

    changeView(view: 'resourceTimeGridDay' | 'resourceTimeGridWeek' | 'timeGridDay' | 'listYear'): void {
        // Store the view
        this.view = view;
        // If the FullCalendar API is available...

        if (this._fullCalendarApi) {
            // Set the view
            this._fullCalendarApi.changeView(view);

            // Update the view title
            this.viewTitle = this._fullCalendarApi.view.title;
        }

    }
    reload() {

        this.isLoading = false;
        this.calendarOptions.events = [];
        this.calendarOptions.events = this.events;
        this.agends = [];
        this.calendars?.forEach(agent => {

            let filter = this.events?.filter(item => (item.resourceId === agent.id));

            if (filter?.length > 0) {
                let t = this.agends.filter(item => item.id === agent.id);
                if (t.length === 0) {
                    this.agends.push({
                        id: agent.id,
                        title: agent.full_name,
                    });

                }
            }
        });
        this.calendarOptions.resources = this.agends;
        this.isLoading = true;
    }

    /**
     * Moves the calendar one stop back
     */
    previous(): void {

        // o to previous stop
        this._fullCalendarApi.prev();

        // Update the view title
        this.viewTitle = this._fullCalendarApi.view.title;

        // Get the view's current start date
        const start = moment(this._fullCalendarApi.view.currentStart);

        // Prefetch past events
        this._calendarService.prefetchPastEvents(start).subscribe();

    }

    /**
     * Moves the calendar to the current date
     */
    today(): void {

        this._fullCalendarApi.today();
        this.viewTitle = this._fullCalendarApi.view.title;
        const start = moment(this._fullCalendarApi.view.currentStart);
        this._calendarService.prefetchPastEvents(start).subscribe();

    }

    /**
     * Moves the calendar one stop forward
     */
    next(): void {
        // Go to next stop
        this._fullCalendarApi.next();

        // Update the view title
        this.viewTitle = this._fullCalendarApi.view.title;

        // Get the view's current end date
        const end = moment(this._fullCalendarApi.view.currentStart);

        // Prefetch future events
        this._calendarService.prefetchFutureEvents(end).subscribe();
    }

    onDateClick(calendarEvent): void {
        const today = moment();
        if (today.year() > this._fullCalendarApi.view.currentStart.getFullYear()) {
            this._fullCalendarApi.unselect();
        }
        else if (today.month() > this._fullCalendarApi.view.currentStart.getMonth()) {
            this._fullCalendarApi.unselect();
        }
        else if (today.year() == this._fullCalendarApi.view.currentStart.getFullYear() && today.month() == this._fullCalendarApi.view.currentStart.getMonth() && today.date() > this._fullCalendarApi.view.currentStart.getDate()) {
            this._fullCalendarApi.unselect();
        }
        else {
            const dialogRef = this.dialog.open(EventDialogComponent, { data: calendarEvent });
            dialogRef.afterClosed().subscribe(result => {

            });
            let baseEntity = new BaseClass();
            this.event = baseEntity;
        }
    }

    onEventClick(calendarEvent): void {

        const dialogRef = this.dialog.open(EventViewComponent, { data: calendarEvent });

        dialogRef.afterClosed().subscribe(result => {


        });

        const event: any = cloneDeep(this.events.find(item => item.id === calendarEvent.event.id));

        this._calendarService.findEvent(calendarEvent.event.id).subscribe(data => {
            this.event = data.data[0];

            // Prepare the end value
            let end;

            // If this is a recurring event...
            if (event.recuringEventId) {
                // Calculate the end value using the duration
                end = moment(event.start).add(event.duration, 'minutes').toISOString();
            }
            // Otherwise...
            else {
                // Set the end value from the end
                end = event.end;
            }

            // Set the range on the event
            event.range = {
                start: event.start,
                end
            };

            // Open the event panel
            // this._openEventPanel(calendarEvent);

        });
        // Set the event
        this.event = event;

        // Prepare the end value
        let end;

        // If this is a recurring event...
        if (event.recuringEventId) {
            // Calculate the end value using the duration
            end = moment(event.start).add(event.duration, 'minutes').toISOString();
        }
        // Otherwise...
        else {
            // Set the end value from the end
            end = event.end;
        }

        // Set the range on the event
        event.range = {
            start: event.start,
            end
        };

        // Open the event panel
        //this._openEventPanel(calendarEvent);
        this.reload();

    }
    resourceLabelClassNames(arg): string {
        if (this.calendars) {
            const agent = this.calendars.find(item => item.id === arg.resource.id);
            if (agent) {
                return agent.color;
            }
        }
    }

    calendarOptions: CalendarOptions = {
        //schedulerLicenseKey: '0123137743-fcs-1624475470',
        timeZone: 'Europe/London',
        plugins: [resourceTimeGridPlugin, dayGridPlugin, interactionPlugin, timeGridPlugin],
        initialView: 'resourceTimeGridDay',
        resourceLabelClassNames: this.resourceLabelClassNames.bind(this),
        businessHours: {
            daysOfWeek: [1, 2, 3, 4, 5, 6],
            startTime: '08:00',
            endTime: '22:00',
        },
        slotMinTime: '08:00',
        slotMaxTime: '22:00',
        eventConstraint: 'businessHours',
        initialEvents: INITIAL_EVENTS,
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'resourceTimeGridDay,resourceTimeGridFourDay,dayGridMonth'
        },
        customButtons: {
            next: {
                click: this.next.bind(this),
            },
            prev: {
                click: this.previous.bind(this),
            }
        },
        eventDidMount: function(info) {
        },
        slotDuration: { minutes: 15 },
        slotLabelInterval: { hours: 1 },
        slotLabelFormat: { hour: 'numeric', minute: '2-digit', hour12: false },
        views: {
            resourceTimeGridDay: {
                buttonText: 'Day',
            },
            resourceTimeGridFourDay: {
                type: 'resourceTimeGrid',
                buttonText: 'Week',
                duration: { days: 7 }
            },
            dayGridMonth: {
                buttonText: 'Month',
            }
        },

        eventContent: function (arg) {
            return {
                // html: arg.event.title + '<br/><b>'+arg.timeText+'</b>'
                html: arg.event.title
            }
        },
        allDaySlot: false,
        weekends: true,
        editable: true,
        selectable: true,
        selectMirror: true,
        dayMaxEvents: true,
        select: this.onDateClick.bind(this),
        eventClick: this.onEventClick.bind(this),
        eventsSet: this.handleEvents.bind(this),
        eventDrop: this.eventStartEditable.bind(this),
        events: this.events,
        resources: this.agends,

    };
    eventStartEditable(drp: any) {
        let newEvent = cloneDeep(drp.event.extendedProps);
        if (drp.event.extendedProps.paymentStatus) {
            newEvent.selectedProduct = drp.event.extendedProps.products;
            newEvent.id = drp.event.id;
            newEvent.start = moment(drp.event.start.toISOString()).tz('Europe/London').add(-1, 'hours').toISOString();
            newEvent.end = moment(drp.event.end.toISOString()).tz('Europe/London').add(-1, 'hours').toISOString();
            this._calendarService.updateEvent(newEvent).subscribe(() => {
                this._snackBar.open('Event update', '', { duration: 3000 });
                this._calendarService.reloadEvents().subscribe();
            });
        } else {
            this._snackBar.open('Event closed', '', { duration: 3000 });
            this._calendarService.reloadEvents().subscribe();

        }

    }
    handleEvents(events: EventApi[]) {
        if (this._fullCalendarApi) {
            if (this._fullCalendarApi.view.type !== this.currentView) {
                let currentStart = moment(this._fullCalendarApi.view.currentStart)
                let currentEnd = moment(this._fullCalendarApi.view.currentEnd)
                this._calendarService.betweenDateEvents(currentStart, currentEnd).subscribe();
                this.currentView = this._fullCalendarApi.view.type;
            }
        }
        this.currentEvents = events;
    }
}
