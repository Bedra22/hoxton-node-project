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
          password: bcrypt.hashSync(req.body.password),
          //   @ts-ignore
          fullName: req.body.fullName,
          profilePic: req.body.profilePic ? req.body.profilePic : null,
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
    res.status(400).send({ error: error.message, what: "asdsad" });
  }
});

app.get("/tweets", async (req, res) => {
  try {
    const tweets = await prisma.tweets.findMany({ include: { User: true } });
    res.send(tweets);
  } catch (error) {}
});

app.post("/create-tweet/:authorId", async (req, res) => {
  const tweet = await prisma.tweets.create({
    data: {
      title: "asdsa",
      content: req.body.content,
      userId: Number(req.params.authorId),
      image: req.body.image,
    },
  });
  res.send(tweet);
});

app.listen(port, () => {
  console.log(`App is running in http://localhost:${port}`);
});
