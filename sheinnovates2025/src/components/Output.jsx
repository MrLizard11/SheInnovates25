import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "./NavBar";
import axios from "axios";

function Output() {
  const navigate = useNavigate();
  const location = useLocation(); // Use location to access state passed from Input.jsx

  const expectedSalary = location.state ? location.state.expectedSalary : null; // Get expected salary from state
  const [processedResume, setProcessedResume] = useState(""); // State to hold extracted resume
  const [medianSalary, setMedianSalary] = useState(""); // State for median salary
  const [resumeID, setResumeID] = useState("");

  // Format a number with commas (can be reused for median salary)
  const formatNumber = (num) => {
    // Check if the input is a valid number before formatting
    if (typeof num === 'number' && !isNaN(num)) {
      return new Intl.NumberFormat().format(num);
    }
    // Return the original value if it's not a number (e.g., error messages)
    return num;
  };

  // Format the expected salary
  const formattedSalary = expectedSalary ? formatNumber(expectedSalary) : null;

  // Generate a random resume ID
  const generateResumeID = () => {
    return Math.floor(Math.random() * 1000000000); // Generates a random ID
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
          // Consider moving API key and AI logic to a separate service/hook for better security and organization
          const { GoogleGenerativeAI } = require("@google/generative-ai");
          // IMPORTANT: Avoid hardcoding API keys directly in the frontend code.
          // Use environment variables instead.
          const genAI = new GoogleGenerativeAI(
            process.env.REACT_APP_GEMINI_API_KEY || "YOUR_FALLBACK_API_KEY" // Example using environment variable
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
        // Assuming a request to get median salary from your backend
        const response = await axios.get(
          "http://127.0.0.1:5000/get-median-salary" // Replace with your actual endpoint if different
        );
        // Ensure the backend sends a number for medianSalary if available
        setMedianSalary(
          response.data.medianSalary !== undefined && response.data.medianSalary !== null
            ? response.data.medianSalary
            : "No median salary data available"
        );
      } catch (error) {
        console.error("Error fetching median salary:", error);
        setMedianSalary("Failed to fetch median salary data");
      }
    };

    fetchResumeData();
    fetchMedianSalary();
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <div className="bg-orange-500 text-blue-600 min-h-screen pb-10"> {/* Added min-h-screen and pb-10 for better spacing */}
      <Navbar />
      <div id="title_div" className="text-center pt-6 pb-4"> {/* Added padding */}
        <h1 className="text-3xl font-bold">
          Tailored Resume and Expected Salary
        </h1>
        <hr className="w-4/5 mx-auto h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 border-0 rounded-full shadow-lg mt-2" /> {/* Centered and adjusted width */}
      </div>
      <div
        id="summary"
        className="border-2 border-blue-500 bg-white text-gray-800 p-4 w-11/12 md:w-3/4 lg:w-2/3 rounded-lg shadow-md mx-auto my-6" // Adjusted width, added background, text color, padding, shadow, margin
        dangerouslySetInnerHTML={{
          __html: processedResume
            ? formatResumeText(processedResume)
            : "Loading...",
        }}
      />

      {/* Expected Salary Section */}
      <div id="expected_salary_div" className="text-center mt-8">
        <h3 className="text-lg font-semibold mb-2">Expected Salary</h3>
        <div
          id="salary"
          className="border-2 border-blue-500 bg-white text-gray-800 p-3 w-2/3 sm:w-1/3 rounded-lg shadow-sm mx-auto" // Added background, text color, adjusted padding/shadow
        >
          {formattedSalary ? `$${formattedSalary}` : "No salary data available"}
        </div>
      </div>

      {/* --- Median Salary Section --- */}
      <div id="median_salary_div" className="text-center mt-6"> {/* Added margin-top */}
        <h3 className="text-lg font-semibold mb-2">Median Salary (Based on Role/Location - Placeholder)</h3> {/* Added placeholder text */}
        <div
          id="median_salary"
          className="border-2 border-blue-500 bg-white text-gray-800 p-3 w-2/3 sm:w-1/3 rounded-lg shadow-sm mx-auto" // Consistent styling
        >
          {/* Format medianSalary if it's a number, otherwise display the string */}
          {typeof medianSalary === 'number'
            ? `$${formatNumber(medianSalary)}`
            : medianSalary}
        </div>
      </div>
      {/* --- End Median Salary Section --- */}


      {/* Resume ID Section */}
      <div id="id_div" className="text-center mt-6"> {/* Adjusted margin-top */}
        <h3 className="text-lg font-semibold mb-2">Resume ID</h3>
        <div
          id="id"
          className="border-2 border-blue-500 bg-white text-gray-800 p-3 w-2/3 sm:w-1/3 rounded-lg shadow-sm mx-auto" // Consistent styling
        >
          {resumeID}
        </div>
      </div>

      <div id="back" className="text-center mt-10"> {/* Increased margin-top */}
        <button
          onClick={() => navigate("/")}
          className="inline-block py-3 px-8 text-lg font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75" // Added focus styles
        >
          Return to Main Page
        </button>
      </div>
    </div>
  );
}

export default Output;
