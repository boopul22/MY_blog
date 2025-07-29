# Documentation

This folder contains critical documentation for the TinyMCE editor fixes and maintenance guidelines.

## 📚 Documentation Files

### 🚨 [TINYMCE_EDITOR_FIXES.md](./TINYMCE_EDITOR_FIXES.md)
**MUST READ** - Comprehensive technical documentation of all editor fixes
- Detailed problem analysis and solutions
- Critical settings that must not be changed
- Technical implementation details
- Emergency rollback procedures

### ⚡ [EDITOR_QUICK_REFERENCE.md](./EDITOR_QUICK_REFERENCE.md)
Quick reference guide for developers
- Safe vs dangerous modifications
- Testing checklist
- Quick fixes for common issues
- Key files and test URLs

### 📊 [EDITOR_FIXES_SUMMARY.md](./EDITOR_FIXES_SUMMARY.md)
Executive summary of all fixes applied
- Issues resolved
- Files modified
- Performance impact
- Maintenance guidelines

## 🎯 Quick Start

### For AI Assistants
1. **READ** `TINYMCE_EDITOR_FIXES.md` before making ANY editor changes
2. **FOLLOW** the guidelines in `EDITOR_QUICK_REFERENCE.md`
3. **TEST** toolbar visibility and content persistence after changes

### For Developers
1. **Check** `EDITOR_QUICK_REFERENCE.md` for safe modification guidelines
2. **Test** with the checklist before committing changes
3. **Refer** to `TINYMCE_EDITOR_FIXES.md` for detailed technical context

## 🚨 Critical Reminders

- **Toolbar visibility** and **content persistence** issues were complex to fix
- **DO NOT** modify core editor configuration without reading documentation
- **ALWAYS** test tab switching scenarios after changes
- **MAINTAIN** the content backup system in PostEditorPage

## 🧪 Testing

Test URLs:
- Main Editor: `http://localhost:5173/admin/posts/new`
- Debug Page: `http://localhost:5173/editor-debug`

Test Scenarios:
1. Toolbar visible on page load
2. Content persists when switching tabs
3. No console warnings

---

**Last Updated**: 2025-01-29  
**Status**: ✅ All editor issues resolved
