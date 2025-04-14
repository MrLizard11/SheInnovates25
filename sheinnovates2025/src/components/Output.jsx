import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "./NavBar";
import axios from "axios";

function Output() {
  const navigate = useNavigate();
  const location = useLocation(); // Use location to access state passed from Input.jsx

  const expectedSalary = location.state ? location.state.expectedSalary : null; // Get expected salary from state
  const [processedResume, setProcessedResume] = useState(""); // State to hold extracted resume
  //const [medianSalary, setMedianSalary] = useState(""); // State for median salary
  const [resumeID, setResumeID] = useState("");

  // Format the expected salary with commas
  const formattedSalary = expectedSalary
    ? new Intl.NumberFormat().format(expectedSalary)
    : null;

  // Generate a random resume ID
  const generateResumeID = () => {
    return Math.floor(Math.random() * 1000000000); // Generates a random ID like RES-123456789
  };

  const formatResumeText = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<br/><br/><strong>$1</strong><br/><br/>") // Handles double asterisks
      .replace(/\n\* /g, "<br/>• ") // Handles bullet points starting with "* " at the beginning of a line
      .replace(/\* /g, "<br/>• "); // Handles single asterisks with a space after
  };

  useEffect(() => {
    // Set the random resume ID when the component mounts
    setResumeID(generateResumeID());

    // Fetch the extracted resume text from the backend
    const fetchResumeData = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:5000/get-extracted-text"
        );
        if (response.data.extracted_text) {
          //setProcessedResume(response.data.extracted_text);
          const { GoogleGenerativeAI } = require("@google/generative-ai");
          const genAI = new GoogleGenerativeAI(
            "AIzaSyDxQ2Dlk1ld9TUEbTX5-qxdMntqbj6qMP8"
          );
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
          const prompt =
            "Resume Content: " +
            response.data.extracted_text +
            " Print the Resume Content WITHOUT any demographic bias. So, no name, or sex, or ethnicity, or anything that could bias the interviewer.";
          const result = await model.generateContent(prompt);
          setProcessedResume(result.response.text());
        } else {
          setProcessedResume("Loading...");
        }
      } catch (error) {
        console.error("Error fetching extracted text:", error);
        setProcessedResume("Failed to fetch resume data");
      }
    };

    // Fetch median salary data
    const fetchMedianSalary = async () => {
      try {
        // Assuming a request to get median salary from your backend, replace with actual endpoint
        const response = await axios.get(
          "http://127.0.0.1:5000/get-median-salary"
        );
        setMedianSalary(
          response.data.medianSalary || "No median salary data available"
        );
      } catch (error) {
        console.error("Error fetching median salary:", error);
        setMedianSalary("Failed to fetch median salary data");
      }
    };

    fetchResumeData();
    fetchMedianSalary();
  }, []);

  return (
    <div className="bg-orange-500 text-blue-600">
      <Navbar />
      <div id="title_div" className="text-center">
        <h1 className="text-3xl font-bold">
          Tailored Resume and Expected Salary
        </h1>
        <hr className="w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 border-0 rounded-full shadow-lg" />
      </div>
      <div
        id="summary"
        className="border-2 border-blue-500 text-white p-2 w-full sm:w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-300 mx-auto"
        dangerouslySetInnerHTML={{
          __html: processedResume
            ? formatResumeText(processedResume)
            : "Loading...",
        }}
      />

      {/* Expected Salary Section */}
      <div id="median_salary_div" className="text-center mt-8">
        <h3 className="text-lg font-semibold mb-4">Median Salary</h3>
        <div
          id="median_salary"
          className="border-2 border-blue-500 p-2 w-2/3 sm:w-1/3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-300 mx-auto"
          readOnly // Make median salary non-editable
        >
          {medianSalary ? `$${medianSalary}` : "No median salary data available"}
        </div>
      </div>

      {/* Resume ID Section */}
      <div id="id_div" className="text-center mt-8">
        <h3 className="text-lg font-semibold mb-4">Resume ID</h3>
        <div
          id="id"
          className="border-2 border-blue-500 p-2 w-2/3 sm:w-1/3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-300 mx-auto"
          readOnly // Make resume ID non-editable
        >
          {resumeID}
        </div>
      </div>

      <div id="back" className="text-center mt-8">
        <button
          onClick={() => navigate("/")}
          className="inline-block py-3 px-8 text-lg font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 shadow-lg transform hover:scale-105"
        >
          Return to Main Page
        </button>
      </div>
    </div>
  );
}

export default Output;
