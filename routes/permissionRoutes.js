// POST /api/files/:fileId/share
// (Assumes you have Express, the Supabase client, and auth middleware set up)
const express=require("express");
const supabase=require("../config/supabaseClient.js");
const {authMiddleware}=require('../middleware/authMiddleware.js')
const router=express.Router();

router.post('/:fileId/share',authMiddleware,  async (req, res) => {
    const ownerId = req.user.id; // ID of the user granting permission
    const { fileId } = req.params;
    const { email, level } = req.body;

    if (!['viewer', 'editor'].includes(level)) {
        return res.status(400).json({ error: 'Invalid level specified.' });
    }

    try {
        // 🔐 SECURITY CHECK: Verify the current user is the owner of the file.
        const { data: fileData, error: fileError } = await supabase
            .from('files')
            .select('owner_id')
            .eq('id', fileId)
            .single();
        console.log(filedata);

        if (fileError || !fileData || fileData.owner_id !== ownerId) {
            return res.status(403).json({ error: 'You do not have permission to share this file.' });
        }

        // 1. Find the user to grant permission to by their email
        const { data: granteeData, error: userError } = await supabase
            .from('users') // Assumes you have a 'users' table with emails
            .select('id')
            .eq('email', email)
            .single();

        if (userError || !granteeData) {
            return res.status(404).json({ error: 'User to share with not found.' });
        }
        const grantedToId = granteeData.id;

        //2. Insert the permission record into the database
        const { data: permissionData, error: permissionError } = await supabase
            .from('permissions')
            .insert({
                resource_type: 'file',
                resource_id: fileId,
                granted_to: grantedToId,
                granted_by: ownerId,
                level:level
               
            })
            .select();

        if (permissionError) {
            // Handle potential duplicate shares or other DB errors
            if (permissionError.code === '23505') { // unique constraint violation
                return res.status(409).json({ error: 'File has already been shared with this user.' });
            }
            throw permissionError;
        }

        res.status(201).json({ message: `File successfully shared with ${email} as a ${level}.`, permission: permissionData });

    } catch (error) {
        console.error('Error sharing file:', error);
        res.status(500).json({ error: 'An internal error occurred.' });
    }
});

module.exports = router;