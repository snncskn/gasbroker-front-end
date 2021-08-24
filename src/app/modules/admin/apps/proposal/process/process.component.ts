import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrManager } from "ng6-toastr-notifications";
import { Observable } from "rxjs";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { map, startWith } from "rxjs/operators";
import { ProcessForm } from "../processForm";
import { forkJoin } from 'rxjs';
import { NgxUiLoaderService } from "ngx-ui-loader";
import { TranslocoService } from "@ngneat/transloco";
import { ConfirmationDialog } from "../../delete-dialog/delete.component";
import { MatSidenavContainer } from "@angular/material/sidenav";
import { ProductService } from "../../product/product.service";
import { ProposalService } from "../proposals.service";
import moment from "moment";
import { GeneralFunction } from "app/shared/GeneralFunction";
import { GoogleMap } from "@angular/google-maps";


@Component({
  selector: "proposal-process",
  templateUrl: "./process.component.html",
  styleUrls: ['./process.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ProposalProcessComponent implements OnInit, AfterViewInit {

  @ViewChild(MatSidenavContainer) sidenavContainer: MatSidenavContainer;
  @ViewChild('mapSearchField') searchField: ElementRef;
  @ViewChild(GoogleMap) map: GoogleMap;
  dialogRef: MatDialogRef<ConfirmationDialog>;
  public generalFunction = new GeneralFunction();

  isLoading: boolean = false;
  processForm: FormGroup;
  dataSourceGroup: any[];
  dataSourceSubGroup: any[];
  selectedItem: any;
  productDetail: string;
  customers: any[];
  filteredOptions: Observable<string[]>;
  selectCustomerItem: any;
  processItemsForm: any;
  public processesItemsForm = new ProcessForm();
  selectProductItem: any;
  products: any[];
  array: any[] = ['vendor', 'recipient', 'broker', 'captain', 'agency', 'loading_master'];


  mapOptions = {
    zoomControl: true,
  }

  center: google.maps.LatLngLiteral = { lat: 41, lng: 29 };
  zoom = 7;
  markerOptions: google.maps.MarkerOptions = { draggable: false };
  markerPositions: google.maps.LatLngLiteral[] = [];

  //uzeyr
  items: any[] = [];
  //uzeyr

  addMarker(event: google.maps.MapMouseEvent, item: any) {
    item.markerPositions = [];
    item.latitude = event.latLng.toJSON().lat;
    item.longitude = event.latLng.toJSON().lng;
    item.markerPositions.push(event.latLng.toJSON());
  }
  constructor(
    private router: Router,
    private _formBuilder: FormBuilder,
    private _proposalService: ProposalService,
    public toastr: ToastrManager,
    private _router: Router,
    private readonly ngxService: NgxUiLoaderService,
    private readonly activatedRouter: ActivatedRoute,
    private _matDialog: MatDialog,
    private changeDetection: ChangeDetectorRef,
    private translocoService: TranslocoService
  ) {
    this.processForm = this._formBuilder.group({
      id: [""],
      proposal_id: [''],
      voyage_code: [''],
      recipient_id: [''],
      vendor_id: [''],
      broker_id: [''],
      captain_id: [''],
      agency_id: [''],
      loading_master_id: [''],
      vendor: ['', Validators.required],
      recipient: ['', Validators.required],
      broker: ['', Validators.required],
      captain: ['', Validators.required],
      agency: ['', Validators.required],
      loading_master: ['', Validators.required],

    });
    this._proposalService.getProcessGroup().subscribe(res => {
      this.dataSourceGroup = res.body;
    });
    this.activatedRouter.paramMap.subscribe((params) => {
      if (params.has("id")) {
        this.isLoading = false;
        this.ngxService.start();
        this.list();
        this.processForm.patchValue({
          proposal_id: params.get("id"),
        })
        let processByID = this._proposalService.getProcessByProposalId(params.get("id"));
        let customer = this._proposalService.getCustomers();
        let grp = this._proposalService.getProcessGroup();

        forkJoin(processByID, customer, grp).subscribe(result => {
          this.customers = result[1].body;
          let bodyForm = result[0].body;
          this.dataSourceGroup = result[2].body;
          this.isLoading = true;
          this.processForm.patchValue({
            id: bodyForm?.id,
            voyage_code: bodyForm?.voyage_code,
            agency: this.customers.find(item => item.id === bodyForm?.agency_id),
            agency_id: bodyForm?.agency_id,
            broker: this.customers.find(item => item.id === bodyForm?.broker_id),
            broker_id: bodyForm?.broker_id,
            captain: this.customers.find(item => item.id === bodyForm?.captain_id),
            captain_id: bodyForm?.captain_id,
            loading_master: this.customers.find(item => item.id === bodyForm?.loading_master_id),
            loading_master_id: bodyForm?.loading_master_id,
            vendor: this.customers.find(item => item.id === bodyForm?.vendor_id),
            vendor_id: bodyForm?.vendor_id,
            recipient: this.customers.find(item => item.id === bodyForm?.recipient_id),
            recipient_id: bodyForm?.recipient_id,
          });
          if (bodyForm) {
            this._proposalService.getProcessItemsByProcessId(bodyForm?.id).subscribe(items => {
              this.items = [];
              items.body.forEach(element => {
                element.open = true;
                element.dataSourceGroup = this.dataSourceGroup;
                element.markerPositions = [{ lat: Number(element.latitude), lng: Number(element.longitude) }];
                this._proposalService.getProcessGroupById(element.group_id).subscribe(data => {
                  element.dataSourceSubGroup = data.body.process_sub_groups;
                  this.items.push(element);
                });
              });
              this.isLoading = true;
            }, error => {
              this.isLoading = true;
            });
          }
          this.ngxService.stop();
        });
      }
    });
  }

  ngOnInit(): void { }

  ngAfterViewInit(): void {

    setTimeout(() => {
     
      const searchBox = new google.maps.places.SearchBox(
        this.searchField.nativeElement,
      );
      this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(
        this.searchField.nativeElement,
      );
  
      searchBox.addListener('places_changed', () => {
        const places = searchBox.getPlaces();
        if (places.length === 0) {
          return;
        }
        const bounds = new google.maps.LatLngBounds();
        places.forEach(place => {
          if (!place.geometry || !place.geometry.location) {
            return;
          }
          if (place.geometry.viewport) {
            bounds.union(place.geometry.viewport);
          }
          else {
            bounds.extend(place.geometry.location);
          }
        });
        this.map.fitBounds(bounds);
      });
    }, 5000);

    this.list();
  }

  changeGroup(val: string, item: any) {
    this._proposalService.getProcessGroupById(val).subscribe(data => {
      this.dataSourceSubGroup = data.body.process_sub_groups;
      item.dataSourceSubGroup = data.body.process_sub_groups;
      if (this.selectedItem) {
        this.processItemsForm.patchValue({ group_sub_id: this.selectedItem.group_sub_id, group_id: val });
      }
    });
  }

  add(item?: any) {
    item.dataSourceGroup = this.dataSourceGroup;
    this.addNewProcess(true);
    this.items.push(item);
    this.items.forEach(item => {
      item.open = false;
    })
    this.changeDetection.detectChanges();

  }
  public list() {

    this._proposalService.getCustomers().subscribe(data => {
      this.customers = data.body;
      this.array.forEach(element => {
        this.filteredOptions = this.processForm.controls[element].valueChanges.pipe(
          startWith(''),
          map(value => {
            return this._filter(value === '' ? '99' : value)
          })
        );
      });
    });
  }

  private _filter(value: string): string[] {

    let filterValue;
    if (value === '99') {
      filterValue = '';
    } else {
      filterValue = value;
    }
    return this.customers;
    /*
    return this.customers.filter(option => {
      if (typeof filterValue === 'object') {
        return option?.full_name?.indexOf(filterValue.full_name) === 0 || option?.full_name?.indexOf(filterValue.full_name?.toLowerCase()) === 0;

      } else {
        return option?.full_name?.indexOf(filterValue) === 0 || option?.full_name?.indexOf(filterValue?.toLowerCase()) === 0;

      }
    });
    */
  }
  selectCustomer(event: any, prm: string) {
    let option = this.customers.filter(item => item.full_name.toUpperCase() === event.option.value.full_name.toUpperCase());
    if (option.length > 0) {
      this.selectCustomerItem = option[0];
      this.processForm.get(prm).setValue(option[0].id, { emitEvent: false });
    }
  }
  displayFn(x) {
    return x?.full_name;
  }

  addNewProcess(router?: boolean) {
    let status = this.generalFunction.formValidationCheck(this.processForm, this.toastr, this.translocoService);
    if (status) {
      return
    }
    this._proposalService.createProcess(this.processForm.value).subscribe(data => {

      this.processForm.value.id = data.id;
      if (!router) {
        this._router.navigate(["/apps/proposals/list"]);
      }
    });
    this.changeDetection.detectChanges();

  }

  position(item: any) {
    let center: google.maps.LatLngLiteral = {
      lat: Number(item.value.latitude),
      lng: Number(item.value.longitude),
    };
    return center;
  }

  saveProcessItems(item: any, address: string) {
    item.open = false;
    item.address = address;
    item.process_id = this.processForm.value.id;
    this._proposalService.createProcessItem(item).subscribe(data => {
      this._proposalService.getProcessItemsByProcessId(this.processForm.value.id).subscribe(items => {
        this.items = [];
        items.body.forEach(element => {
          element.open = true;
          element.dataSourceGroup = this.dataSourceGroup;
          element.markerPositions = [{ lat: Number(element.latitude), lng: Number(element.longitude) }];
          this._proposalService.getProcessGroupById(element.group_id).subscribe(data => {
            element.dataSourceSubGroup = data.body.process_sub_groups;
            this.items.push(element);
          });

        });
        this.isLoading = true;
      }, error => {
        this.isLoading = true;
      });
    });

    this.changeDetection.detectChanges();

  }

  deleteProcess() {

    this._proposalService.deleteProcess(this.processForm.value.id).subscribe(data => {
      this.items.forEach(element => {
        this._proposalService.deleteProcessItem(element.id).subscribe();
      });
      this._router.navigate(["/apps/proposals/list"]);


    })
  }

  deleteProcessItem(item: any, i: number) {
    if (item.id) {
      this._proposalService.deleteProcessItem(item.id).subscribe(data => {
        this.items = this.items.filter(it => it.id !== item.id);
        this.changeDetection.detectChanges();

        this.toastr.successToastr(this.translocoService.translate('message.deleteProcessItem'));
      });

    } else {
      this.items = this.items.filter((it, index) => index !== i);
    }
  }
  processDateChange(item, value) {
    item.process_date = moment(value, "DD-MM-YYYY");
  }
  public trackItem(index: number, item: any) {
    return item.id;
  }

  openAccordion(item: any) {
    item.open = !item.open;
  }
}
