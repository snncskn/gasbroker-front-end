export interface Customer
{
    id: string;
    name: string;
    types?: [];
    phone?:string;
    full_name?: string;
    fax?: string;
    registered_date?: string | null;
    email?: string | null;
}


export interface Country
{
    id: string;
    iso: string;
    name: string;
    code: string;
    flagImagePos: string;
}

export interface Tag
{
    id?: string;
    title?: string;
}
