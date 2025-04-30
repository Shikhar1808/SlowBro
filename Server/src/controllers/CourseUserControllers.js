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
  
  export const answerQuiz = async (req, res) => {
    const { module_id, user_id, user_answer } = req.body;
    const { id } = req.params;
    const quiz_id = id;
    if (!module_id || !user_id || !quiz_id || !user_answer?.trim()) {
      return res.status(400).json({ message: 'Missing module_id, user_id, quiz_id, or user_answer.' });
    }
  
    try {
      const [resultSets] = await req.db.query('CALL SubmitQuizResult(?, ?, ?, ?)', [
        module_id,
        user_id,
        quiz_id,
        user_answer,
      ]);
  
      const result = resultSets[0]; // First row of the SELECT output from procedure
      console.log(resultSets);
      res.status(200).json({
        message: 'Quiz result submitted successfully.',
        correct_answer: result.correct_answer,
        your_answer: result.user_answer,
        score: result.score,
      });
    } catch (error) {
      const sqlMessage = error?.sqlMessage || error.message;
  
      if (
        sqlMessage.includes('does not exist') ||
        sqlMessage.includes('Invalid') ||
        sqlMessage.includes('Quiz does not belong')
      ) {
        return res.status(400).json({ message: sqlMessage });
      }
  
      if (sqlMessage.includes('already attempted')) {
        return res.status(409).json({ message: sqlMessage });
      }
  
      console.error('DB Error:', sqlMessage);
      res.status(500).json({ message: 'Failed to submit quiz result.', error: sqlMessage });
    }
  };

  export const quizAnswerWithoutProcedure = async (req, res) => {
    const {user_id, user_answer } = req.body;
    const { id } = req.params;
    const quiz_id = id;
    if (!user_id || !quiz_id || !user_answer?.trim()) {
      return res.status(400).json({ message: 'Missing module_id, user_id, quiz_id, or user_answer.' });
    }
  
    try{
        //check if user already attempted the quiz
        const [attemptedRows] = await req.db.query(
            'SELECT * FROM quiz_results WHERE user_id = ? AND quiz_id = ?',
            [user_id, quiz_id]
        );
        if(attemptedRows.length > 0){
            return res.status(409).json({ message: 'You have already attempted this quiz.' });
        }
            

        const [rows] = await req.db.query(
            'SELECT correct_answer FROM Quizzes WHERE quiz_id = ?',
            [quiz_id]
        );
    
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Quiz not found.' });
        }
    
        const correct_answer = rows[0].correct_answer;
    
        if (!correct_answer) {
            return res.status(400).json({ message: 'Correct answer is not available for this quiz.' });
        }
    
        const normalizedUserAnswer = user_answer.trim().toLowerCase();
        const normalizedCorrectAnswer = correct_answer.trim().toLowerCase();
    
        const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;

        let score = 0.00;
        if (isCorrect) {
            score = 10.00; // or whatever scoring logic you want
        }

        // Save the result to the database (if needed)
        await req.db.query(
            'INSERT INTO quiz_results (user_id, quiz_id, score) VALUES (?, ?, ?)',
            [user_id, quiz_id, score]
        );
    
        res.status(200).json({
            quiz_id,
            user_answer,
            correct_answer,
            isCorrect,
            message: isCorrect ? 'Correct answer!' : 'Incorrect answer.',
        });
    }
    catch (error) {
        console.error('DB Error:', error.message);
        res.status(500).json({ message: 'Failed to check answer.', error: error.message });
    }
  }


  export const testQuizAnswer = async (req, res) => {
    const { user_answer } = req.body;
    const { id } = req.params;
    const quiz_id = id;
  
    try {
      // Get the correct answer from the DB
      const [rows] = await req.db.query(
        'SELECT correct_answer FROM Quizzes WHERE quiz_id = ?',
        [quiz_id]
      );
  
      if (rows.length === 0) {
        return res.status(404).json({ message: 'Quiz not found.' });
      }
  
      const correct_answer = rows[0].correct_answer;
  
      if (!correct_answer) {
        return res.status(400).json({ message: 'Correct answer is not available for this quiz.' });
      }
  
      const normalizedUserAnswer = user_answer.trim().toLowerCase();
      const normalizedCorrectAnswer = correct_answer.trim().toLowerCase();
  
      const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
  
      res.status(200).json({
        quiz_id,
        user_answer,
        correct_answer,
        isCorrect,
        message: isCorrect ? 'Correct answer!' : 'Incorrect answer.',
      });
    } catch (error) {
      res.status(500).json({ message: 'Error checking answer.', error: error.message });
    }
  };
  
  
  

