export interface Invoices
{
    uid:string;
    company_id:number;
    invoice_date:Date;
    invoice_no:string;
    invoice_type:number;
    maturity:string;
    invoice_status:string;
    content:string;
    company_name:string;
    buyer_id:string;
    sub_total:string;
}