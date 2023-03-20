const express = require('express');
const tagsRouter = express.Router();
const { getAllTags, getPostsByTagName, getAllPosts} = require("../db")

tagsRouter.use((req, res, next) => {
    console.log("A request is being made to /posts");

//   res.send({ message: 'hello from /users!' });
    next();

});

// UPDATE
tagsRouter.get("/", async (req, res) => {
    const tags = await getAllTags();

    res.send({
        tags
    });
});

// Get tags by tag name

tagsRouter.get('/:tagName/posts', async (req, res, next) => {
    const { tagName } = req.params
    try {
        const getPost = await getPostsByTagName(tagName);
        // use our method to get posts by tag name from the db
        
        const filterPost = getPost.filter((post) => {
        return post.active && ( post.author.active && req.user && post.author.id === req.user.id)
    });
    res.send({ posts: filterPost })
      // send out an object to the client { posts: // the posts }
    } catch ({ name, message }) {
      next({name, message});
    }
  });
module.exports = tagsRouter;