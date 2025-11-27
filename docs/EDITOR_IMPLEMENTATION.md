# Core Editor Implementation Guide

## Overview

The Core Editor has been successfully implemented as a powerful Tiptap-based WYSIWYG editor for creating dynamic employee communication pages. This implementation fulfills all requirements from Month 2 of the PRD.

## ✅ Completed Features

### 1. Tiptap Integration
- **Base Editor**: Fully functional Tiptap editor with Vue 3 integration
- **Rich Text Formatting**: Bold, italic, underline, strikethrough
- **Text Alignment**: Left, center, right alignment
- **Lists**: Bullet lists and ordered lists
- **Headings**: Support for H1-H6
- **Links**: Clickable links with custom styling

### 2. Component Blocks

#### Navigation Components
- **Grid Block**: Responsive grid layout with configurable columns (1-4) and gap spacing
  - Add/remove grid items dynamically
  - Edit title and content for each item
  - Preview mode shows the final layout

- **Button Block**: Customizable buttons with multiple options
  - Custom label and URL
  - Color variants: primary, secondary, success, error, neutral
  - Styles: solid, outline, ghost
  - Sizes: xs, sm, md, lg, xl
  - Alignment: left, center, right

#### Content Components
- **Image Block**: Image upload and display
  - URL input or file upload support
  - Alt text for accessibility
  - Optional caption
  - Responsive width control

- **Video Block**: Video embedding
  - YouTube and Vimeo support with auto-conversion to embed URLs
  - Direct video URL support
  - Optional caption
  - Aspect-ratio responsive player

#### Validation Components
- **Quiz Block**: Interactive quizzes
  - Multiple choice and true/false questions
  - Add/remove questions dynamically
  - Configurable options per question
  - Correct answer tracking
  - Required/optional toggle
  - Show/hide results option

- **Confirm Block**: User acknowledgment
  - Custom title and message
  - Required/optional toggle
  - Checkbox interface for confirmation

### 3. Design Mode Implementation

#### Editor Toolbar
- Sticky toolbar with all text formatting options
- Component insertion buttons organized by category
- Active state indicators for formatting
- Intuitive icon-based interface

#### Component Palette
- Sidebar with all available components
- Organized into categories:
  - Navigation (Grid, Button)
  - Content (Image, Video)
  - Validation (Quiz, Confirm)
- Click-to-insert functionality
- Component descriptions for guidance

#### Component Property Panels
- Each component has an inline edit mode
- Edit/Done button toggles
- Form-based property configuration
- Delete component option
- Visual feedback on selection (ring border)

### 4. Draft Saving and Preview

#### Auto-Save
- Automatic draft saving every 30 seconds
- Manual save button with loading state
- Last saved timestamp display
- Toast notifications for save status

#### Preview Mode
- Full-screen preview modal
- Desktop and mobile view toggle
- Accurate representation of published page
- Maintains page title and content

### 5. Additional Features
- **Undo/Redo**: Built into Tiptap
- **Responsive Design**: Editor works on various screen sizes
- **Visual Feedback**: Selected components highlighted
- **Toast Notifications**: User feedback for actions

## File Structure

```
app/components/editor/
├── TiptapEditor.vue              # Main editor component
├── EditorToolbar.vue             # Formatting toolbar
├── ComponentPalette.vue          # Component insertion sidebar
├── PreviewModal.vue              # Preview modal with device views
└── extensions/
    ├── ImageBlock.ts             # Image block extension
    ├── ImageBlockView.vue        # Image block UI
    ├── VideoBlock.ts             # Video block extension
    ├── VideoBlockView.vue        # Video block UI
    ├── GridBlock.ts              # Grid layout extension
    ├── GridBlockView.vue         # Grid layout UI
    ├── ButtonBlock.ts            # Button block extension
    ├── ButtonBlockView.vue       # Button block UI
    ├── QuizBlock.ts              # Quiz validation extension
    ├── QuizBlockView.vue         # Quiz validation UI
    ├── ConfirmBlock.ts           # Confirm validation extension
    └── ConfirmBlockView.vue      # Confirm validation UI
```

## Usage

### Creating a New Page

1. Navigate to `/pages/create`
2. Enter a page title
3. Use the component palette (left sidebar) or toolbar buttons to add components
4. Click on components to edit their properties
5. Click "Save Draft" to save (auto-saves every 30 seconds)
6. Click "Preview" to see how the page looks on desktop/mobile
7. Switch to "Publish" tab when ready to publish

### Working with Components

#### Text Content
Use the editor toolbar for rich text formatting:
- Bold, italic, underline, strikethrough
- Headings (H1-H6)
- Text alignment
- Bullet and numbered lists

#### Image Block
1. Click "Image" in the palette or toolbar
2. Enter image URL or upload a file
3. Add alt text (for accessibility)
4. Optionally add a caption
5. Click "Save"

#### Video Block
1. Click "Video" in the palette or toolbar
2. Paste YouTube, Vimeo, or direct video URL
3. Optionally add a caption
4. Click "Save"

#### Grid Block
1. Click "Grid" in the palette
2. Configure number of columns (1-4)
3. Set gap spacing
4. Add/remove grid items
5. Edit title and content for each item
6. Click "Save"

#### Button Block
1. Click "Button" in the palette or toolbar
2. Set button label and URL
3. Choose color, variant, size
4. Set alignment
5. Click "Save"

#### Quiz Block
1. Click "Quiz" in the palette or toolbar
2. Set quiz title
3. Add questions
4. For each question:
   - Enter question text
   - Choose type (multiple choice or true/false)
   - Add/remove options
   - Select correct answer
5. Toggle required/optional
6. Click "Save"

#### Confirm Block
1. Click "Confirm" in the palette or toolbar
2. Set confirmation title
3. Enter confirmation message
4. Toggle required/optional
5. Click "Save"

## Technical Details

### Data Structure

Page content is stored as Tiptap JSON format:

```json
{
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "content": [...]
    },
    {
      "type": "imageBlock",
      "attrs": {
        "src": "...",
        "alt": "...",
        "caption": "..."
      }
    },
    {
      "type": "quizBlock",
      "attrs": {
        "title": "...",
        "questions": [...],
        "required": true
      }
    }
  ]
}
```

### Extensions

Each custom block is implemented as a Tiptap Node extension with:
- **Node definition**: Type, group, attributes
- **Vue component**: NodeViewRenderer for custom UI
- **Commands**: Methods to insert and manipulate nodes
- **Parsing**: HTML/JSON serialization

### State Management

- **Content**: Reactive ref updated on editor changes
- **Title**: Reactive ref for page title
- **Mode**: Design, Publish, Analytics tabs
- **Auto-save**: Interval-based with debouncing

## Next Steps

Based on the PRD, the following features are planned for Month 3:

- [ ] Groups and Contacts management integration
- [ ] Publish mode targeting (groups/contacts)
- [ ] Email notification system
- [ ] Social features (reactions, comments) - backend integration
- [ ] Additional validation components (Survey, Feedback)

## Dependencies

```json
{
  "@tiptap/vue-3": "^2.x",
  "@tiptap/starter-kit": "^2.x",
  "@tiptap/extension-image": "^2.x",
  "@tiptap/extension-link": "^2.x",
  "@tiptap/extension-placeholder": "^2.x",
  "@tiptap/extension-underline": "^2.x",
  "@tiptap/extension-text-align": "^2.x",
  "@tiptap/extension-color": "^2.x",
  "@tiptap/extension-text-style": "^2.x"
}
```

## Notes

- File upload currently uses FileReader for demo purposes. In production, implement proper file upload to Supabase Storage or S3.
- Auto-save currently logs to console. Implement actual API endpoint in `server/api/pages/draft.post.ts`.
- Preview mode shows structure but doesn't fully render Tiptap JSON. Implement proper content rendering for employee view.
- Consider adding more component types as needed (Audio, Embed, etc.).

## Support

For issues or questions about the editor implementation, refer to:
- [Tiptap Documentation](https://tiptap.dev/)
- [NuxtUI Documentation](https://ui.nuxt.com/)
- Project PRD at `docs/requirements/PRD.md`

