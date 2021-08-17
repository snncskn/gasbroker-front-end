import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Data, Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { GeneralFunction } from 'app/shared/GeneralFunction';
import { cloneDeep } from 'lodash';
import moment from 'moment';
import { ToastrManager } from 'ng6-toastr-notifications';
import { Observable } from 'rxjs';
import { ConfirmationDialog } from '../../delete-dialog/delete.component';
import { ApprovalComponent } from '../approvalDialog/approval.component';
import { CustomersService } from '../company.service';
import { MediaService } from "../../media/media.service";
import { AuthService } from 'app/core/auth/auth.service';
import { FileService } from 'app/services/file.service';
import { environment } from 'environments/environment';
import { InitialData } from 'app/app.types';
import { FileUploadComponent } from '@iplab/ngx-file-upload';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: "companyTD",
  templateUrl: "./companyTD.component.html",
  styleUrls: ["./companyTD.component.scss"],
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.None,
})
export class CustomersTDComponent implements OnInit {

  @ViewChild('fileUpload') fileUpload: FileUploadComponent;

  dialogRef: MatDialogRef<ConfirmationDialog>;
  public generalFunction = new GeneralFunction();

  data: InitialData;
  isAdmin: boolean = false;
  approvals$: Observable<any[]>;
  isEditUser: boolean = false;
  customerForm: FormGroup;
  dataSourceTypes: any[];
  dataSourceDocs: any[];
  dataSourceApprovalStatus: any[];
  dataSourceApprovals: any[];
  resetPassForm: FormGroup;
  addressesForm: FormGroup;
  addressList: any[] = [];
  mediaList: any[];
  selectCountryItem: any;
  isLoadAddress: boolean = true;
  isLoading: boolean = false;
  formStatus: boolean = true;
  newAddressItem: any;
  fileDownloadLink: any;
  filteredOptions: Observable<string[]>;
  countries: any[];

  center: google.maps.LatLngLiteral = { lat: 41, lng: 29 };
  zoom = 7;
  markerOptions: google.maps.MarkerOptions = { draggable: false };
  markerPositions: google.maps.LatLngLiteral[] = [];

  addMarker(event: google.maps.MapMouseEvent) {
    this.markerPositions = [];
    this.markerPositions.push(event.latLng.toJSON());
    this.markerPositions.forEach((element) =>
      this.addressesForm.patchValue({
        lat: element.lat,
        long: element.lng,
      })
    );
  }

  //file upload
  public animation: boolean = true;
  public multiple: boolean = false;
  private filesControl = new FormControl(null);
  private label = new FormControl(null);

  public demoForm = new FormGroup({
    files: this.filesControl,
    label: this.label,
  });
  //file upload

  companyDetail: string;
  constructor(
    private router: Router,
    private _formBuilder: FormBuilder,
    private _customersService: CustomersService,
    public toastr: ToastrManager,
    private _router: Router,
    private readonly activatedRouter: ActivatedRoute,
    private fileService: FileService,
    private translocoService: TranslocoService,
    public dialog: MatDialog,
    private mediaService: MediaService,
    private changeDetection: ChangeDetectorRef,
    private authService: AuthService,

  ) {
    this._customersService.getCompanyDocs().subscribe(res => {
      this.dataSourceDocs = res.body;
    });
    /*const button = this.document.getElementById("rejectButton");
    console.log(button)*/
    let center: google.maps.LatLngLiteral = { lat: Number(0), lng: Number(0) };
    this.newAddressItem = { expanded: true, isNew: true, position: center };

    this.customerForm = this._formBuilder.group({
      id: [''],
      name: ['', [Validators.required]],
      full_name: ['', [Validators.required]],
      types: ['', Validators.required],
      registered_date: [new Date(), Validators.required],
      tax_office: ['', Validators.required],
      tax_number: ['', Validators.required],
      phone: [null, Validators.required],
      email: [null, Validators.required],
      website: [null],
      country: [''],
      country_object: [''],
    });

    this.addressesForm = this._formBuilder.group({
      id: [""],
      company_id: this.companyDetail,
      title: [""],
      description: [""],
      type: [""],
      lat: [""],
      long: [""],
    });

    this.activatedRouter.paramMap.subscribe(params => {
      if (params.has('id')) {
        this.isEditUser = true;
        this.companyDetail = params.get("id");
        this._customersService.getCompanyById(params.get("id")).subscribe(data => {
          //this.toastr.warningToastr( this.translocoService.translate('message.no_record'));
          this.customerForm.patchValue(data?.body);
          this.addressesForm.patchValue({ company_id: data.body?.id })
          this.loadAddress();
          this.dataSourceApprovals = [];
          this.mediaList = data?.body.media;
          this.customerForm.value.country = data.body.country;
          this.customerForm.value.country_object = data.body.country_object;
          this._customersService.getApprovals(params.get("id")).subscribe(res => {
            this.dataSourceApprovals = res.body;
          });
        }, error => {

        })
      };
    });
    this._customersService.getCountries().subscribe(data => {
      this.countries = data.body[0].json_value;
      this.filteredOptions = this.customerForm.controls['country_object'].valueChanges.pipe(
        startWith(''),
        map(value => this._filter(value === '' ? '99' : value))
      );
    });

    this._customersService.getTypes().subscribe(res => {
      this.dataSourceTypes = res.body;
    });
    this._customersService.getCompanyApprovalStatus().subscribe(res => {
      this.dataSourceApprovalStatus = res.body;
    });
  }


  ngOnInit(): void {
    let tmp = JSON.parse(localStorage.getItem('user'));
    if (tmp.role == "admin") {
      this.isAdmin = true;
    }
    else {
      this.isAdmin = false;
    }
  }

  private _filter(value: string): string[] {

    let filterValue;
    if (value === '99') {
      filterValue = '';
    } else {
      filterValue = value;
    }
    return this.countries.filter(option => {
      if (typeof filterValue === 'object') {
        return option?.name?.indexOf(filterValue.name) === 0 || option?.name?.indexOf(filterValue.name?.toLowerCase()) === 0;

      } else {
        return option?.name?.indexOf(filterValue) === 0 || option?.name?.indexOf(filterValue?.toLowerCase()) === 0;

      }
    });
  }
  selectCountries(event: any) {
    let option = this.countries.filter(item => item.name.toUpperCase() === event.option.value.name.toUpperCase());
    if (option.length > 0) {
      this.selectCountryItem = option[0];
      this.customerForm.get('country').setValue(option[0].name, { emitEvent: false });
    }
  }

  addNewCompany() {
    let status = this.generalFunction.formValidationCheck(this.customerForm, this.toastr, this.translocoService);
    if (status) {
      return
    }
    let createCompany = {
      id: "",
      types: "",
      full_name: "",
      email: "",
      phone: "",
      name: "",
      website: "",
      registered_date: "",
      tax_number: "",
      tax_office: "",
      country: "",
      country_object: "",
    };
    createCompany.id = this.companyDetail;
    createCompany.types = this.customerForm.value.types;
    createCompany.full_name = this.customerForm.value.full_name;
    createCompany.email = this.customerForm.value.email;
    createCompany.phone = this.customerForm.value.phone;
    createCompany.name = this.customerForm.value.name;
    createCompany.website = this.customerForm.value.website;
    createCompany.tax_number = this.customerForm.value.tax_number;
    createCompany.tax_office = this.customerForm.value.tax_office;
    createCompany.registered_date = this.customerForm.value.registered_date;
    createCompany.country = this.customerForm.value.country;
    createCompany.country_object = this.selectCountryItem;

    this._customersService.createCustomer(createCompany).subscribe((data) => {
      if (this.isAdmin) {
        this._router.navigateByUrl("/apps/company/list");
      }
    });
  }

  deleteCompany() {
    if (this.companyDetail) {
      this.dialogRef = this.dialog.open(ConfirmationDialog, {
        disableClose: false,
      });
      this.dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this._customersService
            .deleteCompany(this.companyDetail)
            .subscribe((data) => {
              this._router.navigateByUrl("/apps/company/list");
            });
        }
        this.dialogRef = null;
      });
    }
  }

  deleteDocs(item) {
    if (item) {
      this.dialogRef = this.dialog.open(ConfirmationDialog, {
        disableClose: false,
      });
      this.dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.isLoading=true;
          this._customersService.deleteDocs(item).subscribe(data => {
            this.loadDocs();
          })
        }
        this.dialogRef = null;
      });
    }
  }

  createAddress() {
    if (this.companyDetail) {
      this.addressesForm.value.company_id = this.companyDetail;
      this.addressesForm.value.lat = String(this.addressesForm.value.lat);
      this.addressesForm.value.long = String(this.addressesForm.value.long);
      this._customersService.createAddress(this.addressesForm.value).subscribe(
        (data) => {
          this.addressesForm.reset();
          this.newAddressItem = { expanded: false, isNew: false };
          this.loadAddress();
        },
        (error) => {
          this.loadAddress();
        }
      );
    }
  }

  newAddress() {
    let tmp = {
      id: "0",
      isNew: true,
      description: "",
      title: "",
      type: "",
      expanded: true,
    };
    this.addressList.splice(0, 0, tmp);
    this.addressesForm.reset();
  }

  loadAddress() {
    this.isLoadAddress = false;

    this.addressList = [];
    this.formStatus = false;
    this._customersService
      .getAddressByCompanyId(this.companyDetail)
      .subscribe((data) => {
        this.addressList = [];
        data.body.forEach((element) => {
          const item = cloneDeep(element);
          item.expanded = false;
          item.isNew = false;
          let center: google.maps.LatLngLiteral = {
            lat: Number(element.latitude),
            lng: Number(element.longitude),
          };
          item.position = center;
          this.addressList.push(item);
          this.changeDetection.detectChanges();
        });
        this.isLoadAddress = true;
        this.formStatus = true;
      });
  }

  loadDocs() {
    this.mediaList = [];
    this.activatedRouter.paramMap.subscribe(params => {
      if (params.has('id')) {
        this._customersService.getCompanyById(params.get("id")).subscribe(data => {
          this.mediaList = data?.body.media;
        })
      };
    });
    this.fileUpload.control.clear();
    this.isLoading=false;
  }

  public toggleStatus(): void {
    this.filesControl.disabled
      ? this.filesControl.enable()
      : this.filesControl.disable();
  }

  public toggleMultiple() {
    this.multiple = !this.multiple;
  }

  public clear(): void {
    this.filesControl.setValue([]);
  }

  upload(item) {
    this.isLoading=true;
    const file = this.demoForm.value.files[0];
    this.fileService.putUrl(file).then((res) => {
      const {
        data: { putURL },
      } = res;

      this.fileService.upLoad(putURL, file).then(
        (res) => {
          this.toastr.successToastr(
            this.translocoService.translate("message.fileUpload")
          );

          let key = this.authService.user_id + '/' + file.name;
          let pathObject = { type: file.type, fileName: file.name, key: key, group: item.description }
          this.mediaService
            .createMedia({
              id: null,
              company_id: this.companyDetail,
              title: "CompanyFile",
              user_id: this.authService.user_id,
              path: pathObject,
            })
            .subscribe((data) => {
              this.toastr.successToastr(
                this.translocoService.translate("message.createMedia"));
              this.loadDocs();
            });

        },
        (error) => {
          this.toastr.errorToastr(
            this.translocoService.translate("message.error")
          );
          this.loadDocs();
        }
      );
    });
  }

  download(key: string) {
    this.fileService.download(key).then(
      (res) => {
        this.toastr.successToastr(
          this.translocoService.translate("message.fileUpload")
        );
      },
      (error) => {
        this.toastr.errorToastr(
          this.translocoService.translate("message.error")
        );
      }
    );
  }

  formUrunEkle(val: any) {
    return new FormBuilder().group({
      files: this.filesControl,
      label: this.label,
    });
  }

  deleteAddress(item: any) {
    this._customersService.deleteAddress(item).subscribe((data) => {
      this.loadAddress();
    });
  }

  approvalStatusDialog(status: string) {
    const dialogRef = this.dialog.open(ApprovalComponent, { data: { company: this.companyDetail, status: status } });
    dialogRef.afterClosed().subscribe(response => {
      this.dataSourceApprovals = [];
      this._customersService.getApprovals(this.companyDetail).subscribe(res => {

        this.dataSourceApprovals = res.body;
        this.changeDetection.detectChanges();
      });
    });
  }


  /**
 * Returns whether the given dates are different days
 *
 * @param current
 * @param compare
 */
  isSameDay(current: string, compare: string): boolean {
    return moment(current, moment.ISO_8601).isSame(moment(compare, moment.ISO_8601), 'day');
  }

  /**
   * Get the relative format of the given date
   *
   * @param date
   */
  getRelativeFormat(date: string): string {
    const today = moment().startOf('day');
    const yesterday = moment().subtract(1, 'day').startOf('day');

    // Is today?
    if (moment(date, moment.ISO_8601).isSame(today, 'day')) {
      return 'Today';
    }

    // Is yesterday?
    if (moment(date, moment.ISO_8601).isSame(yesterday, 'day')) {
      return 'Yesterday';
    }

    return moment(date, moment.ISO_8601).fromNow();
  }

  /**
   * Track by function for ngFor loops
   *
   * @param index
   * @param item
   */
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  clickFile(item) {
    this.fileDownloadLink = `${environment.url}/media/s3/generateGetUrl?Key=` + item?.path.key;
  }
  displayFn(x) {
    return x?.name;
  }

  changedName(value: string) {
    this._customersService.getValidateName(value).subscribe();
  }
}
