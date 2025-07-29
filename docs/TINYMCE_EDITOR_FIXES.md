# TinyMCE Editor Fixes Documentation

## Overview
This document outlines critical fixes applied to resolve toolbar visibility and content persistence issues in the blog editor. **READ THIS BEFORE MAKING ANY CHANGES TO THE EDITOR COMPONENTS.**

## 🚨 CRITICAL ISSUES THAT WERE FIXED

### Issue 1: Toolbar Visibility Problems
**Symptoms:**
- Toolbar not visible when editor first loads
- Toolbar only appears after keyboard shortcuts (Ctrl+Z)
- Toolbar hidden or clipped by parent containers

**Root Causes:**
- `toolbar_mode: 'sliding'` causing initial hiding
- Complex flex layout with `min-h-0` and `overflow-hidden` clipping toolbar
- `autoHeight={true}` conflicting with fixed height layouts
- TinyMCE 7.0 deprecated configurations causing initialization issues

### Issue 2: Content Persistence Problems
**Symptoms:**
- Text content gets cleared when switching between tabs
- Content lost when navigating away from Content tab and returning
- Race conditions during tab switching

**Root Causes:**
- Overly restrictive `onBeforeSetContent` handler blocking legitimate updates
- Missing content backup mechanism during tab switches
- Radix UI Tabs interaction issues with editor content synchronization
- `isTabVisibleRef` check preventing content restoration

## ✅ APPLIED FIXES - DO NOT MODIFY

### 1. TinyMCE Configuration Fixes
```typescript
// ✅ KEEP THESE SETTINGS
toolbar_mode: 'wrap', // NOT 'sliding'
// ❌ REMOVED deprecated TinyMCE 7.0 options:
// paste_retain_style_properties (deprecated)
// table_responsive_width (deprecated)
```

### 2. PostEditorPage Layout Fixes
```typescript
// ✅ KEEP THESE LAYOUT SETTINGS
<div className="flex-1 p-4 md:p-6" style={{ minHeight: '600px' }}>
  <div style={{ height: '500px', minHeight: '500px' }}>
    <EnhancedRichTextEditor
      height={500}
      autoHeight={false}  // ❌ NOT true
      className=""        // ❌ NOT "h-full"
    />
```

### 3. Content Persistence System
```typescript
// ✅ KEEP THIS BACKUP MECHANISM
const contentBackupRef = useRef<string>('');

// Store content when leaving Content tab
if (currentTab === 'content' && value !== 'content') {
  contentBackupRef.current = post.content;
}

// Restore content when returning to Content tab
if (contentBackupRef.current && (!post.content || post.content === '<p></p>')) {
  setPost(prev => ({ ...prev, content: contentBackupRef.current }));
}
```

### 4. Enhanced Content Synchronization
```typescript
// ✅ KEEP THIS LOGIC - allows proper content updates
if (value !== currentEditorContent && value !== currentContentRef.current) {
  editorRef.current.setContent(value || '', { format: 'html' });
  currentContentRef.current = value;
}
```

## 🚫 WHAT TO AVOID - CRITICAL

### ❌ DO NOT Change These Settings
1. **toolbar_mode**: Must remain `'wrap'`, NOT `'sliding'`
2. **autoHeight**: Must be `false` in PostEditorPage context
3. **Layout classes**: Do NOT use `h-full`, `min-h-0`, `overflow-hidden` on editor containers
4. **Content blocking**: Do NOT add restrictive conditions to `onBeforeSetContent`

### ❌ DO NOT Remove These Components
1. **contentBackupRef**: Critical for content persistence
2. **Tab switching handlers**: Required for proper content restoration
3. **Toolbar visibility CSS**: Prevents toolbar hiding issues
4. **Content synchronization logic**: Prevents content loss

### ❌ DO NOT Add These Back
1. **Deprecated TinyMCE options**: `paste_retain_style_properties`, `table_responsive_width`
2. **Blocking isTabVisibleRef checks**: Prevents content restoration
3. **Complex flex layouts**: Causes toolbar clipping issues

## 🔧 TECHNICAL IMPLEMENTATION DETAILS

### EnhancedRichTextEditor Component
**Key Changes:**
- Enhanced `onBeforeSetContent` handler with proper conditions
- Improved tab switching detection with Radix UI compatibility
- Forced toolbar visibility in initialization and tab switches
- Removed blocking conditions that prevented content updates

### PostEditorPage Component
**Key Changes:**
- Added `contentBackupRef` for content persistence
- Enhanced tab switching handler with backup/restore logic
- Fixed layout constraints (removed `min-h-0`, added explicit heights)
- Improved content change handler with backup mechanism

### CSS Fixes
**Critical Rules:**
```css
/* ✅ KEEP - Ensures toolbar visibility */
.tox .tox-toolbar {
  display: flex !important;
  visibility: visible !important;
  opacity: 1 !important;
}

/* ✅ KEEP - PostEditorPage compatibility */
.tox-tinymce {
  min-height: 500px !important;
  height: 500px !important;
}
```

## 🧪 TESTING REQUIREMENTS

### Before Making Changes
1. Test toolbar visibility on editor load
2. Test content persistence across all tabs (Content, SEO, Publishing, Advanced)
3. Verify no TinyMCE console warnings
4. Test both new post creation and existing post editing

### Test Scenarios
1. **Toolbar Visibility**: Navigate to `/admin/posts/new` - toolbar should be immediately visible
2. **Content Persistence**: Type content → switch tabs → return to Content → verify content remains
3. **Multiple Switches**: Repeat tab switching multiple times to ensure consistency
4. **Browser Tab Switching**: Switch browser tabs and return to verify content persists

## 📋 MAINTENANCE GUIDELINES

### When Updating TinyMCE
1. Check for new deprecated configurations
2. Test toolbar visibility after updates
3. Verify content persistence still works
4. Update this documentation if new issues arise

### When Modifying Layout
1. Maintain explicit height settings for editor containers
2. Avoid `overflow-hidden` on parent containers
3. Test toolbar visibility after layout changes
4. Ensure content backup system remains functional

### When Adding Features
1. Do NOT modify the core content synchronization logic
2. Test new features with tab switching scenarios
3. Ensure new features don't interfere with toolbar visibility
4. Maintain backward compatibility with existing content persistence

## 🚨 EMERGENCY ROLLBACK

If issues reoccur, revert these specific changes:
1. Change `toolbar_mode` back to `'wrap'`
2. Ensure `autoHeight={false}` in PostEditorPage
3. Restore content backup mechanism
4. Re-apply toolbar visibility CSS rules

## 📞 SUPPORT

If you encounter issues:
1. Check browser console for TinyMCE errors
2. Verify toolbar visibility CSS rules are applied
3. Confirm content backup mechanism is functioning
4. Test with the comparison tool at `/editor-comparison`

---

**Last Updated**: 2025-01-29  
**Status**: ✅ STABLE - DO NOT MODIFY WITHOUT TESTING  
**Critical Components**: EnhancedRichTextEditor, PostEditorPage, RichTextEditor.css
