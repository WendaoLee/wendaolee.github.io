import { allPages, allWorks, allWritings } from "@/.contentlayer/generated";

export const SHOW_DRAFTS = process.env.NODE_ENV !== "production";

export function isVisibleDoc(doc: { isDraft?: boolean }): boolean {
  return SHOW_DRAFTS || !doc.isDraft;
}

export const visibleWritings = allWritings.filter(isVisibleDoc);

export const visibleWorks = allWorks.filter(isVisibleDoc);

export const visiblePages = allPages.filter(isVisibleDoc);

export const rankedWritings = [...visibleWritings].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
);

export const rankedWorks = [...visibleWorks].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
);

export const rankedBlogs = rankedWritings.filter((ele) => ele.category === "blog");

export const rankedEssays = rankedWritings.filter((ele) => ele.category === "essay");

export const rankedTranslations = rankedWritings.filter(
  (ele) => ele.category === "translation"
);

export const rankedNotes = rankedWritings.filter((ele) => ele.category === "note");

export const rankedStory = rankedWritings.filter((ele) => ele.category === "story");
