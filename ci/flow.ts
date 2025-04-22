import { Effect, flow, pipe } from "effect"
import { getEmbeddingsByFetch } from "./lib/google"
import { createEntity, getEntityByIds, upsertEntity } from "./lib/zilliz"
import { GoogleSingleEmbeddingsResponse } from "./types/google"
import { BlogTestSchema } from "./types/zilliz"
import { allWritings } from "contentlayer/generated"

type WritingsType = typeof allWritings

const convertGenimiEmbeddingsToBlogTestSchema = (embeddings:GoogleSingleEmbeddingsResponse,originId:string,text:string):BlogTestSchema => ({
    en_name:originId,
    vector:embeddings.embedding.values,
    content:text
})

/**
 * 传入博文文本，博文的唯一标识，向量化后插入到 Zilliz 中
 * @param text 
 * @param originId 
 * @returns 
 */
export const upsertBlogDataToZillizFlow = ({text,originId,title}:{text:string,originId:string,title:string}) => pipe(
    text,
    getEmbeddingsByFetch,
    Effect.map(embeddings => {
        console.log(`成功获取 ${originId} 的 embeddings`)
        return convertGenimiEmbeddingsToBlogTestSchema(embeddings,originId,text)
    }),
    Effect.map(schema => {
        return [{...schema,title}]
    }),
    Effect.flatMap(data => upsertEntity('Blog',data)),
    Effect.map(ele => console.log(`对 originId:${originId} 的博文的数据插入结果为:${JSON.stringify(ele)}`))
)

export const getEntityByIdsFlow = (collectionName:string,ids:string[],outputFields?:string[]) => flow(
    getEntityByIds,
    Effect.tap(ele => console.log(`查询 ${collectionName} 的存在的 ids 记录有 ${JSON.stringify(ele)}`)),
    Effect.map(ele => {
        /**
         * 返回的 data 的字段类型是根据 outputFields 决定的
         * 但我懒得做类型体操了,就这么确定了
         */
        return [
            ...(ele.data as {
                en_name:string,
            }[])
        ]
    })
    // getEntityByIds,
    // Effect.map(ids => getEntityByIds('Blog',ids)),
    // Effect.map(ele => console.log(`对 ids:${ids} 的博文的数据查询结果为:${JSON.stringify(ele)}`))
)(collectionName,ids,outputFields)


/**
 * 将所有博文向量化后插入到 Zilliz 中
 * @param allWritings 
 * @returns 
 */
export const makeEmbeddingsOfAllWritings = (allWritings:WritingsType) => 
    Effect.Do.pipe(
        Effect.let('flowWritings',() => allWritings.map(
            ele => ({
                en_name:ele.slug,
                content:ele.body.raw,
                title:ele.title,
                tags:ele.tags
            })
        )),
        Effect.bind('existingsWritingsResult',({flowWritings}) => getEntityByIdsFlow('Blog',flowWritings.map(ele => ele.en_name),['en_name'])),
        Effect.let('neededUpsertWritings',({flowWritings,existingsWritingsResult}) => {
            const existingEnNames = existingsWritingsResult.map(ele => ele.en_name)
            return flowWritings.filter(ele => !existingEnNames.includes(ele.en_name))
        }),

        Effect.bind('upsertResult',({neededUpsertWritings}) => Effect.forEach(neededUpsertWritings,ele => upsertBlogDataToZillizFlow({
            text:ele.content,
            originId:ele.en_name,
            title:ele.title,
        }))),
        Effect.map(({neededUpsertWritings,upsertResult}) => {
            console.group('以下博文在本次运行中进行了向量化上的更新与插入')
            console.table(neededUpsertWritings)
            console.groupEnd()
        })
    )
    // (writings:WritingsType) => {
    //     return writings.map(
    //         ele => ({
    //             en_name:ele.slug,
    //             content:ele.body.raw
    //         })
    //     )
    // },
    // Effect.Do.pipe(
    //     Effect.let(waitingForCheck => getEntityByIdsFlow('Blog',waitingForCheck.map(ele => ele.en_name))),
    //     Effect.map(ele => ele.map(ele => ele.en_name))
    // ),
    // (waitingForCheck) => getEntityByIdsFlow('Blog',waitingForCheck.map(ele => ele.en_name)),
    // Effect.map(ele => ele.map(ele => ele.en_name))
    // Effect.map(waitingForCheckIsHasEmbeddingsList => getEntityByIdsFlow('Blog',[waitingForCheckIsHasEmbeddingsList]))

