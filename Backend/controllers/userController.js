import User from "../models/user.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

export function loginUser(req, res) {
  const data = req.body
  User.findOne({ email: data.email }).then((user) => {
    if(user == null){
      return res.status(400).json({ error: "User not found" })
    }else{

    	if (user.isBlocked) {
				res
					.status(403)
					.json({ error: "Your account is blocked please contact the admin" });
				return;
			}
      
    const isPasswordValid = bcrypt.compareSync(data.password, user.password)

    if(isPasswordValid){

      const token = jwt.sign({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        phone: user.phone
       }, process.env.JWT_SECRET)
      res.json({ message: "Login successful", token: token , user: user })
      
    } else{
      res.status(400).json({ error: "Invalid password" })

    }
  }
  });
}

export function registerUser(req, res) {

  const data = req.body
  data.password = bcrypt.hashSync(data.password, 10)

  const newUser = new User(data)

  newUser.save().then(() => {
    res.json({ message: "User Registered successfully" })
  }).catch((error) => {
    res.status(500).json({ error: error.message })
  })
}

export function isItAdmin(req){
 let isItAdmin = false;
    if(req.user != null){   
        if(req.user.role === "admin"){
          isItAdmin = true;
        }
    }
    return isItAdmin;
}

export function isItCustomer(req) {
	let isCustomer = false;

	if (req.user != null) {
		if (req.user.role == "customer") {
			isCustomer = true;
		}
	}

	return isCustomer;
}

export async function getAllUsers(req, res) {
	if (isItAdmin(req)) {
		try {
			const users = await User.find();
			res.json(users);
		} catch (e) {
			res.status(500).json({ error: "Failed to get users" });
		}
	} else {
		res.status(403).json({ error: "Unauthorized" });
	}
}

export async function blockOrUnblockUser(req, res) {
	const email = req.params.email;
	if (isItAdmin(req)) {
		try {
			const user = await User.findOne({
				email: email,
			});

			if (user == null) {
				res.status(404).json({ error: "User not found" });
				return;
			}

			const isBlocked = !user.isBlocked;

			await User.updateOne(
				{
					email: email,
				},
				{
					isBlocked: isBlocked,
				}
			);

			res.json({ message: "User blocked/unblocked successfully" });
		} catch (e) {
			res.status(500).json({ error: "Failed to get user" });
		}
	} else {
		res.status(403).json({ error: "Unauthorized" });
	}
}

export function getUser(req, res) {
	if (req.user != null) {
		res.json(req.user);
	} else {
		res.status(403).json({ error: "Unauthorized" });
	}
}

export async function loginWithGoogle(req, res) {
	//https://www.googleapis.com/oauth2/v3/userinfo
	const accesToken = req.body.accessToken;
	console.log(accesToken);
	try {
		const response = await axios.get(
			"https://www.googleapis.com/oauth2/v3/userinfo",
			{
				headers: {
					Authorization: `Bearer ${accesToken}`,
				},
			}
		);
		console.log(response.data);
		const user = await User.findOne({
			email: response.data.email,
		});
		if (user != null) {
			const token = jwt.sign(
				{
					firstName: user.firstName,
					lastName: user.lastName,
					email: user.email,
					role: user.role,
					profilePicture: user.profilePicture,
					phone: user.phone,
          emailVerified: true
				},
				process.env.JWT_SECRET
			);

			res.json({ message: "Login successful", token: token, user: user });
		} else {
      const newUser = new User({
        email: response.data.email,
        password: "123",
        firstName: response.data.given_name,
        lastName: response.data.family_name,
        address: "Not Given",
        phone: "Not given",
        profilePicture: response.data.picture,
        emailVerified: true,
      });
      const savedUser = await newUser.save();
      const token = jwt.sign(
        {
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          email: savedUser.email,
          role: savedUser.role,
          profilePicture: savedUser.profilePicture,
          phone: savedUser.phone,
        },
        process.env.JWT_SECRET
      );
      res.json({ message: "Login successful", token: token, user: savedUser });
		}
	} catch (e) {
		console.log(e);
		res.status(500).json({ error: "Failed to login with google" });
	}
}
