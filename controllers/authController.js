
const supabase = require('../config/supabaseClient')


// User Registration (Sign Up)
const registerUser = async (req, res) => {
    const { email, password, full_name, avatar_url } = req.body;

    // console.log(email, password, full_name, avatar_url);
    try {

        if (!email || !password || !full_name || !avatar_url) {
            return res.status(500).json({ error: "missing Data" });
        }
        console.log(email,password,avatar_url,full_name)

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

        const id = data.user.id;

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
        res.json({ message: "User registered successfully", data });

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