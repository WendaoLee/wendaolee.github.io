import { GENIMI_API_KEY } from "../../lib/env";
import { Effect } from "effect";
import { GoogleSingleEmbeddingsResponse } from "../types/google";
import { ProxyAgent } from "undici";
import { PROXY_URL } from "../../lib/env";
import { ofetch } from "ofetch";


const proxyAgent = new ProxyAgent(PROXY_URL)


export const getEmbeddingsByFetch = (text:string) => {
    return Effect.tryPromise({
        try:() => ofetch<GoogleSingleEmbeddingsResponse>(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${GENIMI_API_KEY}`,{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({
                "model":"models/text-embedding-004",
                "content":{
                    "parts":[
                        {
                            text
                        }
                    ]
                }
            }),
            dispatcher:PROXY_URL === '' ? undefined : proxyAgent,
            onRequestError:async (err) => {
                console.log('在获取embeddings时发起请求出错',err)
                const body = await err.response?.json()
                console.log('错误信息为',body)
                throw err
            },
            onResponseError:async ({request,response,error}) => {
                console.log('在获取embeddings时响应出错',error)
                console.log('原始请求体为：',request)
                const res = await response?.json()
                console.log('响应体为：',res)
                throw error
            }
        }),
        catch:(err) => {
            console.log('在获取embeddings时出错',err)
        }
    })
    
}