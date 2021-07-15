export interface UsersList
{
    id:string;
    user_id: string;
    username: string,
    pass:string;
    email:string;
    name:string;
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

