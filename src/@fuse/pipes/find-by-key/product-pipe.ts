import { Pipe, PipeTransform } from '@angular/core';
/**
 * Finds an object from given source using the given key - value pairs
 */
@Pipe({
    name: 'productFilter',
    pure: false
})
export class ProductPipe implements PipeTransform
{
    /**
     * Constructor
     */
    constructor()
    {
    }

    /**
     * Transform
     *
     * @param value A string or an array of strings to find from source
     * @param key Key of the object property to look for
     * @param source Array of objects to find from
     */
    transform(value: any[], key: string, source: any[]): any
    {
        // If the given value is an array of strings...
        if ( Array.isArray(value) )
        {
            let tmp = value.filter(item => (item.product_code === key || item.product_name.toLowerCase().indexOf(key.toLowerCase()) !== -1));
            return tmp;
        }else{
            return null;
        }

        // If the value is a string...
        return source.find(sourceItem => sourceItem[key] === value);
    }
}
