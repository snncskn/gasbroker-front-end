export interface UsersList
{
    id:string;
    uid: string;
    userName: string,
    gender: string;
    user_status: string;
    mobilePhone: string;
    full_name: string;
    color: string;
    pass:string;
    email:string;
    birthday:string;
}

export interface UsersPagination
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}

export interface UsersRoles
{
    id:number;
    title:string;
}

