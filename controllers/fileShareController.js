const supabase=require('../config/supabaseClient.js');
const crypto =require('crypto');

const createShareLink = async (fileId, level = 'view', ownerId) => {
  try {
    // 🔐 Security Check: Confirm the user is the actual owner
    const { data: file, error: ownerError } = await supabase
      .from('files')
      .select('owner_id')
      .eq('id', fileId)
      .eq('owner_id', ownerId)
      .single();

    if (ownerError || !file) {
      throw new Error('Unauthorized or file not found.');
    }

    // 🔑 Generate a unique token
    const shareToken = crypto.randomUUID();

    // 📥 Insert into file_shares
    const { error: insertError } = await supabase
      .from('file_shares')
      .insert({
        file_id: fileId,
        share_token: shareToken,
        level: level,
      });

    if (insertError) {
      throw new Error('Could not create share link.');
    }

    return `https://yourapp.com/share/${shareToken}`;
  } catch (err) {
    console.error('Error creating share link:', err.message);
    throw err; // Re-throw to let the caller handle 
  }
};
// This would be in your API route or server-side page handler
async function handleFileAccess(token) {
  // 1. Find the share record and the associated file path
  const { data: share, error: shareError } = await supabase
    .from('file_shares')
    .select(`
      level,
      files ( file_url )
    `)
    .eq('share_token', token)
    .single();

  if (shareError || !share) {
    return { error: 'Link is invalid or has expired.' };
  }

  const storagePath = share.files.file_url;

  // 2. Generate the temporary signed URL (valid for 60 seconds)
  const { data, error: signedUrlError } = await supabase
    .storage
    .from('drive-files') 
    .createSignedUrl(storagePath, 60);

  if (signedUrlError) {
    return { error: 'Could not retrieve file.' };
  }

  // 3. Return the signed URL to be used for redirection
  return { redirectUrl: data.signedUrl };
};

module.exports={createShareLink,handleFileAccess}