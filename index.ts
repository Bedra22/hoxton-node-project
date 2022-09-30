import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
const port = 5000;
const SECRET = "Psssst";

const prisma = new PrismaClient({ log: ["warn", "error", "info", "query"] });

function getToken(id: number) {
  return jwt.sign({ id: id }, SECRET, { expiresIn: "1 day" });
}

async function keepUser(token: string) {
  const dataInCode = jwt.verify(token, SECRET);
  console.log(dataInCode);
  //@ts-ignore
  const userON = await prisma.user.findUnique({ where: { id: dataInCode.id } });

  return userON;
}

app.get("/users", async (req, res) => {
  const getUser = await prisma.user.findMany();
  res.send(getUser);
});

app.get("/followers/:userId", async (req, res) => {
  const followers = await prisma.follows.findMany({
    where: { followingId: Number(req.params.userId) },
    include: { follower: true },
  });
  const a = [];
  for (let b of followers) {
    a.push(b.follower);
  }
  res.send(a);
});

app.get("/checkfollowing/:user1/:user2", async (req, res) => {
  const what = await prisma.follows.findMany({
    where: {
      followerId: Number(req.params.user1),
      followingId: Number(req.params.user2),
    },
  });
  res.send({ follows: Boolean(what.length) });
});

app.get("/following/:userId", async (req, res) => {
  const followers = await prisma.follows.findMany({
    where: { followerId: Number(req.params.userId) },
    include: { following: true },
  });
  const a = [];
  for (let b of followers) {
    a.push(b.following);
  }
  res.send(a);
});

app.post("/follow/:user1/:user2", async (req, res) => {
  try {
    const follow = await prisma.follows.create({
      data: {
        followerId: Number(req.params.user1),
        followingId: Number(req.params.user2),
      },
    });
    res.send(follow);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/userStats/:userId", async (req, res) => {
  try {
    const following = await prisma.follows.findMany({
      where: { followerId: Number(req.params.userId) },
      include: { following: true },
    });
    const followers = await prisma.follows.findMany({
      where: { followingId: Number(req.params.userId) },
      include: { follower: true },
    });
    res.send({ following: following.length, followers: followers.length });
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post("/check-email", async (req, res) => {
  let match = null;
  match = await prisma.user.findUnique({
    where: { email: req.body.email },
  });
  console.log(req.body.email);
  if (match) {
    res.status(400).send({ error: "This Email is already in use" });
  } else {
    res.send({ message: "Y" });
  }
});

app.post("/sign-up", async (req, res) => {
  try {
    const match = await prisma.user.findUnique({
      where: { email: req.body.email },
    });
    if (match) {
      res.status(400).send({ error: "This Email is already in use" });
    } else {
      const newUser = await prisma.user.create({
        data: {
          email: req.body.email,
          phoneNr: req.body.phoneNr,
          profilePic: req.body.profilePic,
          fullName: req.body.fullName,
          password: bcrypt.hashSync(req.body.password),
          bio: req.body.Bio ? req.body.Bio : "",
        },
      });
      res.send({ newUser: newUser, token: getToken(newUser.id) });
    }
  } catch (error) {
    res.status(404).send(error);
  }
});

app.post("/log-in", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { email: req.body.email },
  });
  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    res.send({ user: user, token: getToken(user.id) });
  } else {
    res.status(400).send({ error: "Incorrect Email or password. Try again!" });
  }
});

app.get("/validation", async (req, res) => {
  try {
    if (req.headers.authorization) {
      const user = await keepUser(req.headers.authorization);
      // @ts-ignore
      res.send({ user, token: getToken(user?.id) });
      //   res.send({ wat: "asda" });
    }
  } catch (error) {
    // @ts-ignore
    res.status(400).send(error);
  }
});

app.get("/user", async (req, res) => {
  const user = await prisma.user.findMany({
    //@ts-ignore
    include: { tweets: true, comment: true, retweet: true, save: true },
  });
  res.send(user);
});

app.get("/user/:id", async (req, res) => {
  const tweets = await prisma.tweets.findMany({
    where: { userId: Number(req.params.id) },
    include: { User: true },
  });
  const user = await prisma.user.findUnique({
    where: { id: Number(req.params.id) },
    //@ts-ignore
    include: { tweets: true, comment: true, retweet: true, save: true },
  });
  if (user) {
    res.send(tweets);
  } else {
    res.status(404).send({ error: "User not found" });
  }
});

app.get("/singleUser/:id", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: Number(req.params.id) },
  });
  if (user) {
    res.send(user);
  } else {
    res.status(404).send({ error: "User not found" });
  }
});

app.get("/retweets/:userId", async (req, res) => {
  try {
    const retweets = await prisma.reTweet.findMany({
      where: { userId: Number(req.params.userId) },
      select: { Tweets: true },
    });
    let a = [];
    for (let item of retweets) {
      const user = await prisma.user.findUnique({
        where: { id: Number(item.Tweets.userId) },
      });
      // @ts-ignore
      item.Tweets.User = user;
      a.push(item.Tweets);
    }
    res.send(a);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/likes/:userId", async (req, res) => {
  try {
    const likes = await prisma.like.findMany({
      where: { userId: Number(req.params.userId) },
      select: { Tweets: true },
    });
    let a = [];
    for (let item of likes) {
      const user = await prisma.user.findUnique({
        // @ts-ignore
        where: { id: Number(item.Tweets.userId) },
      });
      // @ts-ignore
      item.Tweets.User = user;
      a.push(item.Tweets);
    }
    res.send(a);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/media/:userId", async (req, res) => {
  try {
    const tweets = await prisma.tweets.findMany({
      where: { userId: Number(req.params.userId) },
      include: { User: true },
    });
    const tweetsClone = tweets.filter((tweet) => {
      return tweet.image;
    });
    res.send(tweetsClone.reverse());
  } catch (error) {
    res.send(error);
  }
});

app.get("/tweets", async (req, res) => {
  try {
    //@ts-ignore
    const tweets = await prisma.tweets.findMany({
      include: {
        User: true,
        retweet: true,
        save: true,
        comment: true,
        like: true,
      },
    });
    const reversedTweets = tweets.reverse();
    res.send(reversedTweets);
  } catch (error) {
    res.status(400).send(error);
  }
});

// app.get("/tweets/:userId", async (req, res) => {
//   const tweets = await prisma.tweets.findMany({
//     where: { userId: Number(req.params.userId) },
//   });
//   res.send(tweets);
// });

app.post("/tweet", async (req, res) => {
  await prisma.tweets.create({
    data: req.body,
    //@ts-ignore
    include: { like: true, comment: true, retweet: true, save: true },
  });
  const newTweet = await prisma.tweets.findMany({
    //@ts-ignore
    include: {
      User: true,
      like: true,
      comment: true,
      retweet: true,
      save: true,
    },
  });
  res.send(newTweet);
});

app.get("/tweets/:id", async (req, res) => {
  const tweets = await prisma.tweets.findUnique({
    where: { id: Number(req.params.id) },
    //@ts-ignore
    include: {
      User: true,
      like: true,
      comment: true,
      retweet: true,
      save: true,
    },
  });
  if (tweets) {
    res.send(tweets);
  } else {
    res.status(404).send({ error: "Tweet not found" });
  }
});

app.get("/comments/:postId", async (req, res) => {
  const getComments = await prisma.comment.findMany({
    include: { User: true },
  });
  const comments = getComments.filter((comment) => {
    return comment.tweetsId === Number(req.params.postId);
  });
  res.send(comments.reverse());
});

app.post("/comment", async (req, res) => {
  try {
    await prisma.comment.create({
      data: req.body,
      include: { Tweets: true, User: true },
    });
    const getComments = await prisma.comment.findMany({
      include: { Tweets: true, User: true },
    });
    res.send(getComments);
  } catch (error) {
    //@ts-ignore
    res.status(400).send({ error: error.message });
  }
});
// app.get('/like', async (req, res) => {
//     const likes = await prisma.like.findMany({ include: { Tweets: true, User: true } })
//     res.send(likes)
// })
// app.post("/like", async (req, res) => {
//   try {
//     await prisma.like.create({
//       data: req.body,
//       include: { Tweets: true, User: true },
//     });
//     const likes = await prisma.like.findMany({
//       include: { Tweets: true, User: true },
//     });
//     res.send(likes);
//   } catch (error) {
//     //@ts-ignore
//     res.status(400).send({ error: error.message });
//   }
// });

app.post("/retweet/:userId/:tweetId", async (req, res) => {
  try {
    await prisma.reTweet.create({
      data: {
        userId: Number(req.params.userId),
        tweetsId: Number(req.params.tweetId),
      },
    });
  } catch (error) {
    res.send(error);
  }
});

app.post("/save/:userId/:tweetId", async (req, res) => {
  try {
    await prisma.save.create({
      data: {
        userId: Number(req.params.userId),
        tweetsId: Number(req.params.tweetId),
      },
    });
  } catch (error) {
    res.send(error);
  }
});

app.post("/like/:userId/:tweetId", async (req, res) => {
  try {
    await prisma.like.create({
      data: {
        userId: Number(req.params.userId),
        tweetsId: Number(req.params.tweetId),
      },
    });
  } catch (error) {
    res.send(error);
  }
});

app.get("/liked/:userId/:postId", async (req, res) => {
  try {
    const liked = await prisma.tweets.findUnique({
      where: {
        id: Number(req.params.postId),
      },
      include: {
        like: { where: { userId: Number(req.params.userId) } },
      },
    });
    console.log("here");
    // @ts-ignore
    res.send({ likes: liked.like });

    console.log(liked);
  } catch (error) {
    res.send(error);
  }
});

app.get("/saved/:userId/:postId", async (req, res) => {
  try {
    const saved = await prisma.tweets.findUnique({
      where: {
        id: Number(req.params.postId),
      },
      include: {
        save: { where: { userId: Number(req.params.userId) } },
      },
    });
    // @ts-ignore
    res.send({ saves: saved.save });
  } catch (error) {
    res.send(error);
  }
});

app.get("/retweeted/:userId/:postId", async (req, res) => {
  try {
    const retweeted = await prisma.tweets.findUnique({
      where: {
        id: Number(req.params.postId),
      },
      include: {
        retweet: { where: { userId: Number(req.params.userId) } },
      },
    });
    console.log("here");
    // @ts-ignore
    res.send({ retweets: retweeted.retweet });

    console.log(retweeted);
  } catch (error) {
    res.send(error);
  }
});

app.get("/retweets", async (req, res) => {
  // @ts-ignore
  const retweets = await prisma.reTweet.findMany({
    include: { Tweets: true, User: true },
  });
  res.send(retweets);
});

app.post("/retweets", async (req, res) => {
  try {
    // @ts-ignore
    await prisma.reTweet.create({
      data: {
        tweetsId: Number(req.body.tweetsId),
        userId: Number(req.body.userId),
      },
      include: { Tweets: true, User: true },
    });
    // @ts-ignore
    const retweets = await prisma.reTweet.findMany({
      include: { Tweets: true, User: true },
    });
    res.send(retweets);
  } catch (error) {
    //@ts-ignore
    res.status(400).send({ error: error.message });
  }
});

app.get("/save", async (req, res) => {
  // @ts-ignore
  const saves = await prisma.save.findMany({
    include: { Tweets: true, User: true },
  });
  res.send(saves);
});

app.post("/save", async (req, res) => {
  try {
    // @ts-ignore
    await prisma.save.create({
      data: {
        tweetsId: Number(req.body.tweetsId),
        userId: Number(req.body.userId),
      },
      include: { Tweets: true, User: true },
    });
    const saves = await prisma.save.findMany({
      include: { Tweets: true, User: true },
    });
    res.send(saves);
  } catch (error) {
    //@ts-ignore
    res.status(400).send({ error: error.message });
  }
});

app.post("/comment/:userId/:postId", async (req, res) => {
  try {
    const comment = await prisma.comment.create({
      data: {
        content: req.body.comment,
        userId: Number(req.params.userId),
        tweetsId: Number(req.params.postId),
      },
    });
    const getComments = await prisma.comment.findMany({
      include: { User: true },
    });
    const comments = getComments.filter((comment) => {
      return comment.tweetsId === Number(req.params.postId);
    });
    console.log(comments);
    res.send(comments.reverse());
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/trends", async (req, res) => {
  const trends = await prisma.trends.findMany({ include: { User: true } });
  res.send(trends);
});

app.get("/tweetStats/:postId", async (req, res) => {
  try {
    const tweet = await prisma.tweets.findUnique({
      where: { id: Number(req.params.postId) },
      include: { comment: true, like: true, save: true, retweet: true },
    });
    res.send({
      stats: {
        likes: tweet?.like.length,
        saves: tweet?.save.length,
        retweets: tweet?.retweet.length,
        comments: tweet?.comment.length,
      },
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

app.listen(port, () => {
  console.log(`App is running in http://localhost:${port}`);
});
