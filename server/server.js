import bcrypt from "bcrypt";
import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
app.use(express.json());

// DB
const users = [];

app.get("/", (req, res) => res.send("Home Page"));

app.get("/users", (req, res) => res.json(users));

app.post("/users/signup", async (req, res) => {
  const user = { name: req.body.name, password: req.body.password };
  try {
    const incryptPass = await bcrypt.hash(user.password, 10);
    users.push({ name: user.name, password: incryptPass });
    res.status(201).send("your'e signed up successfuly!");
  } catch {
    res.status(500).send();
  }
});

// login
app.post("/user/login", async (req, res) => {
  const person = { name: req.body.name, password: req.body.password };
  const user = users.find((user) => person.name === user.name);

  if (!user) {
    return res.send("can not find user");
  }

  try {
    if (await bcrypt.compare(person.password, user.password)) {
      const token = jwt.sign(
        { userName: person.name },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 60 }
      );
      console.log("you are loged-in: ", token);
      res.status(200).json(token);
    } else {
      res.status(401).send("password doesn't match");
    }
  } catch {
    res.status(401).send("sothing went wrong :/");
  }
});

app.post("/restricted_area", AuthorizeUser, (req, res) => {
  res.send("your'e in a restricted area");
});

// Authorization
async function AuthorizeUser(req, res, next) {
  const token = req.headers?.authorization.split(" ")[1];
  if (!token) {
    console.log("there's a token");
    return res.sendStatus(401);
  }
  try {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    console.log("invalid token");
    return res.status(403).send(err);
  }
  next();
}

app.listen(3000);
