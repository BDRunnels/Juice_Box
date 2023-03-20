const express = require('express');
const postsRouter = express.Router();
const { getAllPosts, createPost, updatePost, getPostById } = require("../db");
const { requireUser, requireActiveUser } = require("./utils");

postsRouter.use((req, res, next) => {
    console.log("A request is being made to /posts");

//   res.send({ message: 'hello from /users!' });
    next();

});

// Checking if user is logged in.
// postsRouter.post("/", requireUser, async (req, res, next) => {
//     res.send({message: "Under Construction."});
// });

// Sending Tags
postsRouter.post("/", requireActiveUser, async (req,res,next) => {
    const { title, content, tags = ""} = req.body;
    const tagArr = tags.trim().split(/\s+/);
    const postData = {};

    // only send the tags if there are some to send
    if (tagArr.length) {
        postData.tags = tagArr;
    }
    if (req.user) {
        postData.authorId = req.user.id;
    } 
    if (title) {
        postData.title = title;
    } else {
        next({message: "No title entered."});
    }
    if (content) {
        postData.content = content;
    } else {
        next({message: "No post content entered."});
    }
    try {
        // postData.authorId = req.user.id;
        // postData.title = title;
        // postData.content = content;
        

        const post = await createPost(postData);

        if (post) {
            res.send({post});
            console.log(postData.tags);
        } else { 
            next({message: "No post has been made."});
        }
    } catch ({name, message}) {
        next({name, message});
    }
});

// Editing Post by Id
postsRouter.patch("/:postId", requireActiveUser, async (req,res,next) => {
    console.log(req.params)
    const { postId } = req.params;
    const {title, content, tags} = req.body;

    const updateFields = {};

    if ( tags && tags.length > 0) {
        updateFields.tags = tags.trim().split(/\s+/);
    }
    if (title) {
        updateFields.title = title;
    }
    if (content) {
        updateFields.content = content;
    }
    try {
        const originalPost = await getPostById(postId);

        if (originalPost.author.id === req.user.id) {
            const updatedPost = await updatePost(postId, updateFields);
            res.send({ post: updatedPost})
        } else {
            next({
                name: "UnauthorizedUserError.",
                message: "You cannot update a post that is not yours."
            });
        }
    } catch ({name, message}) {
        next({name, message});
        
    }
});

// UPDATE
postsRouter.get("/", async (req, res) => {
    const posts = await getAllPosts();

    res.send({
        posts
    });
});

// Deleting Post by Id
postsRouter.delete('/:postId', requireActiveUser, async (req, res, next) => {
    try {
      const post = await getPostById(req.params.postId);
  
      if (post && post.author.id === req.user.id) {
        const updatedPost = await updatePost(post.id, { active: false });
  
        res.send({ post: updatedPost });
      } else {
        // if there was a post, throw UnauthorizedUserError, otherwise throw PostNotFoundError
        next(post ? { 
          name: "UnauthorizedUserError",
          message: "You cannot delete a post which is not yours"
        } : {
          name: "PostNotFoundError",
          message: "That post does not exist"
        });
      }
  
    } catch ({ name, message }) {
      next({ name, message })
    }
  });

  postsRouter.get('/', async (req, res, next) => {
    try {
      const allPosts = await getAllPosts();
  
      const posts = allPosts.filter(post => {
        // keep a post if it is either active, or if it belongs to the current user
        // if (post.active) {
        //     return true;
        // }
        // if (req.user && post.author.id === req.user.id) {
        //     return true;
        // }

        // return false;
        return (post.active && post.author.active) || (post.author.active && req.user && post.author.id === req.user.id) 

      });
  
      res.send({
        posts
      });
    } catch ({ name, message }) {
      next({ name, message });
    }
  });

module.exports = postsRouter;


// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFsYmVydCIsInBhc3N3b3JkIjoiYmVydGllOTkiLCJpYXQiOjE2NzkyNjA1NjN9.EMrWIG4OlbWEgj69qxYbWZHtUCuzErWO-wIEmXRBNfI
