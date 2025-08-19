const express = require('express');
const { v4: uuidv4 } = require('uuid');

const supabase = require('../config/supabaseClient.js');
const { authMiddleware } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.post("/create", authMiddleware, async (req, res) => {
  const { name, parent_folder_id } = req.body;
  const owner_id = req.user.id; // ✅ from JWT

  const { data, error } = await supabase
    .from('folders')
    .insert([{
      id: uuidv4(),
      name,
      owner_id,
      parent_folder_id: parent_folder_id || null,
      created_at: new Date().toISOString(),
      is_deleted: false
    }]);
    console.log(name,owner_id)
  if (error) return res.status(400).json({ error: error.message });
  res.json({ data });
});


/**
 * Rename Folder
 */
router.put("/rename/:id", async (req, res) => {
  const { id } = req.params;
  const { newName } = req.body;

  const { error } = await supabase
    .from("folders")
    .update({ name: newName })
    .eq("id", id);

  if (error) return res.status(500).json({ error: error.message });

  res.json({ message: "Folder renamed successfully" });
});

/**
 * Soft Delete Folder
 */
router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from("folders")
    .update({ is_deleted: true })
    .eq("id", id);

  if (error) return res.status(500).json({ error: error.message });

  res.json({ message: "Folder moved to trash" });
});

router.delete('/permanent/folders/:id', async (req, res) => {
  const { id } = req.params;
  await supabase.from('folders').delete().eq('id', id).eq('owner_id', req.user.id);
  res.json({ message: 'Folder permanently deleted' });
});

module.exports = router;