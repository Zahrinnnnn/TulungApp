# Fix for Existing Receipt URLs

## Problem Identified

Your existing expense has a **public URL** stored in the database:
```
https://ncpyifzcaqqnofmvutpg.supabase.co/storage/v1/object/public/receipts/...
```

But the bucket is **private**, so it returns **400 Bad Request**.

The new code generates **signed URLs** which look like:
```
https://ncpyifzcaqqnofmvutpg.supabase.co/storage/v1/object/sign/receipts/...
```

## Quick Fix Options

### Option 1: Make Bucket Public (Simplest - For Testing)

This will make all existing and new receipts work immediately.

**Steps:**
1. Go to Supabase Dashboard → Storage → receipts
2. Click on the bucket settings (gear icon)
3. Toggle "Public bucket" to **ON**
4. Refresh your app
5. Images should now load!

⚠️ **Note:** Anyone with the URL can view images (less secure, but fine for testing)

---

### Option 2: Delete Old Expenses & Create New Ones

Since you just created this test expense:

1. Delete the existing expense from the app
2. Create a new expense with a photo
3. The new one will use signed URLs and work correctly

**The new upload code already creates signed URLs**, so any new expenses will work fine!

---

### Option 3: Migrate Existing URLs to Signed URLs (Advanced)

Run this SQL in Supabase SQL Editor to convert all existing public URLs to signed URLs:

```sql
-- This function will regenerate signed URLs for all existing receipts
DO $$
DECLARE
    expense_record RECORD;
    file_path TEXT;
    new_signed_url TEXT;
BEGIN
    FOR expense_record IN
        SELECT id, receipt_url
        FROM expenses
        WHERE receipt_url IS NOT NULL
        AND receipt_url LIKE '%/object/public/receipts/%'
    LOOP
        -- Extract file path from public URL
        file_path := regexp_replace(
            expense_record.receipt_url,
            '.*\/object\/public\/receipts\/',
            ''
        );

        -- Generate signed URL (valid for 1 year = 31536000 seconds)
        SELECT signed_url INTO new_signed_url
        FROM storage.create_signed_url('receipts', file_path, 31536000);

        -- Update expense with new signed URL
        UPDATE expenses
        SET receipt_url = new_signed_url
        WHERE id = expense_record.id;

        RAISE NOTICE 'Updated expense %: % -> %',
            expense_record.id, expense_record.receipt_url, new_signed_url;
    END LOOP;
END $$;
```

Then refresh the app.

---

## Recommended Solution

**For now, I recommend Option 1 (Make Bucket Public)** because:
- ✅ Simplest and fastest
- ✅ Makes all images work immediately (old and new)
- ✅ Good for development/testing
- ⚠️ Can switch to private later for production

**For production later:**
- Switch to private bucket
- Use signed URLs (code already does this)
- Set up proper storage policies

---

## Verify the Fix

After applying Option 1:

1. Refresh the app
2. Navigate to the expense detail
3. The image should now load!
4. Check console - no more 400 errors

## Future Expenses

All new expenses will work perfectly because the code now:
1. ✅ Uploads to Supabase Storage
2. ✅ Generates signed URL (if private) or public URL (if public)
3. ✅ Saves correct URL to database
4. ✅ Displays in ExpenseDetailScreen
