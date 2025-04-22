import { makeEmbeddingsOfAllWritings } from "./flow"
import { Effect } from "effect"
import { allWritings } from "../.contentlayer/generated/index.mjs"

async function main(){
    await Effect.runPromise(makeEmbeddingsOfAllWritings(allWritings as any))
}

main()
