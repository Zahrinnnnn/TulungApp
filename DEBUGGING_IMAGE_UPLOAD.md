# Debugging Receipt Image Upload

## Issue
Receipt images are not displaying in the ExpenseDetailScreen after upload.

## Troubleshooting Steps

### 1. Check Console Logs

When you create an expense with an image, look for these console logs:

```
📸 Uploading receipt image from URI: file:///...
✅ Receipt uploaded. Signed URL: https://...supabase.co/storage/v1/object/sign/receipts/...
💾 Creating expense with data: {...}
✅ Expense created in DB: {...}
```

Then when viewing the expense detail:
```
📋 Expense Detail - Expense ID: xxx
📋 Receipt URL: https://...
📋 Full expense data: {...}
```

**If you see any errors here, note them down.**

### 2. Verify Supabase Storage Bucket Setup

Go to your Supabase Dashboard → Storage:

#### Check if `receipts` bucket exists:
- ✅ Should exist
- ⚠️ If missing, create it

#### Check bucket privacy settings:
The bucket can be either **public** or **private**:

**Option A: Public Bucket (Simpler for testing)**
1. Go to Storage → receipts bucket → Configuration
2. Set bucket to **Public**
3. Update `expenseService.ts` to use `getPublicUrl`:

```typescript
// In uploadReceiptImage function, replace the signed URL code with:
const { data: urlData } = supabase.storage
  .from('receipts')
  .getPublicUrl(fileName);

return urlData.publicUrl;
```

**Option B: Private Bucket (More secure - current setup)**
1. Bucket should be **Private**
2. Code already uses `createSignedUrl` (correct)
3. Check RLS policies exist:

```sql
-- Run this in Supabase SQL Editor to check policies
SELECT * FROM pg_policies WHERE tablename = 'objects';
```

### 3. Check Storage Policies

Go to Supabase → Storage → Policies

You should have these policies on the `receipts` bucket:

**Upload Policy:**
```sql
CREATE POLICY "Users can upload own receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'receipts' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

**Read Policy (for private bucket):**
```sql
CREATE POLICY "Users can view own receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'receipts' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### 4. Test Image Upload Manually

Try uploading directly in Supabase Dashboard:
1. Go to Storage → receipts
2. Click "Upload file"
3. Upload a test image
4. Try to view it
5. Check if you can generate a signed URL

### 5. Check Network Tab

In your browser dev tools (if using Expo Web) or React Native Debugger:
- Check if the image URL request is being made
- Check for 403 Forbidden errors (permission issue)
- Check for 404 Not Found errors (file doesn't exist)

### 6. Common Issues & Solutions

#### Issue: Image URL is null or undefined
**Solution:** Image upload failed. Check console logs for upload errors.

#### Issue: 403 Forbidden when loading image
**Solution:** Storage policies are incorrect or bucket is private without signed URL.
- Make bucket public, OR
- Ensure signed URL is being used (already implemented)

#### Issue: 404 Not Found
**Solution:** Image wasn't actually uploaded to Supabase.
- Check Supabase Storage → receipts bucket
- Verify files exist under your user ID folder

#### Issue: Signed URL expired
**Solution:** Signed URL has a 1-year expiry. If testing with old data:
- Delete old expenses and create new ones

#### Issue: Image displays on web but not mobile
**Solution:** Network policy or permissions issue.
- Check if device has internet connection
- Check if Supabase URL is accessible from mobile

### 7. Quick Fix: Use Public Bucket (Testing Only)

For quick testing, make the bucket public:

1. **Supabase Dashboard:**
   - Storage → receipts → Settings
   - Change to "Public bucket"

2. **Update code** - Edit `src/services/expenseService.ts`:

```typescript
// Replace this:
const { data: urlData, error: urlError } = await supabase.storage
  .from('receipts')
  .createSignedUrl(fileName, 31536000);

if (urlError) throw urlError;
return urlData.signedUrl;

// With this:
const { data: urlData } = supabase.storage
  .from('receipts')
  .getPublicUrl(fileName);

return urlData.publicUrl;
```

3. **Restart app** and test

⚠️ **Note:** Public buckets are less secure. Anyone with the URL can view images.

### 8. Verify Image in Database

Check if receipt_url is saved in the database:

```sql
-- Run in Supabase SQL Editor
SELECT id, amount, receipt_url
FROM expenses
WHERE user_id = 'your-user-id'
ORDER BY created_at DESC
LIMIT 5;
```

### 9. Test with Simple Image

Create a test expense with:
- Amount: 10
- Category: Food & Dining
- Take a photo or choose from gallery
- Save
- Navigate to detail view
- Check console logs

## Expected Behavior

1. ✅ Take/choose photo → Shows preview in AddExpenseScreen
2. ✅ Click Save → Shows "Uploading..." in console
3. ✅ Upload completes → Shows signed URL in console
4. ✅ Expense created → Shows success alert
5. ✅ Navigate to detail → Image displays at top
6. ❌ If image fails to load → Shows "Unable to load receipt image" error

## Need More Help?

Share the console logs from:
1. Creating an expense (from step 1)
2. Viewing expense details (from step 1)
3. Any error messages

This will help identify the exact issue!
