const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs").promises;
const path = require("path");
const serverless = require("serverless-http"); // For Vercel deployment

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS & Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "INTERNSHIP")));

// JSON file paths (Ensure proper relative paths)
const dataDir = path.join(__dirname, "data"); // Store JSON files in a 'data' folder
const studentsJsonFilePath = path.join(dataDir, "generated_students.json");
const certificatesJsonFilePath = path.join(dataDir, "certificates.json");
const studentStatusJsonFilePath = path.join(dataDir, "internship_progress.json");
const studentCertificatesFile = path.join(dataDir, "completed_internships.json");
const studentProjectsJsonFilePath = path.join(dataDir, "student_projects.json");

// Utility: Read JSON File
const readJsonFile = async (filePath, defaultValue = []) => {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    if (err.code === "ENOENT") {
      console.log(`${filePath} not found, initializing empty data.`);
      return defaultValue;
    }
    console.error(`Error reading ${filePath}:`, err.message);
    throw err;
  }
};

// Utility: Write JSON File
const writeJsonFile = async (filePath, data) => {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Error writing to ${filePath}:`, err.message);
    throw err;
  }
};

// Serve the homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ✅ API: Store Certificates
app.post("/api/certificates", async (req, res) => {
  try {
    const { certId, userName, issueDate, validity, studentId } = req.body;
    const newCertificate = { certId, userName, issueDate, validity, studentId };

    let certificates = await readJsonFile(certificatesJsonFilePath);
    certificates.push(newCertificate);
    await writeJsonFile(certificatesJsonFilePath, certificates);

    res.status(201).json({ message: "Certificate stored successfully!" });
  } catch (err) {
    console.error("Error storing certificate:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ API: Verify Certificate
app.get("/api/certificates/:certId", async (req, res) => {
  try {
    const { certId } = req.params;
    const certificates = await readJsonFile(certificatesJsonFilePath);
    const certificate = certificates.find(cert => cert.certId === certId);

    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found!" });
    }

    res.status(200).json(certificate);
  } catch (err) {
    console.error("Error fetching certificate:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ API: Fetch Student IDs
app.get("/api/student-ids", async (req, res) => {
  try {
    const studentsData = await readJsonFile(studentsJsonFilePath, { validStudentIds: [] });
    res.json(studentsData);
  } catch (error) {
    console.error("Error reading student IDs:", error.message);
    res.status(500).json({ message: "Error reading student IDs." });
  }
});

// ✅ API: Add Student ID
app.post("/add-student", async (req, res) => {
  const { studentId } = req.body;

  if (!studentId || !/^[a-zA-Z0-9]+$/.test(studentId)) {
    return res.status(400).json({ message: "Invalid Student ID." });
  }

  try {
    let studentsData = await readJsonFile(studentsJsonFilePath, { validStudentIds: [] });

    if (!studentsData.validStudentIds.includes(studentId)) {
      studentsData.validStudentIds.push(studentId);
      await writeJsonFile(studentsJsonFilePath, studentsData);
      return res.json({ message: `Student ID ${studentId} added successfully!` });
    }

    res.json({ message: `Student ID ${studentId} already exists.` });
  } catch (error) {
    console.error("Error adding student ID:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// ✅ API: Delete Student ID
app.delete("/delete-student", async (req, res) => {
  const { studentId } = req.body;

  if (!studentId) {
    return res.status(400).json({ message: "Student ID is required." });
  }

  try {
    let studentsData = await readJsonFile(studentsJsonFilePath, { validStudentIds: [] });
    const updatedStudentIds = studentsData.validStudentIds.filter(id => id !== studentId);

    if (updatedStudentIds.length === studentsData.validStudentIds.length) {
      return res.status(404).json({ message: "Student ID not found." });
    }

    studentsData.validStudentIds = updatedStudentIds;
    await writeJsonFile(studentsJsonFilePath, studentsData);
    res.json({ message: `Student ID ${studentId} deleted successfully!` });
  } catch (error) {
    console.error("Error deleting student ID:", error.message);
    res.status(500).json({ message: "Error deleting student ID." });
  }
});

// ✅ API: Update Student Status
app.post("/update-student-status", async (req, res) => {
  const { studentId, status } = req.body;

  if (!studentId || !["complete", "incomplete"].includes(status)) {
    return res.status(400).json({ message: "Invalid student ID or status." });
  }

  try {
    let studentsData = await readJsonFile(studentStatusJsonFilePath, []);
    const studentIndex = studentsData.findIndex(student => student.studentId === studentId);

    if (studentIndex !== -1) {
      studentsData[studentIndex].status = status;
    } else {
      studentsData.push({ studentId, status });
    }

    await writeJsonFile(studentStatusJsonFilePath, studentsData);
    res.json({ message: `Student ID ${studentId} status updated to ${status}!` });
  } catch (error) {
    console.error("Error updating student status:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// Serve Static Files
app.use(express.static(path.join(__dirname, "public")));

// Start the Server (For Local Use Only)
if (process.env.NODE_ENV !== "vercel") {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
}

// Export for Vercel (Serverless)
module.exports = app;
module.exports.handler = serverless(app);
