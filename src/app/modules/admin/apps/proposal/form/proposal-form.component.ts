import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, Renderer2, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ProductService } from '../../ecommerce/product/product.service';
import { InventoryProduct } from '../../ecommerce/product/product.types';
import { tap, startWith, debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { VehiclesService } from '../../vehicles/vehicles.service';
import { ProposalService } from '../proposals.service';
import { FileUploader } from 'ng2-file-upload';
import { environment } from 'environments/environment';


@Component({
    selector: 'proposal-form',
    templateUrl: './proposal-form.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProposalFormComponent implements OnInit, OnDestroy {
 
    verticalStepperForm: FormGroup;
    products: InventoryProduct[];
    selectedProdcut: any;
    filteredOptions: Observable<any[]>;
    dataSourceTypes: any[];
    dataSourceStatus: any[];
    dataSourceDocs: any[];
    locationLabel: string;
    fileUploadUrl: string;

    uploader:FileUploader;
    hasBaseDropZoneOver:boolean;
    hasAnotherDropZoneOver:boolean;
    response:string;


    constructor(private _formBuilder: FormBuilder,
        private _vehiclesService: VehiclesService,
        private _productService: ProductService,
        private _proposalService: ProposalService,
    ) {
        this.fileUploadUrl = environment.url+'/media';
        this.uploader = new FileUploader({
            url: this.fileUploadUrl,
            disableMultipart: true, // 'DisableMultipart' must be 'true' for formatDataFunction to be called.
            formatDataFunctionIsAsync: true,
            formatDataFunction: async (item) => {
              return new Promise( (resolve, reject) => {
                resolve({
                  name: item._file.name,
                  length: item._file.size,
                  contentType: item._file.type,
                  date: new Date()
                });
              });
            }
          });
      
          this.hasBaseDropZoneOver = false;
          this.hasAnotherDropZoneOver = false;
      
          this.response = '';
      
          this.uploader.response.subscribe( res => this.response = res );
    }


    ngOnDestroy(): void {
        throw new Error('Method not implemented.');
    }

    ngOnInit(): void {
        this.verticalStepperForm = this._formBuilder.group({
            step1: this._formBuilder.group({
                company_id: ['2c67b871-0a77-4c8a-a4dc-4029fbea9a0c', Validators.required],
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

        this.locationLabel = 'Ürünün bulunduğu yer';




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
            this.selectedProdcut = option[0];

            //this.eventForm.get('customersId').setValue(option[0].id, { emitEvent: false });
        }


    }
    save() {
        let createPrp = {type:'',freight_type:'',status:'',last_offer_date:'',publish_date:'',location:'',
                product:'',product_quantity:'',product_id:'',company_id:'2c67b871-0a77-4c8a-a4dc-4029fbea9a0c'};
       createPrp.type    = this.verticalStepperForm.value.step1.type;
       createPrp.freight_type    = this.verticalStepperForm.value.step1.type;
       createPrp.last_offer_date = this.verticalStepperForm.value.step1.last_offer_date.toDate();
       createPrp.publish_date    = this.verticalStepperForm.value.step1.publish_date.toDate();
       createPrp.location        = this.verticalStepperForm.value.step2.location;
       createPrp.product          = this.verticalStepperForm.value.step2.products;
       createPrp.product_quantity = this.verticalStepperForm.value.step2.quantity;
       createPrp.status = this.verticalStepperForm.value.step1.status;
       createPrp.product_id = this.selectedProdcut.id;
       this._proposalService.createProposal(createPrp).subscribe(data=>{
           console.log(data.body);
       });
    }

    onChangeType(event) {
        console.log(event.value);
        if (event.value === 'Alış') {
            this.locationLabel = 'Ürünün bulunduğu yer';
        } else {
            this.locationLabel = 'Ürünün varış yeri';
        }

    }
    public fileOverBase(e:any):void {
        this.hasBaseDropZoneOver = e;
      }
     
      public fileOverAnother(e:any):void {
        this.hasAnotherDropZoneOver = e;
      }


}
