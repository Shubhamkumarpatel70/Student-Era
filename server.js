const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs").promises;
const path = require("path");

// Create the Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all routes
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// JSON file paths
const studentsJsonFilePath = "lundi sutri kuch bhi/generatedstudentidofregisteredstudentatstudenterastudentid.json";
const certificatesJsonFilePath = "lundi sutri kuch bhi/userrandomstudenteracheckcertificates.json";
const studentStatusJsonFilePath = "lundi sutri kuch bhi/checkprogressofinternshipofusersinternshipprogress.json";
const studentCertificatesFile = "lundi sutri kuch bhi/progressreportuserofinternshipscompletedinternship.json";
const studentProjectsJsonFilePath = "lundi sutri kuch bhi/userselffetchtheirprojectsofapplieddomainuserprojects.json";
const internshipDomainsJsonFilePath = "lundi sutri kuch bhi/internshipdomains.json"; // New JSON file for internship domains

// Utility function to read JSON file
const readJsonFile = async (filePath, defaultValue = []) => {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    if (err.code === "ENOENT") {
      console.log(`${filePath} not found, initializing empty data.`);
      return defaultValue;
    }
    throw new Error(`Error reading ${filePath}: ${err.message}`);
  }
};

// Utility function to write JSON file
const writeJsonFile = async (filePath, data) => {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    throw new Error(`Error writing to ${filePath}: ${err.message}`);
  }
};

// ==================== APIs ====================

// Serve the root HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Serve static files
app.use(express.static(path.join(__dirname)));

// ==================== Student ID APIs ====================

// Fetch all student IDs
app.get("/api/student-ids", async (req, res) => {
  try {
    const studentsData = await readJsonFile(studentsJsonFilePath, { validStudentIds: [] });
    res.json(studentsData);
  } catch (error) {
    res.status(500).json({ message: "Error reading student IDs." });
  }
});

// Fetch all student statuses
app.get("/api/student-status", async (req, res) => {
  try {
    const studentStatuses = await readJsonFile("lundi sutri kuch bhi/checkprogressofinternshipofusersinternshipprogress.json", []);
    res.json(studentStatuses);
  } catch (error) {
    res.status(500).json({ message: "Error reading student statuses." });
  }
});

// Add a new student ID
app.post("/add-student", async (req, res) => {
  const { studentId } = req.body;
  if (!studentId || !/^[a-zA-Z0-9]+$/.test(studentId)) {
    return res.status(400).json({ message: "Invalid Student ID. Only alphanumeric IDs allowed." });
  }

  try {
    const studentsData = await readJsonFile(studentsJsonFilePath, { validStudentIds: [] });
    if (!studentsData.validStudentIds.includes(studentId)) {
      studentsData.validStudentIds.push(studentId);
      await writeJsonFile(studentsJsonFilePath, studentsData);
      return res.json({ message: `Student ID ${studentId} added successfully!` });
    }
    res.json({ message: `Student ID ${studentId} already exists.` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a student ID
app.delete("/delete-student", async (req, res) => {
  const { studentId } = req.body;

  if (!studentId) {
    return res.status(400).json({ success: false, message: "Student ID is required" });
  }

  try {
    let studentsData = await readJsonFile(studentsJsonFilePath, { validStudentIds: [] });

    // Filter out the student ID
    const updatedStudentIds = studentsData.validStudentIds.filter(id => id !== studentId);

    if (updatedStudentIds.length === studentsData.validStudentIds.length) {
      return res.status(404).json({ success: false, message: "Student ID not found" });
    }

    // Write updated list back to the file
    studentsData.validStudentIds = updatedStudentIds;
    await writeJsonFile(studentsJsonFilePath, studentsData);

    res.json({ success: true, message: `Student ID ${studentId} deleted successfully!` });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting student ID." });
  }
});

// ==================== Certificate APIs ====================

// Fetch all certificates
app.get("/api/certificate-numbers", async (req, res) => {
  try {
    const certificatesData = await readJsonFile(certificatesJsonFilePath, []);
    res.json(certificatesData);
  } catch (error) {
    res.status(500).json({ message: "Error reading certificate numbers." });
  }
});

// Add a new certificate
app.post("/add-certificate", async (req, res) => {
  const { certificateNumber, name, course, duration, college, issuedDate, studentId } = req.body;
  if (!certificateNumber || !name || !course || !duration || !college || !issuedDate || !studentId) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const certificatesData = await readJsonFile(certificatesJsonFilePath, []);
    certificatesData.push({ certificateNumber, name, course, duration, college, issuedDate, studentId });
    await writeJsonFile(certificatesJsonFilePath, certificatesData);
    res.json({ message: `Certificate for ${name} added successfully!` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Edit a certificate number
app.put("/edit-certificate-number", async (req, res) => {
  const { oldCertificateNumber, newCertificateNumber } = req.body;

  if (!oldCertificateNumber || !newCertificateNumber) {
    return res.status(400).json({ success: false, message: "Both old and new certificate numbers are required" });
  }

  try {
    let certificates = await readJsonFile(certificatesJsonFilePath, []);
    const certificateIndex = certificates.findIndex(cert => cert.certificateNumber === oldCertificateNumber);

    if (certificateIndex === -1) {
      return res.status(404).json({ success: false, message: "Certificate number not found" });
    }

    certificates[certificateIndex].certificateNumber = newCertificateNumber;
    await writeJsonFile(certificatesJsonFilePath, certificates);

    res.json({ success: true, message: "Certificate number updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating certificate number" });
  }
});

// Delete a certificate
app.delete("/delete-certificate", async (req, res) => {
  const { certificateNumber } = req.body;

  if (!certificateNumber) {
    return res.status(400).json({ success: false, message: "Certificate number is required" });
  }

  try {
    let certificates = await readJsonFile(certificatesJsonFilePath, []);
    const updatedCertificates = certificates.filter(cert => cert.certificateNumber !== certificateNumber);

    if (updatedCertificates.length === certificates.length) {
      return res.status(404).json({ success: false, message: "Certificate number not found" });
    }

    await writeJsonFile(certificatesJsonFilePath, updatedCertificates);
    res.json({ success: true, message: "Certificate deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting certificate" });
  }
});

// ==================== Internship Domain APIs ====================

// Fetch all internship domains
app.get("/api/internship-domains", async (req, res) => {
  try {
    const internshipDomains = await readJsonFile("lundi sutri kuch bhi/userselffetchtheirprojectsofapplieddomainuserprojects.json", []);
    res.json(internshipDomains);
  } catch (error) {
    res.status(500).json({ message: "Error reading internship domains." });
  }
});

// Fetch internship domain by domain name or student ID
app.get("/api/internship-domain", async (req, res) => {
  const { domain, studentId } = req.query;

  try {
    const internshipDomains = await readJsonFile(internshipDomainsJsonFilePath, []);

    if (domain) {
      const domainDetails = internshipDomains.find(d => d.internshipDomain.toLowerCase() === domain.toLowerCase());
      if (!domainDetails) {
        return res.status(404).json({ message: "Internship domain not found." });
      }
      return res.json(domainDetails);
    }

    if (studentId) {
      const studentDomains = internshipDomains.filter(d => d.studentIds.includes(studentId));
      if (studentDomains.length === 0) {
        return res.status(404).json({ message: "No internship domains found for the given student ID." });
      }
      return res.json(studentDomains);
    }

    res.status(400).json({ message: "Please provide either a domain name or a student ID." });
  } catch (error) {
    res.status(500).json({ message: "Error fetching internship domain details." });
  }
});

// Add a new internship domain
app.post("/api/add-internship-domain", async (req, res) => {
  const { internshipDomain, studentIds, pdfFile } = req.body;

  if (!internshipDomain || !studentIds || !pdfFile) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const internshipDomains = await readJsonFile(internshipDomainsJsonFilePath, []);
    internshipDomains.push({ internshipDomain, studentIds, pdfFile });
    await writeJsonFile(internshipDomainsJsonFilePath, internshipDomains);
    res.json({ success: true, message: "Internship domain added successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error adding internship domain." });
  }
});

// ==================== Task APIs ====================

// Fetch all tasks
app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await readJsonFile(studentProjectsJsonFilePath, []);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error reading tasks." });
  }
});

// Add a new task
app.post("/add-task", async (req, res) => {
  const { taskId, taskName, assignedTo, status } = req.body;

  if (!taskId || !taskName || !assignedTo || !status) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const tasks = await readJsonFile(studentProjectsJsonFilePath, []);
    tasks.push({ taskId, taskName, assignedTo, status });
    await writeJsonFile(studentProjectsJsonFilePath, tasks);
    res.json({ message: `Task ${taskName} added successfully!` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Edit a task
app.put("/edit-task", async (req, res) => {
  const { taskId, updatedDetails } = req.body;

  if (!taskId || !updatedDetails) {
    return res.status(400).json({ success: false, message: "Task ID and updated details are required" });
  }

  try {
    let tasks = await readJsonFile(studentProjectsJsonFilePath, []);
    const taskIndex = tasks.findIndex(task => task.taskId === taskId);

    if (taskIndex === -1) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    tasks[taskIndex] = { ...tasks[taskIndex], ...updatedDetails };
    await writeJsonFile(studentProjectsJsonFilePath, tasks);

    res.json({ success: true, message: "Task updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating task" });
  }
});

// Delete a task
app.delete("/delete-task", async (req, res) => {
  const { taskId } = req.body;

  if (!taskId) {
    return res.status(400).json({ success: false, message: "Task ID is required" });
  }

  try {
    let tasks = await readJsonFile(studentProjectsJsonFilePath, []);
    const updatedTasks = tasks.filter(task => task.taskId !== taskId);

    if (updatedTasks.length === tasks.length) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    await writeJsonFile(studentProjectsJsonFilePath, updatedTasks);
    res.json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting task" });
  }
});

// ==================== Start the Server ====================
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});