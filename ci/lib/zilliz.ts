/**
 * 封装了 zilliz 的相关 RESTful API
 */

import { Effect, flow, pipe } from "effect"
import { ZILLIZ_API_KEY,ZILLIZ_ENDPOINT } from "@/lib/env"
import { BlogTestSchema, ZillizCreateEntityResponse, ZillizGetEntityByIdResponse, ZillizUpsertEntityResponse } from "../types/zilliz"
import { ofetch } from "ofetch"


export const createEntity = (collectionName:string,data:BlogTestSchema | Array<any>,partitionName?:string) => {
    return Effect.tryPromise({
        try:() => ofetch<ZillizCreateEntityResponse>(`${ZILLIZ_ENDPOINT}/v1/vector/insert`,{
            method:'POST',
            headers:{
                'Content-Type':'application/json',
                'Authorization':`Bearer ${ZILLIZ_API_KEY}`
            },
            body:JSON.stringify({
                collectionName,
                partitionName,
                data    
            })
        }),
        catch:(err) => err
    })
}

/**
 * 更新实体或插入实体，可批量更新。
 * 可通过该接口更新数据库中已存在的记录，或插入新的记录
 * @param collectionName 
 * @param data 
 * @param partitionName 
 * @returns 
 */
export const upsertEntity = (collectionName:string,data:BlogTestSchema | Array<any>,partitionName?:string) => {
    return Effect.tryPromise({
        try:() => ofetch<ZillizUpsertEntityResponse>(`${ZILLIZ_ENDPOINT}/v2/vectordb/entities/upsert`,{
            method:'POST',
            headers:{
                'Content-Type':'application/json',
                'Authorization':`Bearer ${ZILLIZ_API_KEY}`
            },
            body:JSON.stringify({
                collectionName,
                partitionName,
                data
            })
        }),
        catch:(err) => err
    })
}

/**
 * 根据 ids 获取实体，可批量获取。
 * 可通过该接口获取数据库中已存在的记录
 * @param collectionName 
 * @param ids 
 * @param outputFields 
 * @returns 
 */
export const getEntityByIds = (collectionName:string,ids:string[],outputFields?:string[]) => {
    return Effect.tryPromise({
        try:() => ofetch<ZillizGetEntityByIdResponse>(`${ZILLIZ_ENDPOINT}/v2/vectordb/entities/get`,{
            method:'POST',
            headers:{
                'Content-Type':'application/json',
                'Authorization':`Bearer ${ZILLIZ_API_KEY}`
            },
            body:JSON.stringify({collectionName,id:ids,outputFields:outputFields})
        }),
        catch:(err) => err
    })
}
