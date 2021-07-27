export interface InventoryProduct {
  id: string;
  name: string;
  code: string;
  images: string[];
  properties: string[];
  categories?: string[];
  active: boolean;
}

export interface InventoryPagination
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}

export interface InventoryCategory
{
    id: string;
    parentId: string;
    name: string;
    slug: string;
}

export interface InventoryBrand
{
    id: string;
    name: string;
    slug: string;
}

export interface InventoryProperty
{
    id?: string;
    name?: string;
}

export interface InventoryVendor
{
    id: string;
    name: string;
    slug: string;
}
