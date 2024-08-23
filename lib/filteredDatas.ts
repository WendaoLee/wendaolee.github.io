import { allWritings } from "@/.contentlayer/generated";

export const rankedWritings = allWritings.sort(
    (a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()
)

export const rankedBlogs = rankedWritings.filter(ele => ele.category === 'blog')

export const rankedEssays = rankedWritings.filter(ele => ele.category === 'essay')

export const rankedTranslations = rankedWritings.filter(ele => ele.category === 'translation')

export const rankedNotes = rankedWritings.filter(ele => ele.category === 'note')

export const rankedStory = rankedWritings.filter(ele => ele.category === 'story')