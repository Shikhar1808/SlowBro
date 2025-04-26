// controller for enrollment
//controller to get all courses by instructor_id
//controller to get all courses by user_id
// controller for writting reviews
//controller for getting reviews by course id
//controller to award certificates


export const enrollInCourse = async (req, res) => {
    const { userId, courseId, paymentAmount } = req.body;
  
    if (!userId || !courseId || !paymentAmount) {
      return res.status(400).json({ error: "Please provide all values" });
    }
  
    try {
      const [rows] = await req.db.query(
        `CALL enroll_in_course_with_payment(?, ?, ?)`,
        [userId, courseId, paymentAmount]
      );
  
      const resultMessage = rows[0][0]?.message;
  
      if (resultMessage === 'Enrolled in course successfully') {
        return res.status(201).json({ message: resultMessage });
      } else {
        return res.status(400).json({ error: resultMessage || 'Unknown error occurred' });
      }
    } catch (err) {
      console.error('Error in enrollInCourse:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  

export const getCoursesByInstructorId = async (req, res) => {
    const {id} = req.params;
    if(!id){
        return res.status(400).json(
            {error:"Please provide instructor id"}
        );
    }

    try{
        const [rows] = await req.db.query("CALL get_courses_by_instructor(?)", [id]);

        const data = rows[0];
        if (data.length === 1 && data[0].message) {
            res.json({ message: data[0].message });
        } 
        else {
            res.json({ courses: data });
        }
    }
    catch(err){
        console.error("Error getting courses by instructor id:", err);
        res.status(500).json(
            {error:"Internal server error"}
        );
    }
}

export const getEnrolledCoursesByUserId = async (req, res) => {
    const {id} = req.params;
    if(!id){
        return res.status(400).json(
            {error:"Please provide user id"}
        );
    }

    try{
        const [rows] = await req.db.query("CALL get_enrolled_courses_by_student(?)", [id]);

        const data = rows[0];
        if (data.length === 1 && data[0].message) {
            res.json({ message: data[0].message });
        } 
        else {
            res.json({ courses: data });
        }
    }
    catch(err){
        console.error("Error getting enrolled courses by user id:", err);
        res.status(500).json(
            {error:"Internal server error"}
        );
    }
}

export const userWriteReview = async (req, res) => {
    const { userId, courseId, review } = req.body;

    if (!userId || !courseId || !review || !review.rating || !review.comment) {
        return res.status(400).json({
            error: "Please provide userId, courseId, rating, and comment"
        });
    }

    try {
        // Call the stored procedure
        const [result] = await req.db.query(
            "CALL write_review(?, ?, ?, ?)",
            [userId, courseId, review.rating, review.comment]
        );

        return res.status(201).json({
            message: "Review submitted successfully",
            result
        });
    } catch (err) {
        const message = err?.sqlMessage || err.message || "Internal server error";
        console.error("Error writing review:", message);
        return res.status(500).json({
            error: message
        });
    }
};

export const getReviewsByCourseId = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json(
            { error: "Please provide course id" }
        );
    }

    try {
        const [rows] = await req.db.query("SELECT * FROM reviews WHERE course_id = ?", [id]);
        if(rows.length === 0) {
            return res.status(404).json({ message: "No reviews found for this course" });
        }
        
        res.status(200).json(
            { reviews: rows }
        );
    }
    catch (err) {
        console.error("Error getting reviews by course id:", err);
        res.status(500).json(
            { error: "Internal server error" }
        );
    }
}

export const awardCertificate = async (req, res) => {
    const { userId, courseId } = req.body;
  
    try {
  
      const [rows] = await req.db.query(
        `CALL award_certificate(?, ?)`,
        [userId, courseId]
      );
  
      res.json({ message: rows[0][0]?.message || 'Unknown response' });
    } catch (err) {
      console.error('Error awarding certificate:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  

