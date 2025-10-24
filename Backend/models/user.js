import mongoose from "mongoose";

  let userSchema  = new mongoose.Schema({
    role:{
      type: String,
      required: true,
      default: "customer"
    },
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    isBlocked : {
      type : Boolean,
      required : true,
      default : false
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    address: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    profilePicture: {
      type: String,
      required: true,
      default: "https://cdn.vectorstock.com/i/1000v/92/16/default-profile-picture-avatar-user-icon-vector-46389216.avif"
    }
  })

  const User = mongoose.model("User", userSchema)

  export default User;