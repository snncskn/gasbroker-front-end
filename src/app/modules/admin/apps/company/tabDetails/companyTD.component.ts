import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { FileUploadValidators } from '@iplab/ngx-file-upload';
import { TranslocoService } from '@ngneat/transloco';
import { UploadService } from 'app/services/upload.service';
import { GeneralFunction } from 'app/shared/GeneralFunction';
import { valid } from 'chroma-js';
import { Console } from 'console';
import { cloneDeep, isNull } from 'lodash';
import moment from 'moment';
import { ToastrManager } from 'ng6-toastr-notifications';
import { Observable } from 'rxjs';
import { ConfirmationDialog } from '../../delete-dialog/delete.component';
import { ApprovalComponent } from '../approvalDialog/approval.component';
import { CustomersService } from '../company.service';

@Component({
  selector: "companyTD",
  templateUrl: "./companyTD.component.html",
  styleUrls: ["./companyTD.component.scss"],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomersTDComponent implements OnInit {

  dialogRef: MatDialogRef<ConfirmationDialog>;
  public generalFunction = new GeneralFunction();

  approvals$: Observable<any[]>;
  isEditUser:boolean=false;
  customerForm: FormGroup;
  dataSourceTypes: any[];
  dataSourceDocs: any[];
  dataSourceApprovalStatus: any[];
  dataSourceApprovals: any[];
  resetPassForm: FormGroup;
  addressesForm: FormGroup;
  addressList: any[] = [];
  isLoadAddress: boolean = true;
  formStatus: boolean = true;
  newAddressItem: any;

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
  public animation: boolean = false;
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
    private uploadService: UploadService,
    private translocoService: TranslocoService,
    public dialog: MatDialog

  ) {
   
    let center: google.maps.LatLngLiteral = { lat: Number(0), lng: Number(0) };
    this.newAddressItem = {expanded:true,isNew:true,position:center};

    this.customerForm = this._formBuilder.group({
        id: [''],
        full_name: ['', [Validators.required]],
        name: ['', [Validators.required]],
        types: ['', Validators.required],
        registered_date: [null,Validators.required],
        tax_office: ['', Validators.required],
        tax_number: ['', Validators.required],
        phone: [null, Validators.required],
        email: [null, Validators.required],
        website: [null],
    });

    this.addressesForm = this._formBuilder.group({
        id: [''],
        company_id: this.companyDetail,
        title: [''],
        description: [''],
        type: [''],
        lat: [''],
        long: [''],
    })

    this.activatedRouter.paramMap.subscribe(params => {
        if (params.has('id')) {
          this.isEditUser=true;
            this._customersService.getCompanyById(params.get("id")).subscribe(data => {
                //this.toastr.warningToastr( this.translocoService.translate('message.no_record'));
                this.companyDetail = data.body?.id;
                this.customerForm.patchValue(data?.body);
                this.addressesForm.patchValue({company_id:data.body?.id})
                this.loadAddress();
                this._customersService.getApprovals(params.get("id")).subscribe(res => {
                  this.dataSourceApprovals= res.body;
                  console.log(this.dataSourceApprovals);
                });
            },error=>{
                
            })
        };
    });

    this._customersService.getTypes().subscribe(res => {
      this.dataSourceTypes = res.body;
    });
    this._customersService.getCompanyDocs().subscribe(res => {
      this.dataSourceDocs = res.body;
    });
    this._customersService.getCompanyApprovalStatus().subscribe(res => {
      this.dataSourceApprovalStatus = res.body;
    });
    }
 

  ngOnInit(): void {
  }

  addNewCompany() {
    let status = this.generalFunction.formValidationCheck(this.customerForm,this.toastr,this.translocoService);
    if(status)
    {
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

    this._customersService.createCustomer(createCompany).subscribe((data) => {
      this._router.navigateByUrl("/apps/company/list");
    });
  }

  deleteCompany() {
    
    if (this.companyDetail) {
      this.dialogRef = this.dialog.open(ConfirmationDialog, {
        disableClose: false
      });
      this.dialogRef.afterClosed().subscribe(result => {
        if(result) {
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
        });
        this.isLoadAddress = true;
        this.formStatus = true;
      });
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

  upload() {
    const file = this.demoForm.value.files[0];
    this.uploadService.putUrl(file).then((res) => {
      const {
        data: { putURL },
      } = res;

      this.uploadService.upLoad(putURL, file).then((res) => {
        this.toastr.warningToastr("Yuppii...", "Success!");
        // this.mediaService.create({id:null,company_id: this.companyDetail, title: ret.putURL}).subscribe((data) => { });
      });
    });
  }

    
  formUrunEkle(val: any){ 
      return new FormBuilder().group({
          files: this.filesControl,
          label: this.label,
      })
  }
  deleteAddress(item : any){
      this._customersService.deleteAddress(item).subscribe(data=>{
          this.loadAddress();
      });
  }

  approvalStatusDialog(status:string)
  {
    console.log(this.dataSourceApprovalStatus);
    const dialogRef = this.dialog.open(ApprovalComponent, { data:{company:this.companyDetail, status:status} });
    dialogRef.afterClosed().subscribe();
  }


      /**
     * Returns whether the given dates are different days
     *
     * @param current
     * @param compare
     */
       isSameDay(current: string, compare: string): boolean
       {
           return moment(current, moment.ISO_8601).isSame(moment(compare, moment.ISO_8601), 'day');
       }
   
       /**
        * Get the relative format of the given date
        *
        * @param date
        */
       getRelativeFormat(date: string): string
       {
           const today = moment().startOf('day');
           const yesterday = moment().subtract(1, 'day').startOf('day');
   
           // Is today?
           if ( moment(date, moment.ISO_8601).isSame(today, 'day') )
           {
               return 'Today';
           }
   
           // Is yesterday?
           if ( moment(date, moment.ISO_8601).isSame(yesterday, 'day') )
           {
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
       trackByFn(index: number, item: any): any
       {
           return item.id || index;
       }
}
