
export const getAllUsers = async (req, res) => {
    try {
        // const connection = await db.getConnection();
        console.log("Fetching all users...");
        const [rows] = await req.db.query("SELECT * FROM users");
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json(
            { error: "Internal server error" }
        );
    }
}

export const createUserStudent = async(req,res)=>{
    console.log(req.body)
    const{userName, email, password} = req.body;
    const role = "student";
    if(!userName || !email || !password){
        return res.status(400).json(
            {error:"Please provide all values"}
        );
    }

    try{
        console.log("CreateUserStudent function called");

        const [userRows] = await req.db.query("SELECT * FROM users WHERE email = ?", [email]);
        if(userRows.length > 0){
            return res.status(400).json(
                {error:"User already exists"}
            );
        }

        console.log("User does not exist, proceeding to create a new user.");

        const [rows] = await req.db.query("INSERT INTO users (userName, email, password, role) VALUES (?, ?, ?, ?)", [userName, email, password, role]);
        
        res.status(201).json(
            {message:"User created successfully", userId: rows.insertId}
        ); 
    }
    catch(error){
        console.error("Error creating user:", error);
        res.status(500).json(
            {error:"Internal server error"}
        );
    }
}

export const createUserAdmin = async(req,res)=>{
    console.log(req.body)
    const{userName, email, password} = req.body;
    const role = "admin";
    if(!userName || !email || !password){
        return res.status(400).json(
            {error:"Please provide all values"}
        );
    }

    try{
        console.log("CreateUserAdmin function called");

        const [userRows] = await req.db.query("SELECT * FROM users WHERE email = ?", [email]);
        if(userRows.length > 0){
            return res.status(400).json(
                {error:"User already exists"}
            );
        }

        console.log("User does not exist, proceeding to create a new user.");

        const [rows] = await req.db.query("INSERT INTO users (userName, email, password, role) VALUES (?, ?, ?, ?)", [userName, email, password, role]);
        
        res.status(201).json(
            {message:"User created successfully", userId: rows.insertId}
        ); 
    }
    catch(error){
        console.error("Error creating user:", error);
        res.status(500).json(
            {error:"Internal server error"}
        );
    }
}

export const createUserTeacher = async(req,res)=>{
    console.log(req.body)
    const{userName, email, password} = req.body;
    const role = "instructor";
    if(!userName || !email || !password){
        return res.status(400).json(
            {error:"Please provide all values"}
        );
    }

    try{
        console.log("CreateUserTeacher function called");

        const [userRows] = await req.db.query("SELECT * FROM users WHERE email = ?", [email]);
        if(userRows.length > 0){
            return res.status(400).json(
                {error:"User already exists"}
            );
        }

        console.log("User does not exist, proceeding to create a new user.");

        const [rows] = await req.db.query("INSERT INTO users (userName, email, password, role) VALUES (?, ?, ?, ?)", [userName, email, password, role]);
        
        res.status(201).json(
            {message:"User created successfully", userId: rows.insertId}
        ); 
    }
    catch(error){
        console.error("Error creating user:", error);
        res.status(500).json(
            {error:"Internal server error"}
        );
    }
}

export const enrollInCourse = async (req, res) => {
    const {courseId, paymentAmount} = req.body;
    let {userId} = req.body;
    if(!courseId || !paymentAmount){
        return res.status(400).json(
            {error:"Please provide all values"}
        );
    }

    try{
        const [userCheck] = await req.db.query("SELECT * FROM users WHERE user_id = ?", [userId]);
        if(userCheck.length === 0){
            return res.status(400).json(
                {error:"User does not exist"}
            );
        }

        const [courseCheck] = await req.db.query("SELECT * FROM courses WHERE course_id = ?", [courseId]);
        if(courseCheck.length === 0){
            return res.status(400).json(
                {error:"Course does not exist"}
            );
        }

        const [enrollmentCheck] = await req.db.query("SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?", [userId, courseId]);
        if(enrollmentCheck.length > 0){
            return res.status(400).json(
                {error:"User already enrolled in this course"}
            );
        }

        const coursePrice = courseCheck[0].price;
        if(paymentAmount != coursePrice){
            return res.status(400).json(
                {error:"Payment amount is not equal to course price"}
            );
        }

        const [rows] = await req.db.query("INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)", [userId, courseId]);
        if(rows.affectedRows === 0){
            return res.status(400).json(
                {error:"Failed to enroll in course"}
            );
        }

        //add this to payments table
        const [paymentRows] = await req.db.query("INSERT INTO payments (user_id, course_id, amount_paid) VALUES (?, ?, ?)", [userId, courseId, paymentAmount]);
        if(paymentRows.affectedRows === 0){
            return res.status(400).json(
                {error:"Failed to add payment"}
            );
        }

        res.status(201).json({
            message:"Enrolled in course successfully", enrollmentId: rows.insertId
        });
    }
    catch(err){
        console.error("Error enrolling in course:", err);
        res.status(500).json(
            {error:"Internal server error"}
        );
    }
}