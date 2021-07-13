export interface Company
{
    id: string;
    name: string;
    types?: [];
    phone?:string;
    full_name?: string;
    fax?: string;
    registered_date?: string | null;
    email?: string | null;
    website?: string | null;
}


export interface Address
{
    id: string;
    company_id: string;
    description: string;
    lat: string;
    long: string;
    type?: string | null;
    title: string;
}
