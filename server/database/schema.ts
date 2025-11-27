import { pgTable, uuid, varchar, text, timestamp, jsonb, boolean, integer, pgEnum, index, unique } from 'drizzle-orm/pg-core'

// Enums
export const userRoleEnum = pgEnum('user_role', ['super_admin', 'admin', 'editor', 'employee'])
export const userStatusEnum = pgEnum('user_status', ['active', 'inactive', 'suspended'])
export const subscriptionTierEnum = pgEnum('subscription_tier', ['free', 'starter', 'professional', 'enterprise'])
export const companyStatusEnum = pgEnum('company_status', ['active', 'suspended', 'trial'])
export const pageStatusEnum = pgEnum('page_status', ['draft', 'published', 'archived'])
export const targetTypeEnum = pgEnum('target_type', ['all', 'groups', 'contacts'])
export const interactionTypeEnum = pgEnum('interaction_type', ['reaction', 'comment', 'share'])
export const validationTypeEnum = pgEnum('validation_type', ['quiz', 'confirm', 'survey'])
export const feedbackTypeEnum = pgEnum('feedback_type', ['survey', 'slider', 'nps', 'comment'])
export const feedTypeEnum = pgEnum('feed_type', ['company', 'group', 'custom'])

// Companies (Multi-tenant)
export const companies = pgTable('companies', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  brandingConfig: jsonb('branding_config').$type<{
    logo?: string
    primaryColor?: string
    secondaryColor?: string
    fontFamily?: string
    fontHeadingFamily?: string
  }>(),
  subscriptionTier: subscriptionTierEnum('subscription_tier').notNull().default('free'),
  status: companyStatusEnum('status').notNull().default('trial'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
}, (table) => ({
  slugIdx: index('companies_slug_idx').on(table.slug),
}))

// Users
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }).notNull(),
  passwordHash: text('password_hash').notNull(),
  role: userRoleEnum('role').notNull().default('employee'),
  firstName: varchar('first_name', { length: 255 }),
  lastName: varchar('last_name', { length: 255 }),
  avatarUrl: text('avatar_url'),
  status: userStatusEnum('status').notNull().default('active'),
  lastLogin: timestamp('last_login'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
}, (table) => ({
  emailCompanyIdx: index('users_email_company_idx').on(table.email, table.companyId),
  companyIdIdx: index('users_company_id_idx').on(table.companyId),
  uniqueEmailPerCompany: unique('users_email_company_unique').on(table.email, table.companyId),
}))

// Groups
export const groups = pgTable('groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  createdBy: uuid('created_by').notNull().references(() => users.id, { onDelete: 'restrict' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
}, (table) => ({
  companyIdIdx: index('groups_company_id_idx').on(table.companyId),
}))

// Group Members (Many-to-Many)
export const groupMembers = pgTable('group_members', {
  groupId: uuid('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  joinedAt: timestamp('joined_at').notNull().defaultNow()
}, (table) => ({
  pk: unique('group_members_pk').on(table.groupId, table.userId),
  groupIdIdx: index('group_members_group_id_idx').on(table.groupId),
  userIdIdx: index('group_members_user_id_idx').on(table.userId),
}))

// Pages
export const pages = pgTable('pages', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 500 }).notNull(),
  slug: varchar('slug', { length: 500 }).notNull(),
  content: jsonb('content').notNull().$type<Record<string, any>>(), // Tiptap JSON document
  socialEnabled: jsonb('social_enabled').$type<{
    reactions?: boolean
    comments?: boolean
    share?: boolean
  }>().notNull().default({ reactions: true, comments: true, share: true }),
  status: pageStatusEnum('status').notNull().default('draft'),
  createdBy: uuid('created_by').notNull().references(() => users.id, { onDelete: 'restrict' }),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
}, (table) => ({
  companyIdIdx: index('pages_company_id_idx').on(table.companyId),
  statusIdx: index('pages_status_idx').on(table.status),
  slugIdx: index('pages_slug_idx').on(table.slug),
  companySlugUnique: unique('pages_company_slug_unique').on(table.companyId, table.slug),
}))

// Page Publications
export const pagePublications = pgTable('page_publications', {
  id: uuid('id').primaryKey().defaultRandom(),
  pageId: uuid('page_id').notNull().references(() => pages.id, { onDelete: 'cascade' }),
  publishedBy: uuid('published_by').notNull().references(() => users.id, { onDelete: 'restrict' }),
  targetType: targetTypeEnum('target_type').notNull().default('all'),
  notifyEmail: boolean('notify_email').notNull().default(false),
  notifyPush: boolean('notify_push').notNull().default(false),
  publishedAt: timestamp('published_at').notNull().defaultNow()
}, (table) => ({
  pageIdIdx: index('page_publications_page_id_idx').on(table.pageId),
  publishedAtIdx: index('page_publications_published_at_idx').on(table.publishedAt),
}))

// Publication Targets
export const publicationTargets = pgTable('publication_targets', {
  id: uuid('id').primaryKey().defaultRandom(),
  publicationId: uuid('publication_id').notNull().references(() => pagePublications.id, { onDelete: 'cascade' }),
  targetType: targetTypeEnum('target_type').notNull(),
  targetId: uuid('target_id').notNull(), // group_id or user_id
}, (table) => ({
  publicationIdIdx: index('publication_targets_publication_id_idx').on(table.publicationId),
  targetIdx: index('publication_targets_target_idx').on(table.targetType, table.targetId),
}))

// Page Views (Analytics)
export const pageViews = pgTable('page_views', {
  id: uuid('id').primaryKey().defaultRandom(),
  pageId: uuid('page_id').notNull().references(() => pages.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  viewedAt: timestamp('viewed_at').notNull().defaultNow(),
  durationSeconds: integer('duration_seconds')
}, (table) => ({
  pageIdIdx: index('page_views_page_id_idx').on(table.pageId),
  userIdIdx: index('page_views_user_id_idx').on(table.userId),
  viewedAtIdx: index('page_views_viewed_at_idx').on(table.viewedAt),
  pageUserIdx: index('page_views_page_user_idx').on(table.pageId, table.userId),
}))

// Page Interactions (Reactions, Comments, Shares)
export const pageInteractions = pgTable('page_interactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  pageId: uuid('page_id').notNull().references(() => pages.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  interactionType: interactionTypeEnum('interaction_type').notNull(),
  interactionData: jsonb('interaction_data').$type<{
    reactionType?: 'like' | 'love' | 'celebrate' | 'insightful' | 'support'
    commentText?: string
    parentCommentId?: string
    shareMethod?: string
  }>().notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow()
}, (table) => ({
  pageIdIdx: index('page_interactions_page_id_idx').on(table.pageId),
  userIdIdx: index('page_interactions_user_id_idx').on(table.userId),
  typeIdx: index('page_interactions_type_idx').on(table.interactionType),
}))

// Validations
export const validations = pgTable('validations', {
  id: uuid('id').primaryKey().defaultRandom(),
  pageId: uuid('page_id').notNull().references(() => pages.id, { onDelete: 'cascade' }),
  validationType: validationTypeEnum('validation_type').notNull(),
  config: jsonb('config').notNull().$type<{
    questions?: Array<{
      id: string
      question: string
      type: 'multiple_choice' | 'true_false' | 'text'
      options?: string[]
      correctAnswer?: string | string[]
    }>
    confirmText?: string
    surveyQuestions?: Array<{
      id: string
      question: string
      type: 'text' | 'multiple_choice' | 'rating'
      options?: string[]
    }>
  }>(),
  required: boolean('required').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow()
}, (table) => ({
  pageIdIdx: index('validations_page_id_idx').on(table.pageId),
}))

// Validation Responses
export const validationResponses = pgTable('validation_responses', {
  id: uuid('id').primaryKey().defaultRandom(),
  validationId: uuid('validation_id').notNull().references(() => validations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  responseData: jsonb('response_data').notNull().$type<{
    answers?: Record<string, any>
    score?: number
    passed?: boolean
    confirmed?: boolean
  }>(),
  submittedAt: timestamp('submitted_at').notNull().defaultNow()
}, (table) => ({
  validationIdIdx: index('validation_responses_validation_id_idx').on(table.validationId),
  userIdIdx: index('validation_responses_user_id_idx').on(table.userId),
  uniqueUserValidation: unique('validation_responses_user_validation_unique').on(table.validationId, table.userId),
}))

// Feedback
export const feedback = pgTable('feedback', {
  id: uuid('id').primaryKey().defaultRandom(),
  pageId: uuid('page_id').notNull().references(() => pages.id, { onDelete: 'cascade' }),
  feedbackType: feedbackTypeEnum('feedback_type').notNull(),
  config: jsonb('config').notNull().$type<{
    questions?: Array<{
      id: string
      question: string
      type: 'text' | 'multiple_choice' | 'rating'
      options?: string[]
    }>
    sliderMin?: number
    sliderMax?: number
    sliderLabel?: string
    npsQuestion?: string
  }>(),
  createdAt: timestamp('created_at').notNull().defaultNow()
}, (table) => ({
  pageIdIdx: index('feedback_page_id_idx').on(table.pageId),
}))

// Feedback Responses
export const feedbackResponses = pgTable('feedback_responses', {
  id: uuid('id').primaryKey().defaultRandom(),
  feedbackId: uuid('feedback_id').notNull().references(() => feedback.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  responseData: jsonb('response_data').notNull().$type<{
    answers?: Record<string, any>
    sliderValue?: number
    npsScore?: number
    comment?: string
  }>(),
  submittedAt: timestamp('submitted_at').notNull().defaultNow()
}, (table) => ({
  feedbackIdIdx: index('feedback_responses_feedback_id_idx').on(table.feedbackId),
  userIdIdx: index('feedback_responses_user_id_idx').on(table.userId),
}))

// Feeds
export const feeds = pgTable('feeds', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  feedType: feedTypeEnum('feed_type').notNull().default('company'),
  filterConfig: jsonb('filter_config').$type<{
    groupIds?: string[]
    tags?: string[]
    pageStatuses?: string[]
    sortBy?: 'newest' | 'oldest' | 'popular'
  }>(),
  createdAt: timestamp('created_at').notNull().defaultNow()
}, (table) => ({
  companyIdIdx: index('feeds_company_id_idx').on(table.companyId),
}))

// Feed Items
export const feedItems = pgTable('feed_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  feedId: uuid('feed_id').notNull().references(() => feeds.id, { onDelete: 'cascade' }),
  pageId: uuid('page_id').notNull().references(() => pages.id, { onDelete: 'cascade' }),
  publishedAt: timestamp('published_at').notNull().defaultNow(),
  sortOrder: integer('sort_order').notNull().default(0)
}, (table) => ({
  feedIdIdx: index('feed_items_feed_id_idx').on(table.feedId),
  pageIdIdx: index('feed_items_page_id_idx').on(table.pageId),
  uniqueFeedPage: unique('feed_items_feed_page_unique').on(table.feedId, table.pageId),
}))

// Landing Pages (Custom landing page per company)
export const landingPages = pgTable('landing_pages', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }).unique(),
  pageId: uuid('page_id').references(() => pages.id, { onDelete: 'set null' }),
  defaultFeedId: uuid('default_feed_id').references(() => feeds.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
}, (table) => ({
  companyIdIdx: index('landing_pages_company_id_idx').on(table.companyId),
}))

