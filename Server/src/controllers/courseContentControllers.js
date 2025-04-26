// add modules to the courses
//get all modules of the course
//add videos to the modules
//get all videos of the module
//attach files to the modules
//add quizes to the module
//get all quizes of the module

export const addModuelsToCourse = async (req, res) => {
    const { courseId } = req.params;
    if (isNaN(courseId)) {
        return res.status(400).json({ 
            error: 'Invalid courseId' 
        });
    }

    const { title, position } = req.body;
    if (!title || !position) {
        return res.status(400).json({ 
            error: "Please provide all values" 
        });
    }

    try {
        const [courseRows] = await req.db.query("SELECT * FROM courses WHERE course_id = ?", [courseId]);
        if (courseRows.length === 0) {
            return res.status(404).json({ error: "Course not found" });
        }

        const [rows] = await req.db.query("INSERT INTO modules (title, position, course_id) VALUES (?, ?, ?)", [title, position, courseId]);
        res.status(201).json(
            { message: "Module added successfully", moduleId: rows.insertId }
        );
    }
    catch (err) {
        console.error("Error adding module:", err);
        res.status(500).json(
            { error: "Internal server error" }
        );
    }
}

//test controller, removing it later
export const getModulesByCourseId = async (req, res) => {
    const { courseId } = req.params;
    if (!courseId) {
        return res.status(400).json(
            { error: "Please provide course id" }
        );
    }

    try {
        const [rows] = await req.db.query("SELECT * FROM modules WHERE course_id = ?", [courseId]);
        if (rows.length === 0) {
            return res.status(404).json({ 
                message: "No modules found for this course" 
            });
        }
        res.status(200).json(
            { modules: rows }
        );
    }
    catch (err) {
        console.error("Error getting modules by course id:", err);
        res.status(500).json({ 
            error: "Internal server error" 
        });
    }
}

export const addVideoToModule = async (req, res) => {
    const{ moduleId } = req.params;
    const {title, position, video_url } = req.body;

    if (!title || !position || !video_url) {
        return res.status(400).json({
            error: "Please provide moduleId, title, position, and video_url",
        });
    }

    try {
        const [moduleRows] = await req.db.query(
            "SELECT * FROM modules WHERE module_id = ?",
            [moduleId]
        );
        if (moduleRows.length === 0) {
            return res.status(404).json({ error: "Module not found" });
        }

        const [insertResult] = await req.db.query(
            "INSERT INTO video (module_id, title, position, video_url) VALUES (?, ?, ?, ?)",
            [moduleId, title, position, video_url]
        );

        if (insertResult.affectedRows === 1) {
            return res.status(201).json({
                message: "Video added successfully",
                videoId: insertResult.insertId,
            });
        } else {
            return res.status(500).json({ error: "Failed to insert video" });
        }
    } catch (err) {
        console.error("Error adding video:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const addQuizToModule = async (req, res) => {
    const { moduleId } = req.params;
    const {question, correctAnswer } = req.body;

    if (!moduleId || !correctAnswer || !question) {
        return res.status(400).json({
            error: "Please provide moduleId, title, and questions",
        });
    }

    try {
        const [moduleRows] = await req.db.query(
            "SELECT * FROM modules WHERE module_id = ?",
            [moduleId]
        );
        if (moduleRows.length === 0) {
            return res.status(404).json({ error: "Module not found" });
        }

        const [insertResult] = await req.db.query(
            "INSERT INTO quizzes (module_id, question_text, correct_answer) VALUES (?, ?, ?)",
            [moduleId, question, correctAnswer]
        );
        if (insertResult.affectedRows === 1) {
            return res.status(201).json({
                message: "Quiz added successfully",
                quizId: insertResult.insertId,
            });
        }
        else {
            return res.status(500).json({ error: "Failed to insert quiz" });
        }
    } catch (err) {
        console.error("Error adding quiz:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const addFileToModule = async (req, res) => {
    const { moduleId } = req.params;
    const {file_url, position } = req.body;

    if (!moduleId || !file_url || !position) {
        return res.status(400).json({
            error: "Please provide moduleId and file_url",
        });
    }

    try {
        const [moduleRows] = await req.db.query(
            "SELECT * FROM modules WHERE module_id = ?",
            [moduleId]
        );
        if (moduleRows.length === 0) {
            return res.status(404).json({ error: "Module not found" });
        }

        const [insertResult] = await req.db.query(
            "INSERT INTO Lesson_Attachments (module_id, position, file_url) VALUES (?, ?,?)",
            [moduleId, position, file_url]
        );
        if (insertResult.affectedRows === 1) {
            return res.status(201).json({
                message: "File added successfully",
                fileId: insertResult.insertId,
            });
        } else {
            return res.status(500).json({ error: "Failed to insert file" });
        }
    } catch (err) {
        console.error("Error adding file:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const getModuleContent = async (req, res) => {
    const { moduleId } = req.params;

    if (!moduleId) {
        return res.status(400).json({
            error: "Module ID is required"
        });
    }

    try {
        const [results] = await req.db.query(`CALL get_module_content(?)`, [moduleId]);

        if (results && results[0] && results[0][0]?.message === 'Module not found') {
            return res.status(404).json({
                error: 'Module not found'
            });
        }

        if (results && results[0] && results[0][0]?.error_message) {
            return res.status(500).json(
                {
                    error: results[0][0].error_message

                });
        }

        const quizzes = results[0];
        const videos = results[1];
        const attachments = results[2];

        return res.status(200).json({
            message: "Module content retrieved successfully",
            moduleId,
            quizzes,
            videos,
            attachments
        });

    } catch (err) {
        console.error("Error fetching module content:", err);
        return res.status(500).json({
            error: "Internal server error"
        });
    }
};
