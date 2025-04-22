
export type GoogleSingleEmbeddingsResponse = {
    embedding: {
        values:number[]
    }
}

export type GoogleBatchEmbeddingsResponse = {
    embeddings: {
        values:number[]
    }[]
}
