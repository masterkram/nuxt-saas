<script setup lang="ts">
const faqs = ref([
  {
    question: 'How do I create a new page?',
    answer: 'Navigate to the Pages section and click the "Create Page" button. You can then use the editor to add components and customize your content.'
  },
  {
    question: 'How do I organize employees into groups?',
    answer: 'Go to the Groups section and create a new group. You can then add members individually or import them from a CSV file.'
  },
  {
    question: 'How do I publish content to specific teams?',
    answer: 'When editing a page, switch to the Publish mode and select "Specific Groups" as your target audience. You can then choose which groups should receive the content.'
  },
  {
    question: 'Can I schedule content for later?',
    answer: 'Yes! In the Publish mode, you can choose "Schedule for later" and set a specific date and time for your content to be published.'
  },
  {
    question: 'How do I track engagement?',
    answer: 'Visit the Analytics section to see overall engagement metrics, or go to a specific page and switch to Analytics mode to see detailed performance data.'
  }
])
</script>

<template>
  <UDashboardPanel id="help">
    <template #header>
      <UDashboardNavbar title="Help & Support">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="grid gap-6 lg:grid-cols-3 mb-8">
        <UCard class="ring-1 ring-default">
          <div class="text-center">
            <div class="inline-flex p-3 rounded-lg bg-primary/10 mb-4">
              <UIcon name="i-lucide-book-open" class="size-8 text-primary-500" />
            </div>
            <h3 class="text-lg font-semibold mb-2">Documentation</h3>
            <p class="text-sm text-muted mb-4">
              Learn how to use all features of Enlace
            </p>
            <UButton label="View Docs" variant="outline" color="neutral" />
          </div>
        </UCard>

        <UCard class="ring-1 ring-default">
          <div class="text-center">
            <div class="inline-flex p-3 rounded-lg bg-primary/10 mb-4">
              <UIcon name="i-lucide-message-circle" class="size-8 text-primary-500" />
            </div>
            <h3 class="text-lg font-semibold mb-2">Contact Support</h3>
            <p class="text-sm text-muted mb-4">
              Get help from our support team
            </p>
            <UButton label="Contact Us" variant="outline" color="neutral" />
          </div>
        </UCard>

        <UCard class="ring-1 ring-default">
          <div class="text-center">
            <div class="inline-flex p-3 rounded-lg bg-primary/10 mb-4">
              <UIcon name="i-lucide-video" class="size-8 text-primary-500" />
            </div>
            <h3 class="text-lg font-semibold mb-2">Video Tutorials</h3>
            <p class="text-sm text-muted mb-4">
              Watch step-by-step video guides
            </p>
            <UButton label="Watch Videos" variant="outline" color="neutral" />
          </div>
        </UCard>
      </div>

      <UCard class="ring-1 ring-default">
        <template #header>
          <h3 class="text-lg font-semibold">Frequently Asked Questions</h3>
        </template>

        <UAccordion
:items="faqs.map((faq, index) => ({
          label: faq.question,
          content: faq.answer,
          defaultOpen: index === 0
        }))" />
      </UCard>
    </template>
  </UDashboardPanel>
</template>

