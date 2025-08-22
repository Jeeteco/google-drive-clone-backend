
const supabase = require('../config/supabaseClient')


// User Registration (Sign Up)
const registerUser = async (req, res) => {
    const { email, password, full_name } = req.body;

    // console.log(email, password, full_name, avatar_url);
    try {

        if (!email || !password || !full_name) {
            return res.status(500).json({ error: "missing Data" });
        }
        console.log(email, password, full_name)


        // console.log(email, password);

        //registration authentication with supabase
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });
        console.log(data.user)


        if (error) {
            console.log(error.message)

            return res.status(400).json({ error: error.message });
        }

        const checkConfirmation = async () => {
            const { data, error } = await supabase.auth.getUser();

            if (error) {
                console.error(error.message);
                return;
            }

            const user = data.user;

            if (user?.email_confirmed_at) {
                console.log("✅ Email confirmed:", user.email);
            } else {
                console.log("❌ Email not confirmed yet");
            }
        };

        const id = data.user.id;
        const avatar_url = `http://${full_name}/${id}.com`
        console.log(avatar_url);

        // console.log(id);

        // console.log(name,image_url,uid)
        //insert into users table
        if (data.user) {


            const { data, error } = await supabase
                .from('users')
                .insert([
                    {
                        id: id,
                        full_name,
                        avatar_url,
                        email
                    },
                ])

            if (error) {
                return res.status(401).json({ error })
            } else {
                console.log(data)
            }

            //console.log("data inserted sucessfully");
        } else {
            console.log("Data entry is failed ");
        }


        res.json(checkConfirmation());

    } catch (error) {
        console.error(error);
    }

};


// User Login (Sign In)
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        // console.log(email)

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });    


        if (error) return res.status(400).json({ error: error.message });

        //  const { data: user, error:err } = await supabase
        //     .from('users')
        //     .select('id')
        //     .order('created_at', { ascending: false })
        //     .limit(1)
        //     .single();
        //  if(err) return res.status(400).json({err:err.message})
        
        //     console.log(user);

        res.json({ message: "Login successful", user: data.user, session: data.session });
    } catch (error) {
        console.error(error.message);
    }
};



// User Logout (Sign Out)
const logoutUser = async (req, res) => {
    const { error } = await supabase.auth.signOut();

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: "Logged out successfully" });
};

module.exports = { registerUser, loginUser, logoutUser };