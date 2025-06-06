const express = require('express');
const router = express.Router();
const {
    createComment,
    getCommentById,
    updateComment,
    deleteComment,
    likeComment,
    dislikeComment,
    getCommentsByPostId,
    isCommentLikedByUser,
    unlikeComment
} = require('./comment.services');

/**
 * @swagger
 * /comment/create-comment:
 *   post:
 *     tags: [Comment]
 *     summary: Create a new comment
 *     description: Create a new comment with initial likes and dislikes set to 0
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: The content of the comment
 *               userId:
 *                 type: number
 *                 description: The author of the comment
 *               postId:
 *                  type: number
 *                  description: The post that be commented on
 *               parentId:
 *                  type: number
 *                  description: The parent comment id (for replies)
 *             required:
 *                  - content
 *                  - userId
 *                  - postId
 *     responses:
 *       201:
 *         description: Successfully created a new comment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Internal server error
 */
router.post('/create-comment', async (req, res) => {
    try {
        const commentData = req.body;
        const newComment = await createComment({
            ...commentData,
            likes: 0,
            dislikes: 0
        });
        res.status(201).json(newComment);
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /comment/{id}:
 *   get:
 *     tags: [Comment]
 *     summary: Get a comment by ID
 *     description: Retrieve a comment by its unique ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the comment
 *     responses:
 *       200:
 *         description: Successfully retrieved the comment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', async (req, res) => {
    try {
        const commentId = req.params.id;
        const comment = await getCommentById(commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        res.json(comment);
    } catch (error) {
        console.error('Error fetching comment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /comment/update-comment/{id}:
 *   patch:
 *     tags: [Comment]
 *     summary: Update a comment by ID
 *     description: Update the content or other properties of a comment by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the comment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: The updated content of the comment
 *     responses:
 *       200:
 *         description: Successfully updated the comment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Internal server error
 */
router.patch('/update-comment/:id', async (req, res) => {
    try {
        const commentId = req.params.id;
        const commentData = req.body;
        const updatedComment = await updateComment(commentId, commentData);
        if (!updatedComment) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        res.json(updatedComment);
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /comment/delete-comment/{id}:
 *   delete:
 *     tags: [Comment]
 *     summary: Delete a comment by ID
 *     description: Remove a comment by its unique ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the comment
 *     responses:
 *       200:
 *         description: Successfully deleted the comment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Internal server error
 */
router.delete('/delete-comment/:id', async (req, res) => {
    try {
        const commentId = req.params.id;
        const deletedComment = await deleteComment(commentId);
        if (!deletedComment) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        res.json(deletedComment);
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /comment/like-comment/{id}:
 *   post:
 *     tags: [Comment]
 *     summary: Like a comment
 *     description: Increment the like count of a comment by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the comment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user liking the comment
 *     responses:
 *       200:
 *         description: Successfully liked the comment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Internal server error
 */
router.post('/like-comment/:id', async (req, res, next) => {
    try {
        const { userId } = req.body;
        const commentId = req.params.id;
        const result = await likeComment(commentId, userId);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /comment/dislike-comment/{id}:
 *   post:
 *     tags: [Comment]
 *     summary: Dislike a comment
 *     description: Increment the dislike count of a comment by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the comment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user disliking the comment
 *     responses:
 *       200:
 *         description: Successfully disliked the comment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Internal server error
 */
router.post('/dislike-comment/:id', async (req, res, next) => {
    try {
        const { userId } = req.body;
        const commentId = req.params.id;
        const result = await dislikeComment(commentId, userId);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /comment/unlike-comment/{id}:
 *   post:
 *     tags: [Comment]
 *     summary: Unlike a comment
 *     description: Remove a like from a comment by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the comment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user unliking the comment
 *     responses:
 *       200:
 *         description: Successfully unliked the comment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 likes:
 *                   type: number
 *                   description: Updated number of likes
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Internal server error
 */
router.post('/unlike-comment/:id', async (req, res, next) => {
    try {
        const { userId } = req.body;
        const commentId = req.params.id;
        
        if (!userId) {
            return res.status(400).json({ error: 'Missing required field: userId' });
        }
        
        const result = await unlikeComment(commentId, userId);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error unliking comment:', error);
        
        if (error.message === 'Bình luận không tồn tại') {
            return res.status(404).json({ error: 'Comment not found' });
        }
        
        next(error);
    }
});

/**
 * @swagger
 * /comment/post/{postId}:
 *   get:
 *     tags: [Comment]
 *     summary: Get all comments for a post
 *     description: Retrieve all comments for a specific post, including replies
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post
 *     responses:
 *       200:
 *         description: Successfully retrieved the comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       404:
 *         description: Post not found or has no comments
 *       500:
 *         description: Internal server error
 */
router.get('/post/:postId', async (req, res) => {
    try {
        const postId = req.params.postId;
        const comments = await getCommentsByPostId(postId);
        
        res.status(200).json(comments);
    } catch (error) {
        console.error('Error fetching comments for post:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /comment/{commentId}/is-liked:
 *   get:
 *     tags: [Comment]
 *     summary: Check if a user liked a comment
 *     description: Check if a specific user has liked a specific comment
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the comment
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: Successfully checked like status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 liked:
 *                   type: boolean
 *                   description: Whether the user liked the comment
 *       400:
 *         description: Missing required parameters
 *       500:
 *         description: Internal server error
 */
router.get('/:commentId/is-liked', async (req, res) => {
    try {
        const { commentId } = req.params;
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'Missing required query parameter: userId' });
        }

        const liked = await isCommentLikedByUser(commentId, userId);
        res.status(200).json({ liked });
    } catch (error) {
        console.error('Error checking comment like status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;