import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, Renderer2, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
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
import { FileService } from 'app/services/file.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { GeneralFunction } from 'app/shared/GeneralFunction';
import { MediaService } from '../../media/media.service';
import { isBoolean } from 'lodash';
import { MatStepper } from '@angular/material/stepper';
import { FileUploadComponent } from '@iplab/ngx-file-upload';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmationDialog } from '../../delete-dialog/delete.component';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { GoogleMap } from '@angular/google-maps';


@Component({
    selector: 'proposal-form',
    templateUrl: './proposal-form.component.html',
    styleUrls: ['./proposal-form.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProposalFormComponent implements OnInit, OnDestroy, AfterViewInit {

    @ViewChild('mapSearchField') searchField: ElementRef;
    @ViewChild(GoogleMap) map: GoogleMap;
    @ViewChild('fileUpload') fileUpload: FileUploadComponent;
    @ViewChild('verticalStepper') stepper: MatStepper;
    dialogRef: MatDialogRef<ConfirmationDialog>;
    public generalFunction = new GeneralFunction();

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
    mediaList: any[];
    fileDownloadLink: any;
    proposalId: any;
    productId: string;
    unit: any;
    isLoading: boolean = false;

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

    mapOptions = {
        zoomControl: true,
    }

    center: google.maps.LatLngLiteral = { lat: 41, lng: 29 };
    zoom = 7;
    markerOptions: google.maps.MarkerOptions = { draggable: false };
    markerPositions: google.maps.LatLngLiteral[] = [];

    addMarker(event: google.maps.MapMouseEvent) {
        this.markerPositions = [];
        this.verticalStepperForm.patchValue({
            step2: {
                latitude: event.latLng.toJSON().lat,
                longitude: event.latLng.toJSON().lng
            }
        });
        this.markerPositions.push(event.latLng.toJSON());
    }

    constructor(private _formBuilder: FormBuilder,
        private _vehiclesService: VehiclesService,
        private _productService: ProductService,
        private _router: Router,
        private _proposalService: ProposalService,
        private _authService: AuthService,
        private readonly activatedRouter: ActivatedRoute,
        private translocoService: TranslocoService,
        public toastr: ToastrManager,
        private fileService: FileService,
        private mediaService: MediaService,
        private changeDetection: ChangeDetectorRef,
        private dialog: MatDialog,
        private readonly ngxService: NgxUiLoaderService,


    ) {
        this.ngxService.start();
        this._proposalService.getProposalDocs().subscribe(res => {
            this.dataSourceDocs = res.body;
        });
        //this.markerPositions = [{lat: 41, lng:29}];
        this.fileUploadUrl = environment.url + '/media';

        this.activatedRouter.paramMap.subscribe(params => {
            if (params.has('id')) {
                this._proposalService.getProposalById(params.get("id")).subscribe(data => {
                    this.proposalId = data.body.id;
                    this.productId = data.body.product_id;
                    this.mediaList = data?.body.media;
                    this.center = {
                        lat: Number(data.body.latitude),
                        lng: Number(data.body.longitude),
                    };
                    this.markerPositions = [{
                        lat: Number(data.body.latitude),
                        lng: Number(data.body.longitude),
                    }];
                    this.verticalStepperForm.patchValue({
                        step1: {
                            last_offer_date: data.body.last_offer_date,
                            publish_date: data.body.publish_date,
                            status: data.body.status,
                            type: data.body.type,
                        },

                        step2: {
                            location: data.body.location,
                            products: data.body.product?.name,
                            quantity: data.body.product_quantity,
                            product_detail: data.body.product_detail
                        },
                    })
                })
            };
        });
        this.ngxService.stop();
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
                product_detail: ['', Validators.required],
                latitude: [''],
                longitude: [''],

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

        this.locationLabel = this.translocoService.translate('proposals.details.tab.productInfo.productLocation');
    }

    ngAfterViewInit(): void {
        const searchBox = new google.maps.places.SearchBox(
            this.searchField.nativeElement,
        );
        this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(
            this.searchField.nativeElement,
        );

        searchBox.addListener('places_changed', () => {
            const places = searchBox.getPlaces();
            if(places.length === 0) {
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
            this.unit = this.selectedProduct.unit;
            if (this.unit == "Adet") {
                this.unit = this.translocoService.translate('proposals.details.tab.productInfo.piece');
            }
            //this.eventForm.get('customersId').setValue(option[0].id, { emitEvent: false });
        }


    }
    save(isSubmit: boolean) {
        let createPrp = {
            type: '', freight_type: '', status: '', last_offer_date: '', publish_date: '', location: '', latitude: '', longitude: '',
            product: '', product_quantity: '', product_detail: '', product_id: '', id: '', company_id: this._authService.CompanyId
        };
        createPrp.type = this.verticalStepperForm.value.step1.type;
        createPrp.freight_type = this.verticalStepperForm.value.step1.type;
        createPrp.last_offer_date = this.verticalStepperForm.value.step1.last_offer_date;
        createPrp.publish_date = this.verticalStepperForm.value.step1.publish_date;
        createPrp.location = this.verticalStepperForm.value.step2.location;
        createPrp.product = this.verticalStepperForm.value.step2.products;
        createPrp.product_quantity = this.verticalStepperForm.value.step2.quantity;
        createPrp.product_detail = this.verticalStepperForm.value.step2.product_detail;
        createPrp.latitude = this.verticalStepperForm.value.step2.latitude;
        createPrp.longitude = this.verticalStepperForm.value.step2.longitude;
        createPrp.status = this.verticalStepperForm.value.step1.status;
        if (this.selectedProduct) {
            createPrp.product_id = this.selectedProduct.id;
        } else {
            createPrp.product_id = this.productId;
        }
        createPrp.id = this.proposalId;
        this._proposalService.createProposal(createPrp, isSubmit).subscribe(data => {
            if (isSubmit) {
                this._router.navigateByUrl('/apps/proposals/list');
            }
            else {
                this.proposalId = data.id;
            }
        });
    }

    loadDocs() {
        this.mediaList = [];
        this._proposalService.getProposalById(this.proposalId).subscribe(data => {
            this.mediaList = data?.body.media;
            this.changeDetection.detectChanges();
        })
        this.fileUpload.control.clear();
        this.isLoading = false;
    }

    onChangeType(event) {
        if (event.value === 'Alış') {
            this.locationLabel = this.translocoService.translate('proposals.details.tab.productInfo.productLocation');
        } else {
            this.locationLabel = this.translocoService.translate('proposals.details.tab.productInfo.productDestinationLocation');
        }

    }

    upload(item) {
        this.isLoading = true;
        const file = this.demoForm.value.files[0];
        let key = this._authService.user_id + '/' + file.name;
        this.fileService.putUrl({type: file.type, key: key}).then((res) => {
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
                    let pathObject = { type: last, fileName: file.name, key: key, group: item.description }
                    this.mediaService
                        .createMedia({
                            id: null,
                            proposal_id: this.proposalId,
                            title: "ProposalFile",
                            user_id: this._authService.user_id,
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
                        this.translocoService.translate("message.error"));
                    this.loadDocs();
                }
            );
        });
    }
    deleteDocs(item) {
        if (item) {
            this.dialogRef = this.dialog.open(ConfirmationDialog, {
                disableClose: false,
            });
            this.dialogRef.afterClosed().subscribe((result) => {
                if (result) {
                    this.isLoading = true;
                    this._proposalService.deleteDocs(item).subscribe(data => {
                        this.loadDocs();
                    })
                }
                this.dialogRef = null;
            });
        }
    }

    step1Next() {
        let status = this.generalFunction.formValidationCheck(this.verticalStepperForm, this.toastr, this.translocoService);
        if (status) {
            return
        }
    }

    step2Next() {
        let status = this.generalFunction.formValidationCheck(this.verticalStepperForm, this.toastr, this.translocoService);
        if (status) {
            return;
        }
        else {
            this.save(false);
        }
    }
}
