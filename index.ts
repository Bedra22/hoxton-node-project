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

// app.post("/check-email", async (req, res) => {
//     let match = null;
//     match = await prisma.user.findUnique({
//         where: { email: req.body.email },
//     });
//     console.log(req.body.email);
//     if (match) {
//         res.status(400).send({ error: "This Email is already in use" });
//     } else {
//         res.send({ message: "Y" });
//     }
// });

app.post('/sign-up', async (req, res) => {

    try {
        const match = await prisma.user.findUnique({
            where: { email: req.body.email }
        })
        if (match) {
            res.status(400).send({ error: "This Email is already in use" })
        } else {
            const newUser = await prisma.user.create({
                data: {
                    email: req.body.email,
                    phoneNr: req.body.phoneNr,
                    profilePic: req.body.profilePic,
                    fullName: req.body.fullName,
                    password: bcrypt.hashSync(req.body.password),
                }
            })
            res.send({ newUser: newUser, token: getToken(newUser.id) })
        }
    } catch (error) {
        res.status(404).send(error)
    }

})

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
    const user = await prisma.user.findUnique({
        where: { id: Number(req.params.id) },
        //@ts-ignore
        include: { tweets: true, comment: true, retweet: true, save: true },
    });
    if (user) {
        res.send(user);
    } else {
        res.status(404).send({ error: "User not found" });
    }
});



app.get("/tweets", async (req, res) => {
    try {
        //@ts-ignore
        const tweets = await prisma.tweets.findMany({ include: { User: true, retweet: true, save: true, comment: true, like: true } });
        const reversedTweets = tweets.reverse();
        res.send(reversedTweets);
    } catch (error) {
        res.status(400).send(error);
    }
});

app.post("/tweets", async (req, res) => {
    await prisma.tweets.create({
        data: req.body,
        //@ts-ignore
        include: { like: true, comment: true, retweet: true, save: true },
    });
    const newTweet = await prisma.tweets.findMany({
        //@ts-ignore
        include: { User: true, like: true, comment: true, retweet: true, save: true },
    });
    res.send(newTweet);
})

app.get("/tweets/:id", async (req, res) => {
    const tweets = await prisma.tweets.findUnique({
        where: { id: Number(req.params.id) },
        //@ts-ignore
        include: { User: true, like: true, comment: true, retweet: true, save: true },
    });
    if (tweets) {
        res.send(tweets);
    } else {
        res.status(404).send({ error: "Tweet not found" });
    }
});

app.get('/comments', async (req, res) => {
    const getComments = await prisma.comment.findMany({
        include: { Tweets: true, User: true }
    })
    res.send(getComments)
})

app.post('/comment', async (req, res) => {
    try {
        await prisma.comment.create({
            data: req.body,
            include: { Tweets: true, User: true }
        })
        const getComments = await prisma.comment.findMany({
            include: { Tweets: true, User: true }
        })
        res.send(getComments)
    } catch (error) {
        //@ts-ignore
        res.status(400).send({ error: error.message })
    }
})
// app.get('/like', async (req, res) => {
//     const likes = await prisma.like.findMany({ include: { Tweets: true, User: true } })
//     res.send(likes)
// })
app.post('/like', async (req, res) => {
    try {
        await prisma.like.create({
            data: req.body,
            include: { Tweets: true, User: true }
        })
        const likes = await prisma.like.findMany({ include: { Tweets: true, User: true } })
        res.send(likes)
    } catch (error) {
        //@ts-ignore
        res.status(400).send({ error: error.message })
    }
})
app.get('/retweets', async (req, res) => {
    const retweets = await prisma.reTweet.findMany({ include: { Tweets: true, User: true } })
    res.send(retweets)
})

app.post('/retweets', async (req, res) => {
    try {
        await prisma.reTweet.create({
            data: {
                tweetsId: Number(req.body.tweetsId),
                userId: Number(req.body.userId)
            },
            include: { Tweets: true, User: true }
        })
        const retweets = await prisma.reTweet.findMany({ include: { Tweets: true, User: true } })
        res.send(retweets)
    } catch (error) {
        //@ts-ignore
        res.status(400).send({ error: error.message })
    }
})

app.get('/save', async (req, res) => {
    const saves = await prisma.save.findMany({ include: { Tweets: true, User: true } })
    res.send(saves)
})

app.post('/save', async (req, res) => {
    try {
        await prisma.save.create({
            data: {
                tweetsId: Number(req.body.tweetsId),
                userId: Number(req.body.userId)
            },
            include: { Tweets: true, User: true }
        })
        const saves = await prisma.save.findMany({ include: { Tweets: true, User: true } })
        res.send(saves)
    } catch (error) {
        //@ts-ignore
        res.status(400).send({ error: error.message })
    }
})
app.listen(port, () => {
    console.log(`App is running in http://localhost:${port}`);
});
