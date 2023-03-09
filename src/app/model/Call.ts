import { Estado } from "./Enum_call";

export interface Call {
    id?:number,
    p2p:string,
    estado:Estado,
    date:Date,
    cajeroId:number,
    userId?:number
}