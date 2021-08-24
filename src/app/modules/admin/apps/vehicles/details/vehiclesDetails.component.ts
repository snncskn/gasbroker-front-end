import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { FileUploadComponent } from '@iplab/ngx-file-upload';
import { TranslocoService } from '@ngneat/transloco';
import { AuthService } from 'app/core/auth/auth.service';
import { FileService } from 'app/services/file.service';
import { GeneralFunction } from 'app/shared/GeneralFunction';
import { environment } from 'environments/environment';
import { ToastrManager } from 'ng6-toastr-notifications';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ConfirmationDialog } from '../../delete-dialog/delete.component';
import { MediaService } from '../../media/media.service';
import { VehiclesService } from '../vehicles.service';

@Component({
    selector: 'vehiclesDetails',
    templateUrl: './vehiclesDetails.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehiclesDetailsComponent implements OnInit {

  @ViewChild('fileUpload')fileUpload: FileUploadComponent;

    dialogRef: MatDialogRef<ConfirmationDialog>;
    public generalFunction = new GeneralFunction();

    vehicleForm: FormGroup;
    dataSourceTypes: any[];
    vehicleDetail: string;
    customers: any[];
    mediaList: any[];
    filteredOptions: Observable<string[]>;
    selectCustomerItem: any;
    dataSourceDocs: any[];
    fileDownloadLink:any;
    isLoadDocs: boolean = true;
    isLoading: boolean = false;


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


    constructor(
        private router: Router,
        private _formBuilder: FormBuilder,
        private _vehicleService: VehiclesService,
        public toastr: ToastrManager,
        private _router: Router,
        private fileService: FileService,
        private readonly activatedRouter: ActivatedRoute,
        private translocoService: TranslocoService,
        private dialog: MatDialog,
        private mediaService: MediaService,
        private authService: AuthService,
        private changeDetection: ChangeDetectorRef,
        private readonly ngxService: NgxUiLoaderService,

    ) {
      this.ngxService.start();
        this.list();
        this.vehicleForm = this._formBuilder.group({
            id: [''],
            company_id: [''],
            company: ['',[Validators.required]],
            name: ['', [Validators.required]],
            type: ['',[Validators.required]],
            registered_date: [null,[Validators.required]],
        });
        
     
      this._vehicleService.getTypes().subscribe(res => {
          this.dataSourceTypes = res.body;
      });
      this._vehicleService.getVehicleDocs().subscribe(res => {
          this.dataSourceDocs = res.body;
      });
    this.ngxService.stop();  
    }

    ngOnInit(): void {


    }

    addNewVehicle() {
        let status = this.generalFunction.formValidationCheck(this.vehicleForm,this.toastr,this.translocoService);
        if(status)
        {
          return
        }
        
        let createVehicle = {
            id: '', type: '', name: '', company_id: '', registered_date: ''};

        createVehicle.id = this.vehicleDetail;
        createVehicle.type = this.vehicleForm.value.type;
        createVehicle.name = this.vehicleForm.value.name;
        createVehicle.company_id = this.vehicleForm.value.company_id;
        createVehicle.registered_date = this.vehicleForm.value.registered_date;

        if(createVehicle.company_id ===''){
            this.toastr.errorToastr(this.translocoService.translate('message.requiredCompany'));
            return;
        }
        this._vehicleService.createVehicle(createVehicle).subscribe(data => {
        this._router.navigateByUrl('/apps/vehicles/list');
        });
    }

    private _filter(value: string): string[] {

        let filterValue;
        if (value === '99') {
          filterValue = '';
        } else {
          filterValue = value;
        }
    
        return this.customers.filter(option => {
            if( typeof filterValue === 'object'){
                return option?.full_name?.indexOf(filterValue.full_name) === 0 || option?.full_name?.indexOf(filterValue.full_name?.toLowerCase()) === 0;

            }else{
                return option?.full_name?.indexOf(filterValue) === 0 || option?.full_name?.indexOf(filterValue?.toLowerCase()) === 0;

            }
        });
    }

    public list() {
        this._vehicleService.getCustomers().subscribe(data => {
          this.customers = data.body;
          this.activatedRouter.paramMap.subscribe(params => {
            if (params.has('id')) {
                this._vehicleService.getVehicleById(params.get("id")).subscribe(data=>{
                    this.vehicleDetail = data.body.id;
                    this.vehicleForm.patchValue(data.body);
                    this.vehicleForm.value.company_id = data.body.company.id;
                    this.vehicleForm.value.company = data.body.company.name;
                    this.mediaList = data?.body.media;
                }) 
            };
        });
        this.filteredOptions = this.vehicleForm.controls['company'].valueChanges.pipe(
        startWith(''),
        map(value => this._filter(value === '' ? '99' : value))
        );
        });
    }
    loadDocs() {
      this.isLoadDocs = false;
      this.mediaList = [];
      this.activatedRouter.paramMap.subscribe(params => {
        if (params.has('id')) {
          this._vehicleService.getVehicleById(params.get("id")).subscribe(data => {
                this.mediaList = data?.body.media;
                this.changeDetection.detectChanges();
            })
        };
      });
      this.filesControl.setValue([]);
      this.isLoadDocs = true;
      this.isLoading = false;
    }

    selectCustomer(event: any) {
        let option = this.customers.filter(item => item.full_name.toUpperCase() === event.option.value.full_name.toUpperCase());
        if (option.length > 0) {
          this.selectCustomerItem = option[0];
          this.vehicleForm.get('company_id').setValue(option[0].id, { emitEvent: false });
        }
    }
    displayFn(x) {
        return x.full_name;
      }

    deleteVehicle()
    {
        if(this.vehicleDetail)
        {
            this.dialogRef = this.dialog.open(ConfirmationDialog, {
                disableClose: false
              });
              this.dialogRef.afterClosed().subscribe(result => {
                if(result) {
                    this._vehicleService.deleteVehicle(this.vehicleDetail).subscribe();
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
            this.isLoading = true;
            this._vehicleService.deleteDocs(item).subscribe(data => {
              this.loadDocs();
            })
          }
          this.dialogRef = null;
        });
      }
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
        this.isLoading = true;
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
              let str = file.name;
              var last = str.substring(str.lastIndexOf(".") + 1, str.length);
              let key = this.authService.user_id + '/'+ file.name;
              let pathObject = {type:last, fileName:file.name, key:key, group: item.description}
              this.mediaService
                .createMedia({
                  id: null,
                  vehicle_id: this.vehicleDetail,
                  title: "VehicleFile",
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
      clickFile(item)
      {
        this.fileDownloadLink = `${environment.url}/media/s3/generateGetUrl?Key=`+item?.path.key;
      }
}
