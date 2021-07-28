import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, Renderer2, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ProductService } from '../../product/product.service';
import { InventoryProduct } from '../../product/product.types';
import { tap, startWith, debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { VehiclesService } from '../../vehicles/vehicles.service';
import { ProposalService } from '../proposals.service';
import { environment } from 'environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { AuthService } from 'app/core/auth/auth.service';
import { UploadService } from 'app/services/upload.service';


@Component({
    selector: 'proposal-form',
    templateUrl: './proposal-form.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProposalFormComponent implements OnInit, OnDestroy {
 
    verticalStepperForm: FormGroup;
    products: InventoryProduct[];
    selectedProduct: any;
    filteredOptions: Observable<any[]>;
    dataSourceTypes: any[];
    dataSourceStatus: any[];
    dataSourceDocs: any[];
    locationLabel: string;
    fileUploadUrl: string;
    filesUpload: any[] = [];
    proposalId:any;
    unit:any;

    @ViewChild('docsFileInput') private docsFileInput: ElementRef;


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

    constructor(private _formBuilder: FormBuilder,
        private _vehiclesService: VehiclesService,
        private _productService: ProductService,
        private _router: Router,
        private _proposalService: ProposalService,
        private _authService: AuthService,
        private readonly activatedRouter: ActivatedRoute,
        private translocoService: TranslocoService,
        private uploadService: UploadService,


    ) {
        this.fileUploadUrl = environment.url+'/media';

        this.activatedRouter.paramMap.subscribe(params => {
            if (params.has('id')) {
                this._proposalService.getProposalById(params.get("id")).subscribe(data => {
                    this.proposalId = data.body.id;
                    this.verticalStepperForm.patchValue({
                        step1:{
                            last_offer_date:data.body.last_offer_date,
                            publish_date:data.body.publish_date,
                            status:data.body.status,
                            type:data.body.type,
                        },

                        step2:{
                            location:data.body.location,
                            products:data.body.product?.name,
                            quantity:data.body.product_quantity
                        },
                    })
                })
            };
        });
    }


    ngOnDestroy(): void {

    }

    ngOnInit(): void {
        this.verticalStepperForm = this._formBuilder.group({
            step1: this._formBuilder.group({
                type: ['', Validators.required],
                status: ['', Validators.required],
                publish_date: ['', Validators.required],
                last_offer_date: ['', Validators.required]
            }),
            step2: this._formBuilder.group({
                products: ['', Validators.required],
                quantity: ['', Validators.required],
                location: ['', Validators.required],

            }),
            step3: this._formBuilder.group({
                byEmail: this._formBuilder.group({
                    companyNews: [true],
                    featuredProducts: [false],
                    messages: [true]
                }),
                pushNotifications: ['everything', Validators.required]
            })
        });

        this._productService.getFilterProducts().subscribe(data => {
            this.products = data.body;
        });

        this.filteredOptions = this.verticalStepperForm.get('step2').get('products').valueChanges.pipe(
            startWith(''),
            debounceTime(400),
            distinctUntilChanged(),
            switchMap(val => {
                return this.filter(val || '')
            })
        );
        this._proposalService.getProposalTypes().subscribe(res => {
            this.dataSourceTypes = res.body;
        });
        this._proposalService.getProposalStatus().subscribe(res => {
            this.dataSourceStatus = res.body;
        });
        this._proposalService.getProposalDocs().subscribe(res => {
            this.dataSourceDocs = res.body;
        });

        this.locationLabel = this.translocoService.translate('proposals.details.tab.productInfo.productLocation');




    }

    filter(val: string): Observable<any[]> {

        return this._productService.getFilterProducts(val)
            .pipe(
                map(response => {
                    return response.body;

                })
            )
    }
    
    selectProduct(event: any) {
        let option = this.products.filter(item => item.name.toUpperCase() === event.option.value.toUpperCase());
        if (option.length > 0) {
            this.selectedProduct = option[0];
            this.unit=this.selectedProduct.unit;
            if(this.unit=="Adet")
            {
                this.unit=this.translocoService.translate('proposals.details.tab.productInfo.piece');
            }
            //this.eventForm.get('customersId').setValue(option[0].id, { emitEvent: false });
        }


    }
    save() {
        let createPrp = {type:'',freight_type:'',status:'',last_offer_date:'',publish_date:'',location:'',
                product:'',product_quantity:'',product_id:'',id:'',company_id: this._authService.CompanyId};
       createPrp.type    = this.verticalStepperForm.value.step1.type;
       createPrp.freight_type    = this.verticalStepperForm.value.step1.type;
       createPrp.last_offer_date = this.verticalStepperForm.value.step1.last_offer_date;
       createPrp.publish_date    = this.verticalStepperForm.value.step1.publish_date;
       createPrp.location        = this.verticalStepperForm.value.step2.location;
       createPrp.product          = this.verticalStepperForm.value.step2.products;
       createPrp.product_quantity = this.verticalStepperForm.value.step2.quantity;
       createPrp.status = this.verticalStepperForm.value.step1.status;
       createPrp.product_id = this.selectedProduct.id;
       createPrp.id=this.proposalId;
       this._proposalService.createProposal(createPrp).subscribe(data => {
        this._router.navigateByUrl('/apps/proposals/list');

       });
       if(this.demoForm.value.files)
       {
        this.upload();
       }
    }

    onChangeType(event) {
        if (event.value === 'Alış') {
            this.locationLabel = this.translocoService.translate('proposals.details.tab.productInfo.productLocation');
        } else {
            this.locationLabel = this.translocoService.translate('proposals.details.tab.productInfo.productDestinationLocation');
        }

    } 
    uploadDocs(fileList: FileList,fileName: any): void {
        const file = fileList[0];
        let tmp = {id:1,description:fileName.description,name:fileName.name,fileName: file.name,
                        type: file.name.split('.')[1].toUpperCase()};
        this.filesUpload.push(tmp);
    }

    upload() {
        const file = this.demoForm.value.files[0];
        this.uploadService.putUrl(file).then((res) => {
          const {
            data: { putURL },
          } = res;
    
          this.uploadService.upLoad(putURL, file).then((res) => {
            // this.mediaService.create({id:null,company_id: this.companyDetail, title: ret.putURL}).subscribe((data) => { });
          });
        });
      }
}
