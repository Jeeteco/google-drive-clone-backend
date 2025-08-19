
const { createClient } =require('@supabase/supabase-js') 
const dotenv=require('dotenv');
dotenv.config();
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseKey || !supabaseUrl) {
    throw new Error("Missing the supabaseUrl and Supabase anon key in .env");
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports=supabase;
