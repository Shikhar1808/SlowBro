export const getAllCourses = async (req, res) => {
    try {
        const [rows] = await req.db.query(`
            SELECT 
                c.*, 
                ROUND(AVG(r.rating), 1) AS average_rating
            FROM courses c
            LEFT JOIN reviews r ON c.course_id = r.course_id
            GROUP BY c.course_id
        `);

        res.status(200).json(rows);
    } 
    catch (error) {
        console.error("Error fetching courses:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getCoursesById = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ error: "Course ID is required" });
    }

    try {
        const [rows] = await req.db.query(`
            SELECT 
                c.*, 
                ROUND(AVG(r.rating), 1) AS average_rating
            FROM courses c
            LEFT JOIN reviews r ON c.course_id = r.course_id
            WHERE c.course_id = ?
            GROUP BY c.course_id
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Course not found" });
        }

        res.status(200).json(rows[0]);
    }
    catch (error) {
        console.error("Error fetching course:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


export const createCourse = async (req, res) => {
    const { title, description, price } = req.body;
    if (!title || !description || !price) {
        return res.status(400).json({ error: "Please provide all values" });
    }

    //test data
    let instructor_id = 8;
    let category_id = 1;

    // get a instructor_id and check it exists in the database
    // get a category_id and check it exists in the database
    
    try {

        //check if instructor_id exists in the database
        const [instructorRows] = await req.db.query("SELECT * FROM users WHERE user_id = ? AND role = 'instructor' ", [instructor_id]);
        if (instructorRows.length === 0) {
            return res.status(400).json(
                { error: "Instructor ID does not exist" }
            );
        }

        //check if category_id exists in the database
        const [categoryRows] = await req.db.query("SELECT * FROM categories WHERE category_id = ?", [category_id]);
        if (categoryRows.length === 0) {
            return res.status(400).json(
                { error: "Category ID does not exist" }
            );
        }
        console.log("Category ID exists in the database");

        const [rows] = await req.db.query("INSERT INTO courses (title, description, instructor_id, category_id, price) VALUES (?, ?, ?, ?, ?)", [title, description, instructor_id, category_id, price]);
        
        if (rows.affectedRows === 0) {
            return res.status(400).json(
                { error: "Failed to create course" }
            );
        }
        
        res.status(201).json(
            { message: "Course created successfully", courseId: rows.insertId }
        );
    } 
    catch (error) {
        console.error("Error creating course:", error);
        res.status(500).json(
            { error: "Internal server error" }
        );
    }
}

export const updateCourse = async (req, res) => {
    const { id } = req.params;
    const { courseName, description, price} = req.body;
    if (!id || !courseName || !description || !duration) {
        return res.status(400).json({ error: "Please provide all values" });
    }
    
    try {
        const [rows] = await req.db.query("UPDATE courses SET courseName = ?, description = ?, price = ? WHERE id = ?", [courseName, description, price, id]);
        if (rows.affectedRows === 0) {
            return res.status(404).json(
                { error: "Course not found" }
            );
        }
        
        res.status(200).json(
            { message: "Course updated successfully" }
        );
    } catch (error) {
        console.error("Error updating course:", error);
        res.status(500).json(
            { error: "Internal server error" }
        );
    }
}

export const deleteCourse = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json(
            { error: "Course ID is required" }
        );
    }
    try {
        const [rows] = await req.db.query("DELETE FROM courses WHERE id = ?", [id]);
        if (rows.affectedRows === 0) {
            return res.status(404).json(
                { error: "Course not found" }
            );
        }
        res.status(200).json(
            { message: "Course deleted successfully" }
        );
    } catch (error) {
        console.error("Error deleting course:", error);
        res.status(500).json(
            { error: "Internal server error" }
        );
    }
}