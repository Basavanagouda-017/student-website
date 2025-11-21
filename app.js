const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
const port = 3000;

// ✅ Connect to MongoDB Atlas (Corrected password encoding)
const mongoURL = process.env.MONGO_URI || "mongodb+srv://basavanagoudapatil017_db_user:Darshan%40123@cluster0.ugixk9m.mongodb.net/studentdb?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(mongoURL)
  .then(() => console.log("🔥 MongoDB Atlas Connected"))
  .catch(err => console.log("❌ MongoDB Error:", err));


// 🎓 Create schema & model
const studentSchema = new mongoose.Schema({
  name: String,
  email: String,
  age: Number,
  phone: String,
  gender: String,
  course: String,
  address: String
});

const Student = mongoose.model("Student", studentSchema);

// ⚙️ Middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// 🏠 Home page
app.get("/", (req, res) => {
  res.render("index");
});

// 📝 Registration page
app.get("/register", (req, res) => {
  res.render("register");
});

// 💾 Save student data
app.post("/register", async (req, res) => {
  const { name, email, age, phone, gender, course, address } = req.body;

  if (!name || !email || !age || !phone || !gender || !course || !address) {
    return res.send("All fields are required!");
  }

  try {
    const newStudent = new Student({ name, email, age, phone, gender, course, address });
    await newStudent.save();
    console.log("✅ Student data saved:", newStudent);
    res.render("success", { name });
  } catch (err) {
    console.error("❌ Error while saving:", err);
    res.send("Error saving student data!");
  }
});

// 📋 View all students
app.get("/students", async (req, res) => {
  try {
    const students = await Student.find();
    res.render("students", { students, total: students.length });
  } catch (err) {
    console.error(err);
    res.send("Error fetching data!");
  }
});

// 🚀 Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
