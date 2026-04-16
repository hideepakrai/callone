
  export interface IBrand{
    _id?:string
    name?:string
    key?:string
    isActive?:boolean
  }
export interface IWarehouse {
  _id?:string
  code?: string;
  name?: string;
  location?: string;
  priority?: number;
  isActive?: boolean;
  brands:IBrand[]
  createdAt?: string;
  updatedAt?: string;

}