# Company Switcher Implementation

## Overview

The company switcher provides multi-tenant support across the Enlace application, allowing users to switch between different companies they have access to. The implementation uses Nuxt's `useState` to share company context globally across all components.

## Architecture

### Core Components

1. **`useCompany` Composable** (`app/composables/useCompany.ts`)
   - Global state management for company context
   - Provides `companyId`, `currentCompany`, and `availableCompanies`
   - Handles company switching and persistence

2. **`CompanyMenu` Component** (`app/components/CompanyMenu.vue`)
   - UI component in the sidebar header
   - Displays current company and allows switching
   - Shows company logo and branding

3. **API Endpoint** (`server/api/companies/index.get.ts`)
   - Fetches available companies for the user
   - Filters by user permissions (to be implemented with auth)

## Usage

### In Components/Pages

```vue
<script setup lang="ts">
// Import the composable
const { companyId, currentCompany } = useCompany()

// Use companyId in API calls
async function fetchData() {
  if (!companyId.value) {
    console.warn('No company selected')
    return
  }
  
  const data = await $fetch(`/api/some-endpoint?companyId=${companyId.value}`)
  // ... handle data
}

// Watch for company changes
watch(companyId, () => {
  fetchData()
})
</script>
```

### Available Methods

```typescript
const {
  // State
  companyId,              // Ref<string | null> - Current company ID
  currentCompany,         // Ref<Company | null> - Current company object
  availableCompanies,     // Ref<Company[]> - All available companies
  isLoading,              // Ref<boolean> - Loading state
  
  // Methods
  setCompany,             // (company: Company) => void
  switchCompany,          // (companyIdOrSlug: string) => void
  fetchAvailableCompanies, // () => Promise<Company[]>
  initializeCompany       // () => Promise<void>
} = useCompany()
```

### Company Type Definition

```typescript
interface Company {
  id: string
  name: string
  slug: string
  logo?: string
  brandingConfig?: {
    logo?: string
    primaryColor?: string
    secondaryColor?: string
    fontFamily?: string
    fontHeadingFamily?: string
  }
}
```

## Initialization

The company context is automatically initialized in `app.vue` when the application loads:

```vue
<script setup lang="ts">
const { initializeCompany } = useCompany()

onMounted(async () => {
  await initializeCompany()
})
</script>
```

This:
1. Fetches available companies for the user
2. Restores the last selected company from localStorage
3. Selects the first available company if none was previously selected

## Persistence

The selected company ID is automatically persisted to localStorage:
- **Key**: `enlace_company_id`
- **Value**: Company UUID

This ensures the user's company selection persists across browser sessions.

## Multi-Tenant Data Isolation

All API endpoints that interact with company-specific data must:

1. **Require `companyId` parameter**
   ```typescript
   const query = getQuery(event)
   const companyId = query.companyId as string
   
   if (!companyId) {
     throw createError({
       statusCode: 400,
       statusMessage: 'companyId is required'
     })
   }
   ```

2. **Filter database queries by company**
   ```typescript
   const pages = await db
     .select()
     .from(pagesTable)
     .where(eq(pagesTable.companyId, companyId))
   ```

3. **Validate user has access to company** (when auth is implemented)
   ```typescript
   // TODO: Verify user belongs to requested company
   const hasAccess = await verifyUserCompanyAccess(userId, companyId)
   if (!hasAccess) {
     throw createError({
       statusCode: 403,
       statusMessage: 'Access denied'
     })
   }
   ```

## Updated Files

The following pages have been updated to use the company switcher:

- ✅ `app/pages/pages/create.vue` - Page creation
- ✅ `app/pages/pages/index.vue` - Page listing
- ✅ `app/pages/pages/[id]/edit.vue` - Page editing

### Migration Pattern

**Before:**
```typescript
const TEMP_COMPANY_ID = '00000000-0000-0000-0000-000000000000'

await $fetch('/api/pages', {
  method: 'POST',
  body: {
    companyId: TEMP_COMPANY_ID,
    // ...
  }
})
```

**After:**
```typescript
const { companyId } = useCompany()

if (!companyId.value) {
  toast.add({
    title: 'No company selected',
    description: 'Please select a company first',
    color: 'error'
  })
  return
}

await $fetch('/api/pages', {
  method: 'POST',
  body: {
    companyId: companyId.value,
    // ...
  }
})
```

## Authentication Integration

### Supabase Authentication

The company switcher is integrated with Supabase authentication:

#### Frontend

All frontend pages use `useSupabaseUser()` to get the authenticated user:

```vue
<script setup lang="ts">
const { companyId } = useCompany()
const user = useSupabaseUser()

async function saveData() {
  if (!user.value?.id) {
    toast.add({
      title: 'Not authenticated',
      description: 'Please log in',
      color: 'error'
    })
    return
  }
  
  // Use user.value.id in API calls
  await $fetch('/api/pages', {
    method: 'POST',
    body: {
      companyId: companyId.value,
      userId: user.value.id,
      // ...
    }
  })
}
</script>
```

#### Backend

All server API endpoints use `serverSupabaseUser()` to verify authentication:

```typescript
import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  // Get authenticated user from Supabase
  const user = await serverSupabaseUser(event)
  
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized - Please log in'
    })
  }
  
  // Use user.id for operations
  const userId = user.id
  
  // TODO: Verify user has access to requested company
  // const hasAccess = await verifyUserCompanyAccess(userId, companyId)
})
```

### Future Enhancements

1. **User-Company Association Table:**
   - Create a many-to-many relationship between users and companies
   - Allow users to belong to multiple companies
   - Filter `/api/companies` by user's associations

2. **Role-Based Permissions:**
   - Implement per-company user roles
   - Restrict operations based on user role (admin, editor, viewer)

3. **Server-side Company Validation:**
   - Verify user has access to requested company on every request
   - Prevent cross-company data access
   - Implement audit logging for company switches

## Testing

### Manual Testing Steps

1. **Company Switching:**
   - Click the company menu in the sidebar
   - Select a different company
   - Verify the UI updates to show the new company name
   - Verify data reloads for the new company

2. **Persistence:**
   - Select a company
   - Refresh the browser
   - Verify the same company is still selected

3. **Data Isolation:**
   - Create a page in Company A
   - Switch to Company B
   - Verify the page from Company A is not visible
   - Switch back to Company A
   - Verify the page is visible again

## Security Considerations

1. **Always validate companyId on the server**
   - Never trust client-sent companyId
   - Verify user has access to requested company

2. **Use prepared statements / ORM**
   - Drizzle ORM handles SQL injection prevention
   - Always use `.where()` clauses with company filters

3. **Audit logging**
   - Log company switches
   - Log cross-company access attempts

## Support

For questions or issues with the company switcher, refer to:
- PRD: `docs/requirements/PRD.md`
- Database Schema: `server/database/schema.ts`
- Multi-tenancy Requirements: PRD Section 5.1

