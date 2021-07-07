import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { Moment } from 'moment';
import { BaseEntity, Calendar, CalendarEvent, CalendarEventEditMode, CalendarSettings, CalendarWeekday } from 'app/modules/admin/apps/calendar/calendar.types';
import { environment } from 'environments/environment';
import moment from 'moment'; 

@Injectable({
    providedIn: 'root'
})
export class CalendarService
{
    // Private
    private _calendars: BehaviorSubject<Calendar[] | null> = new BehaviorSubject(null);
    private _events: BehaviorSubject<CalendarEvent[] | null> = new BehaviorSubject(null);
    private _loadedEventsRange: { start: Moment | null; end: Moment | null } = {
        start: null,
        end  : null
    };
    private readonly _numberOfDaysToPrefetch = 1;
    private _settings: BehaviorSubject<CalendarSettings | null> = new BehaviorSubject(null);
    private _weekdays: BehaviorSubject<CalendarWeekday[] | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient)
    {
    }
    customers = [];


    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for calendars
     */
    get calendars$(): Observable<Calendar[]>
    {
        return this._calendars.asObservable();
    }

    /**
     * Getter for events
     */
    get events$(): Observable<CalendarEvent[]>
    {
        return this._events.asObservable();
    }

    /**
     * Getter for settings
     */
    get settings$(): Observable<CalendarSettings>
    {
        return this._settings.asObservable();
    }

    /**
     * Getter for weekdays
     */
    get weekdays$(): Observable<CalendarWeekday[]>
    {
        return this._weekdays.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get calendars
     */
    getCalendars(): Observable<Calendar[]>
    {
        return this._httpClient.post<any>(`${environment.url}/users/agent`,{}).pipe(
            tap((response) => {
                this._calendars.next(response.data);
            })
        );
    }
    saveCustomer(frm: any): Observable<any>
    {
        frm.tax_name = '';
        frm.tax_no = '';
        frm.status = '';
        if(frm.id){
            return this._httpClient.put<any>(`${environment.url}/customers/${frm.id}`,frm).pipe(
                tap((response) => {
                   // this._calendars.next(response.data);
                })
            );
    
        }else{
            return this._httpClient.post<any>(`${environment.url}/customers/save`,frm).pipe(
                tap((response) => {
                   // this._calendars.next(response.data);
                })
            );
    
        }
    }

    /**
     * Add calendar
     *
     * @param calendar
     */
    addCalendar(calendar: any): Observable<Calendar>
    {
        return this.calendars$.pipe(
            take(1),
            switchMap(calendars => this._httpClient.post<any>(`${environment.url}/users/save`, {
                user:calendar
            }).pipe(
                map((addedCalendar) => {

                    // Add the calendar
                    calendars.push(addedCalendar.data);

                    // Update the calendars
                    this._calendars.next(calendars);

                    // Return the added calendar
                    return addedCalendar;
                })
            ))
        );
    }

    /**
     * Update calendar
     *
     * @param id
     * @param calendar
     */
    updateCalendar(id: string, calendar: Calendar): Observable<Calendar>
    {
        return this.calendars$.pipe(
            take(1),
            switchMap(calendars => this._httpClient.patch<Calendar>('api/apps/calendar/calendars', {
                id,
                calendar
            }).pipe(
                map((updatedCalendar) => {

                    // Find the index of the updated calendar
                    const index = calendars.findIndex(item => item.id === id);

                    // Update the calendar
                    calendars[index] = updatedCalendar;

                    // Update the calendars
                    this._calendars.next(calendars);

                    // Return the updated calendar
                    return updatedCalendar;
                })
            ))
        );
    }

    /**
     * Delete calendar
     *
     * @param id
     */
    deleteCalendar(id: string): Observable<any>
    {
        return this.calendars$.pipe(
            take(1),
            switchMap(calendars => this._httpClient.delete<Calendar>('api/apps/calendar/calendars', {
                params: {id}
            }).pipe(
                map((isDeleted) => {

                    // Find the index of the deleted calendar
                    const index = calendars.findIndex(item => item.id === id);

                    // Delete the calendar
                    calendars.splice(index, 1);

                    // Update the calendars
                    this._calendars.next(calendars);

                    // Remove the events belong to deleted calendar
                    const events = this._events.value.filter(event => event.calendarId !== id);

                    // Update the events
                    this._events.next(events);

                    // Return the deleted status
                    return isDeleted;
                })
            ))
        );
    }

    /**
     * Get events
     *
     * @param start
     * @param end
     * @param replace
     */
    getEvents(start?: Moment, end?: Moment, replace = false, view?: string): Observable<BaseEntity>
    {
        // Set the new start date for loaded events
        if ( replace || !this._loadedEventsRange.start || start.isBefore(this._loadedEventsRange.start) )
        {
            this._loadedEventsRange.start = start;
        }

        // Set the new end date for loaded events
        if ( replace || !this._loadedEventsRange.end || end.isAfter(this._loadedEventsRange.end) )
        {
            this._loadedEventsRange.end = end;
        }

        // Get the events
       // let url ='api/apps/calendar/events';
        let url = `${environment.url}/appointment/list/${start.toISOString(true)}/${end.toISOString(true)}`;
        return this._httpClient.get<BaseEntity>(url, { 
            params: {
                start: start.toISOString(true),
                end  : end.toISOString(true)
            }
        }).pipe(
            switchMap(response => this._events.pipe(
                take(1),
                map((events) => {
                    
                    response.data.forEach((item,index)=>{
                        item.start = moment(item.start_tmp).toISOString(true);
                        item.end = moment(item.end_tmp).toISOString(true);
                    });
                    
                    
                    if ( replace )
                    {
                        this._events.next(response.data);
                    }
                    else
                    {
                        events = [];
                        this._events.next([...events, ...response.data]);
                    }

                    return response;
                })
            ))
        );
    }

    
    /**
     * Reload events using the loaded events range
     */
    reloadEvents(): Observable<any[]>
    {
        
         
        let url = `${environment.url}/appointment/list/${this._loadedEventsRange.start?.toISOString(true)}/${ this._loadedEventsRange.end.toISOString(true)}`;

        return this._httpClient.get<BaseEntity>(url).pipe(
            map((response) => {
                response.data.forEach((item,index)=>{
                    item.start = moment(item.start_tmp).toISOString(true);
                    item.end = moment(item.end_tmp).toISOString(true);
                });

                
                this._events.next(response.data);

                return response.data;
            })
        );
    }

    /**

    * Prefetch future events
     *
     * @param end
     */
    prefetchFutureEvents(item: Moment): Observable<BaseEntity>
    {
        const start = item.clone().startOf('day');
        item = start.clone().endOf('day');
        return this.getEvents(start, item);
    }
    betweenDateEvents(start: Moment,end: Moment): Observable<BaseEntity>
    {
        return this.getEvents(start, end);
    }

    /**
     * Prefetch past events
     *
     * @param start
     */
    prefetchPastEvents(item: Moment): Observable<BaseEntity>
    {
        const start = item.clone().startOf('day');
        item = start.clone().endOf('day');
        return this.getEvents(start, item);
    }

    /**
     * Add event
     *
     * @param event
     */
    addEvent(event): Observable<CalendarEvent>
    {
        return this.events$.pipe(
            take(1),
            switchMap(events => this._httpClient.post<any>(`${environment.url}/appointment/save` , {
                event
            }).pipe(
                map((addedEvent) => {
                    // Update the events
                    //this._events.next(events);
                    addedEvent.data.start = moment(addedEvent.data.start_tmp).toISOString(true);
                    addedEvent.data.end = moment(addedEvent.data.end_tmp).toISOString(true);
                    this._events.next([addedEvent.data, ...events]);

                    // Return the added event
                    return addedEvent;
                })
            ))
        );
    }

    /**
     * Update event
     *
     * @param id
     * @param event
     */
    updateEvent(event): Observable<CalendarEvent>
    {
        return this.events$.pipe(
            take(1),
            switchMap(events => this._httpClient.post<CalendarEvent>(`${environment.url}/appointment/updateEvent` , {
                event
            }).pipe(
                map((addedEvent) => {
                    this._events.next(events);
                    return addedEvent;
                })
            ))
        );
    }

    /**
     * Update recurring event
     *
     * @param event
     * @param originalEvent
     * @param mode
     */
    updateRecurringEvent(event, originalEvent, mode: CalendarEventEditMode): Observable<boolean>
    {
        return this._httpClient.patch<boolean>('api/apps/calendar/recurring-event', {
            event,
            originalEvent,
            mode
        });
    }

    /**
     * Delete event
     *
     * @param id
     */
    deleteEvent(id: string): Observable<CalendarEvent>
    {
        return this.events$.pipe(
            take(1),
            switchMap(events => this._httpClient.get<CalendarEvent>(`${environment.url}/appointment/delete/${id}`).pipe(
                map((isDeleted) => {
                    /*
                    // Find the index of the deleted event
                    const index = events.findIndex(item => item.id === id);

                    // Delete the event
                    events.splice(index, 1);

                    // Update the events
                    this._events.next(events);
                        */
                    // Return the deleted status
                    return isDeleted;
                })
            ))
        );
    }

    /**
     * Delete recurring event
     *
     * @param event
     * @param mode
     */
    deleteRecurringEvent(event, mode: CalendarEventEditMode): Observable<boolean>
    {
        return this._httpClient.delete<boolean>('api/apps/calendar/recurring-event', {
            params: {
                event: JSON.stringify(event),
                mode
            }
        });
    }

    /**
     * Get settings
     */
    getSettings(): Observable<CalendarSettings>
    {
        return this._httpClient.get<CalendarSettings>('api/apps/calendar/settings').pipe(
            tap((response) => {
                this._settings.next(response);
            })
        );
    }

    /**
     * Update settings
     */
    updateSettings(settings: CalendarSettings): Observable<CalendarSettings>
    {
        return this.events$.pipe(
            take(1),
            switchMap(events => this._httpClient.patch<CalendarSettings>('api/apps/calendar/settings', {
                settings
            }).pipe(
                map((updatedSettings) => {

                    // Update the settings
                    this._settings.next(settings);

                    // Get weekdays again to get them in correct order
                    // in case the startWeekOn setting changes
                    this.getWeekdays().subscribe();

                    // Return the updated settings
                    return updatedSettings;
                })
            ))
        );
    }

    /**
     * Get weekdays
     */
    getWeekdays(): Observable<CalendarWeekday[]>
    {
        return this._httpClient.get<CalendarWeekday[]>('api/apps/calendar/weekdays').pipe(
            tap((response) => {
                this._weekdays.next(response);
            })
        );
    }
    public Customers(): Observable<any> {
        return this._httpClient.get<any>(`${environment.url}/customers/list`);
    
    }
    public Customersv2(): Observable<any> {
        return this._httpClient.get<any>(`${environment.url}/customers/v2list`);
    
    }
    public CustomersFind(search: string): Observable<any> {
        let searchObject ={
            filter: {card_code:search,card_name:search,email:search},
            pageNumber:1,
            pageSize:10,
            sortField:'card_name',
            sortOrder:'asc'
        } 
        return this._httpClient.post<any>(`${environment.url}/customers/find`,{queryParams:searchObject})
        .pipe(tap(data => {
                return this.customers = data.data
        }));
    
    }
    
    public Products(item: any): Observable<any> {
        return this._httpClient.post<any>(`${environment.url}/products/find`,{queryParams:item});

    }
    public addPayment(item: any): Observable<any> {
        return this._httpClient.post<any>(`${environment.url}/payment/save`,{item});

    }
    findEvent(eventId: string) {
        return this._httpClient.get<any>(`${environment.url}/appointment/find/${eventId}`);
   }


}
