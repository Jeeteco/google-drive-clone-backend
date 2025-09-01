const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const supabase = require('../config/supabaseClient.js')
const { authMiddleware } = require('../middleware/authMiddleware.js');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

//upload 

router.post("/upload", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    const { folder_id } = req.query;
    const file = req.file;
    
    console.log("hlw",folder_id);

    //  Get user ID from req.use
    const owner_id = req.user.id;

    // console.log(file);
    // console.log(owner_id);

    if (!file) return res.status(400).json({ error: "No file uploaded" });
    if (!owner_id) return res.status(400).json({ error: "Missing owner_id" });

    const fileId = uuidv4();
    const ext = file.originalname.split(".").pop();
    const path = `${owner_id}/${fileId}.${ext}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("drive-files")
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const fileUrl = supabase.storage.from("drive-files").getPublicUrl(path).data.publicUrl;

    console.log(fileUrl);

    // Insert file metadata
    const { error: dbError } = await supabase
      .from("files")
      .insert([

        {
          id: fileId,
          name: file.originalname,
          file_url: fileUrl,
          size: file.size,
          mime_type: file.mimetype,
          owner_id: owner_id, // This is now guaranteed to be the correct user ID
          folder_id: folder_id || null,
        }

      ]).select();

    if (dbError) {
      // If you still get an error here, it's a different problem
      console.error('🔴 Database Error:', dbError);
      return res.status(500).json({ error: dbError.message });
    }
    res.json({ message: "File uploaded successfully", file_url: fileUrl, id: fileId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/getFiles/:owner_id' ,async (req, res) => {
  const {owner_id}=req.params;
  
  // Fetch data from the 'files' table
  const { data: files, error } = await supabase
    .from('files')
    .select('*').eq('is_deleted', false).eq("owner_id", owner_id);
  // console.log(files)
  // 1. Handle potential errors
  if (error) {
    console.error('Error fetching files:', error);
    return res.status(500).json({ error: 'Could not fetch files' });
  }

  // 2. Send the data back to the client on success
  res.status(200).json(files);
});

//trash file
router.get('/trash/getFiles/:owner_id', async (req, res) => {
   const {owner_id}=req.params;
  const { data: files, error } = await supabase
    .from('files')
    .select('*').eq('is_deleted', true);
  // console.log(files)
  // 1. Handle potential errors
  if (error) {
    console.error('Error fetching files:', error);
    return res.status(500).json({ error: 'Could not fetch files' });
  }

  // 2. Send the data back to the client on success
  res.status(200).json(files);

})

// restore trased file
router.put("/restore/:id", async (req, res) => {
  const { id } = req.params;



  const { error } = await supabase
    .from("files")
    .update({ is_deleted: false })
    .eq("id", id).select();
  // console.log(data);

  if (error) return res.status(500).json({ error: error.message });

  res.json({ message: "File renamed successfully" });
});





/**
 * Rename File
 */
router.put("/rename/:id",authMiddleware, async (req, res) => {
  //  console.log("req.body:", req.body); 
  const { id } = req.params;
  const { newName } = req.body;
  console.log(newName);

  const { error } = await supabase
    .from("files")
    .update({ name: newName })
    .eq("id", id).select();
  // console.log(data);

  if (error) return res.status(500).json({ error: error.message });

  res.json({ message: "File renamed successfully" });
});


/**
 * Soft Delete File
 */
router.delete("/delete/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from("files")
    .update({ is_deleted: true })
    .eq("id", id);

  if (error) return res.status(500).json({ error: error.message });

  res.json({ message: "File moved to trash" });
});

router.delete('/permanent/delete/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  const { data: file } = await supabase
    .from('files')
    .select()
    .eq('id', id)
    .eq('owner_id', req.user.id)
    .single();

  if (file) {
    await supabase.storage.from(process.env.SUPABASE_BUCKET).remove([file.file_url]);
    await supabase.from('files').delete().eq('id', id);
  }

  res.json({ message: 'File permanently deleted' });
});


module.exports = router;