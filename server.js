const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require('fs').promises;
const path = require('path');

// Create the Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all routes
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// JSON file paths
const studentsJsonFilePath = 'lundi sutri kuch bhi/generatedstudentidofregisteredstudentatstudenterastudentid.json';
const certificatesJsonFilePath = 'lundi sutri kuch bhi/userrandomstudenteracheckcertificates.json';
const studentStatusJsonFilePath = 'lundi sutri kuch bhi/checkprogressofinternshipofusersinternshipprogress.json';
const studentCertificatesFile = 'lundi sutri kuch bhi/progressreportuserofinternshipscompletedinternship.json';
const studentProjectsJsonFilePath = 'lundi sutri kuch bhi/userselffetchtheirprojectsofapplieddomainuserprojects.json';

// Utility function to read JSON file
const readJsonFile = async (filePath, defaultValue = []) => {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
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

// API to store certificates in MongoDB
app.post("/api/certificates", async (req, res) => {
  try {
    const { certId, userName, issueDate, validity, studentId } = req.body;
    const newCertificate = new Certificate({ certId, userName, issueDate, validity, studentId });
    await newCertificate.save();
    res.status(201).json({ message: "Certificate stored successfully!" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// API to verify certificates in MongoDB
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

// API to fetch student IDs from students.json
app.get('/generatedstudentidofregisteredstudentatstudenterastudentid', async (req, res) => {
  try {
    const studentsData = await readJsonFile(studentsJsonFilePath, { validStudentIds: [] });
    res.json({ students: studentsData.validStudentIds });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error reading students file." });
  }
});

// Serve the generated student ID JSON file
app.get('/api/student-ids', async (req, res) => {
  try {
    const studentsData = await readJsonFile(studentsJsonFilePath, { validStudentIds: [] });
    res.json(studentsData);
  } catch (error) {
    res.status(500).json({ message: "Error reading student IDs." });
  }
});

// API to add student ID
app.post('/add-student', async (req, res) => {
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

// API to delete student ID
app.delete('/delete-student', async (req, res) => {
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

// API to add certificate details
app.post('/add-certificate', async (req, res) => {
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

// API to save generated certificate numbers
app.post('/save-certificate', async (req, res) => {
  const { studentId, certificateNumber } = req.body;

  if (!studentId || !certificateNumber) {
    return res.status(400).json({ success: false, message: 'Missing studentId or certificateNumber' });
  }

  try {
    let certificates = await readJsonFile(studentCertificatesFile, []);
    const existingCertificate = certificates.find(cert => cert.certificateNumber === certificateNumber);
    if (existingCertificate) {
      return res.status(400).json({ success: false, message: 'Certificate number already exists' });
    }

    certificates.push({ studentId, certificateNumber });
    await writeJsonFile(studentCertificatesFile, certificates);

    res.json({ success: true, message: 'Certificate saved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error saving certificate' });
  }
});

// API to update student status
app.post('/update-student-status', async (req, res) => {
  const { studentId, status } = req.body;
  if (!studentId || !['complete', 'incomplete'].includes(status)) {
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
    res.status(500).json({ message: error.message });
  }
});

// API to save generated certificate numbers
app.post('/progressreportuserofinternshipscompletedinternship', async (req, res) => {
  const { studentId, certificateNumber } = req.body;

  if (!studentId || !certificateNumber) {
      return res.status(400).json({ success: false, message: 'Missing studentId or certificateNumber' });
  }

  try {
      let certificates = await readJsonFile(studentCertificatesFile, []);
      const existingCertificate = certificates.find(cert => cert.certificateNumber === certificateNumber);
      if (existingCertificate) {
          return res.status(400).json({ success: false, message: 'Certificate number already exists' });
      }

      certificates.push({ studentId, certificateNumber });
      await writeJsonFile(studentCertificatesFile, certificates);

      res.json({ success: true, message: 'Certificate saved successfully' });
  } catch (error) {
      res.status(500).json({ success: false, message: 'Error saving certificate' });
  }
});

// Route to handle adding a student ID to a specific internship domain
app.post('/addStudent', async (req, res) => {
  const { studentId, course } = req.body;

  if (!studentId || !course) {
    return res.status(400).json({ success: false, message: 'Error: Missing studentId or course' });
  }

  try {
    let studentProjects = await readJsonFile(studentProjectsJsonFilePath, []);
    const domain = studentProjects.find(item => item.internshipDomain === course);

    if (domain) {
      if (!domain.studentIds.includes(studentId)) {
        domain.studentIds.push(studentId);
        await writeJsonFile(studentProjectsJsonFilePath, studentProjects);
        return res.json({ success: true, message: 'Student ID added successfully' });
      }
      return res.status(400).json({ success: false, message: 'Error: Student ID already exists in this domain' });
    }

    return res.status(400).json({ success: false, message: 'Error: Course not found' });
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ success: false, message: 'Error processing request' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});