# TinyMCE Editor Quick Reference

## 🚨 BEFORE YOU TOUCH THE EDITOR

**READ THIS FIRST** - The editor has specific fixes that prevent:
- Toolbar visibility issues
- Content loss during tab switching
- TinyMCE 7.0 compatibility problems

## ✅ SAFE TO MODIFY

### Adding New Toolbar Buttons
```typescript
// ✅ Safe - Add to existing toolbar arrays
const toolbars = [
  'undo redo | bold italic underline | your-new-button',
  'alignleft aligncenter alignright | bullist numlist'
];
```

### Adding New Editor Features
```typescript
// ✅ Safe - Add new props to EnhancedRichTextEditor
<EnhancedRichTextEditor
  value={content}
  onChange={handleChange}
  yourNewFeature={true}  // ✅ Safe to add
  // Keep existing critical props unchanged
  height={500}
  autoHeight={false}
/>
```

### Styling Changes
```css
/* ✅ Safe - Add new styles */
.tox .your-custom-class {
  /* Your styles */
}

/* ❌ DO NOT modify these critical rules */
.tox .tox-toolbar { /* DO NOT CHANGE */ }
.tox-tinymce { /* DO NOT CHANGE */ }
```

## ❌ DANGEROUS TO MODIFY

### Critical Configuration
```typescript
// ❌ DO NOT CHANGE
toolbar_mode: 'wrap',        // NOT 'sliding'
autoHeight: false,           // NOT true in PostEditorPage
height: 500,                 // Keep explicit height

// ❌ DO NOT ADD BACK
// paste_retain_style_properties (deprecated)
// table_responsive_width (deprecated)
```

### Critical Layout
```typescript
// ❌ DO NOT CHANGE
<div style={{ height: '500px', minHeight: '500px' }}>
  <EnhancedRichTextEditor
    height={500}
    autoHeight={false}
    className=""  // NOT "h-full"
  />
</div>
```

### Critical Content Logic
```typescript
// ❌ DO NOT MODIFY
const contentBackupRef = useRef<string>('');

// ❌ DO NOT REMOVE tab switching handlers
onValueChange={(value) => {
  // Content backup/restore logic
}}

// ❌ DO NOT ADD blocking conditions to content updates
if (value !== currentEditorContent && value !== currentContentRef.current) {
  editorRef.current.setContent(value || '', { format: 'html' });
}
```

## 🧪 TESTING CHECKLIST

Before committing changes:
- [ ] Toolbar visible on page load
- [ ] Content persists when switching tabs
- [ ] No console errors or warnings
- [ ] Works in both new and edit modes

## 🆘 QUICK FIXES

### Toolbar Not Visible?
```typescript
// Check these settings:
toolbar_mode: 'wrap',  // NOT 'sliding'
autoHeight: false,     // NOT true
height: 500,           // Explicit height set
```

### Content Disappearing?
```typescript
// Verify these exist:
const contentBackupRef = useRef<string>('');
// Tab switching backup/restore logic
// No blocking conditions in content updates
```

### Console Warnings?
```typescript
// Remove these deprecated options:
// paste_retain_style_properties
// table_responsive_width
```

## 📁 KEY FILES

- `components/EnhancedRichTextEditor.tsx` - Main editor component
- `pages/admin/PostEditorPage.tsx` - Editor page with tab handling
- `components/RichTextEditor.css` - Critical CSS rules
- `docs/TINYMCE_EDITOR_FIXES.md` - Full documentation

## 🔗 Test URLs

- New Post: `http://localhost:5173/admin/posts/new`
- Comparison: `http://localhost:5173/editor-comparison`

---

**Remember**: When in doubt, test with tab switching and toolbar visibility!
