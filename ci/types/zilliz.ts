export type BlogTestSchema = {
    vector:number[]
    /**
     * blog 访问的唯一指定名
     */
    en_name:string
    /**
     * blog 的中文名
     */
    cn_name?:string
    content?:string
}

export type ZillizCreateEntityResponse = {
    code:number
    data:{
        insertCount:number
        insertIds:string[]
    }
}

export type ZillizUpsertEntityResponse = {
    code:number
    data:{
        upsertCount:number
        upsertIds:string[]
    }
}

export type ZillizGetEntityByIdResponse = {
    code:number
    data:any[]
}

