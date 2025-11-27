import { relations } from 'drizzle-orm'
import {
  companies,
  users,
  groups,
  groupMembers,
  pages,
  pagePublications,
  publicationTargets,
  pageViews,
  pageInteractions,
  validations,
  validationResponses,
  feedback,
  feedbackResponses,
  feeds,
  feedItems,
  landingPages
} from './schema'

// Companies relations
export const companiesRelations = relations(companies, ({ many, one }) => ({
  users: many(users),
  groups: many(groups),
  pages: many(pages),
  feeds: many(feeds),
  landingPage: one(landingPages, {
    fields: [companies.id],
    references: [landingPages.companyId]
  })
}))

// Users relations
export const usersRelations = relations(users, ({ one, many }) => ({
  company: one(companies, {
    fields: [users.companyId],
    references: [companies.id]
  }),
  groupMemberships: many(groupMembers),
  createdGroups: many(groups),
  createdPages: many(pages),
  pagePublications: many(pagePublications),
  pageViews: many(pageViews),
  pageInteractions: many(pageInteractions),
  validationResponses: many(validationResponses),
  feedbackResponses: many(feedbackResponses)
}))

// Groups relations
export const groupsRelations = relations(groups, ({ one, many }) => ({
  company: one(companies, {
    fields: [groups.companyId],
    references: [companies.id]
  }),
  creator: one(users, {
    fields: [groups.createdBy],
    references: [users.id]
  }),
  members: many(groupMembers)
}))

// Group Members relations
export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, {
    fields: [groupMembers.groupId],
    references: [groups.id]
  }),
  user: one(users, {
    fields: [groupMembers.userId],
    references: [users.id]
  })
}))

// Pages relations
export const pagesRelations = relations(pages, ({ one, many }) => ({
  company: one(companies, {
    fields: [pages.companyId],
    references: [companies.id]
  }),
  creator: one(users, {
    fields: [pages.createdBy],
    references: [users.id]
  }),
  publications: many(pagePublications),
  views: many(pageViews),
  interactions: many(pageInteractions),
  validations: many(validations),
  feedback: many(feedback),
  feedItems: many(feedItems),
  landingPages: many(landingPages)
}))

// Page Publications relations
export const pagePublicationsRelations = relations(pagePublications, ({ one, many }) => ({
  page: one(pages, {
    fields: [pagePublications.pageId],
    references: [pages.id]
  }),
  publisher: one(users, {
    fields: [pagePublications.publishedBy],
    references: [users.id]
  }),
  targets: many(publicationTargets)
}))

// Publication Targets relations
export const publicationTargetsRelations = relations(publicationTargets, ({ one }) => ({
  publication: one(pagePublications, {
    fields: [publicationTargets.publicationId],
    references: [pagePublications.id]
  })
}))

// Page Views relations
export const pageViewsRelations = relations(pageViews, ({ one }) => ({
  page: one(pages, {
    fields: [pageViews.pageId],
    references: [pages.id]
  }),
  user: one(users, {
    fields: [pageViews.userId],
    references: [users.id]
  })
}))

// Page Interactions relations
export const pageInteractionsRelations = relations(pageInteractions, ({ one }) => ({
  page: one(pages, {
    fields: [pageInteractions.pageId],
    references: [pages.id]
  }),
  user: one(users, {
    fields: [pageInteractions.userId],
    references: [users.id]
  })
}))

// Validations relations
export const validationsRelations = relations(validations, ({ one, many }) => ({
  page: one(pages, {
    fields: [validations.pageId],
    references: [pages.id]
  }),
  responses: many(validationResponses)
}))

// Validation Responses relations
export const validationResponsesRelations = relations(validationResponses, ({ one }) => ({
  validation: one(validations, {
    fields: [validationResponses.validationId],
    references: [validations.id]
  }),
  user: one(users, {
    fields: [validationResponses.userId],
    references: [users.id]
  })
}))

// Feedback relations
export const feedbackRelations = relations(feedback, ({ one, many }) => ({
  page: one(pages, {
    fields: [feedback.pageId],
    references: [pages.id]
  }),
  responses: many(feedbackResponses)
}))

// Feedback Responses relations
export const feedbackResponsesRelations = relations(feedbackResponses, ({ one }) => ({
  feedback: one(feedback, {
    fields: [feedbackResponses.feedbackId],
    references: [feedback.id]
  }),
  user: one(users, {
    fields: [feedbackResponses.userId],
    references: [users.id]
  })
}))

// Feeds relations
export const feedsRelations = relations(feeds, ({ one, many }) => ({
  company: one(companies, {
    fields: [feeds.companyId],
    references: [companies.id]
  }),
  items: many(feedItems),
  landingPages: many(landingPages)
}))

// Feed Items relations
export const feedItemsRelations = relations(feedItems, ({ one }) => ({
  feed: one(feeds, {
    fields: [feedItems.feedId],
    references: [feeds.id]
  }),
  page: one(pages, {
    fields: [feedItems.pageId],
    references: [pages.id]
  })
}))

// Landing Pages relations
export const landingPagesRelations = relations(landingPages, ({ one }) => ({
  company: one(companies, {
    fields: [landingPages.companyId],
    references: [companies.id]
  }),
  page: one(pages, {
    fields: [landingPages.pageId],
    references: [pages.id]
  }),
  defaultFeed: one(feeds, {
    fields: [landingPages.defaultFeedId],
    references: [feeds.id]
  })
}))

