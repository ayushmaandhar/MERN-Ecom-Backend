import mongoose from "mongoose";
import validator from "validator";


interface IUser extends Document {
    _id: String;
    name: String;
    email: String;
    photo: String;
    role: "admin" | "user";
    gender: "male" | "female" | "others";
    dob: Date;
    createdAt: Date;
    updatedAt: Date;
    // Virtual Attribute
    age: number; 
}


const schema = new mongoose.Schema(
    {
        _id: {
            type: String,
            required: [true, "Please Enter ID"],
        },
        name: {
            type: String,
            required: [true, "Please Enter Name"],
        },
        email: {
            type: String,
            unique: [true, "Email Already Exists"],
            required: [true, "Please Enter Email"],
            validate: validator.default.isEmail,
        },
        photo: {
            type: String,
            required: [true, "Please add Photo"],
        },
        role: {
            type: String,
            enum: ["admin", "user"],
            default: "user",
        },
        gender: {
            type: String,
            enum: ["male", "female", "others"],
            required: [true, "Please Enter gender"],
        },
        dob: {
            type: Date,
            required: [true, "Please Enter D.O.B."],
        },
        
    },
    {
        timestamps: true,
    }
);

schema.virtual("age").get( function(){
    const today = new Date();
    const dob = this.dob;
    let age = today.getFullYear() - dob.getFullYear();

    if (
        today.getMonth() < dob.getMonth() ||
        (
            today.getMonth() === dob.getMonth() 
            && 
            today.getDate() < dob.getDate()
        )
    ){
        age--;
    }
        
    return age;    
})

export const User = mongoose.model<IUser>("User", schema);