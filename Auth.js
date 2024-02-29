const passport = require("./passport"); // Adjust the path accordingly
const jwtSecret = "your_jwt_secret";
const jwt = require("jsonwebtoken");

let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username, //Username that youre encoding to the JWT
    expiresIn: "7d", // Specifies when the token will expire
    algorithm: "HS256", // Algorithm used to "sign" or encode the values of the JWT
  });
};

// post login

// module.exports = (router)=> {
//     router.post('/login', (req,res) => {
//         passport.authenticate('local', {session: false}, (error, user, info) => {
//             if (error || !user) {
//                 return res.status(400).json({
//                     message: 'Something is not right!',
//                     user : user
//                 })
//             }
//             req.login(user, {session:false}, (error) => {
//                 if (error) {
//                     res.send(error);
//                 }
//                 let token = generateJWTToken(user.toJSON());
//                 return res.json ({ user,token});
//             });
//         }) (req, res);
//     });
// }

// Chat GPT Code
module.exports = (router) => {
  router.post("/login", (req, res) => {
    passport.authenticate("local", { session: false }, (error, user, info) => {
      if (error) {
        return res
          .status(500)
          .json({ message: "Internal server error", error: error });
      }

      if (!user) {
        return res
          .status(401)
          .json({ message: "Authentication failed", info: info });
      }

      req.login(user, { session: false }, (error) => {
        if (error) {
          return res
            .status(500)
            .json({ message: "Internal server error", error: error });
        }

        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });
};
