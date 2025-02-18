const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Database connection
mongoose.connect("mongodb://localhost:27017/certificatesDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Certificate Schema
const certificateSchema = new mongoose.Schema({
  certId: { type: String, required: true, unique: true },
  userName: { type: String, required: true },
  issueDate: { type: Date, required: true },
  validity: { type: Date },
});

const Certificate = mongoose.model("Certificate", certificateSchema);

// API to store certificates
app.post("/api/certificates", async (req, res) => {
  try {
    const { certId, userName, issueDate, validity } = req.body;
    const newCertificate = new Certificate({ certId, userName, issueDate, validity });
    await newCertificate.save();
    res.status(201).json({ message: "Certificate stored successfully!" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// API to verify certificates
app.get("/api/certificates/:certId", async (req, res) => {
  try {
    const { certId } = req.params;
    const certificate = await Certificate.findOne({ certId });
    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found!" });
    }
    res.status(200).json(certificate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start the server
const PORT = 5001;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
