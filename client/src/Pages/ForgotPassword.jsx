import { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify'; // Import ToastContainer and toast
import 'react-toastify/dist/ReactToastify.css'; // Import the CSS for toast notifications
import './styles/ForgotPass.css'
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [username, setUsername] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [stage, setStage] = useState("username");
  const [loading, setLoading] = useState(false); // Add loading state

  const handleUsernameChange = (e) => setUsername(e.target.value);
  const handleSecurityAnswerChange = (e) => setSecurityAnswer(e.target.value);
  const handleNewPasswordChange = (e) => setNewPassword(e.target.value);
  const handleConfirmPasswordChange = (e) => setConfirmPassword(e.target.value);

  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading true
    try {
      const response = await axios.post("http://localhost:8800/forgot-password", { username });
      if (response.status === 200) {
        setSecurityQuestion(response.data.question);
        setStage("securityQuestion");
      } else {
        toast.error(response.data.error); // Show toast on error
      }
    } catch (err) {
      console.error(err);
      toast.error("Invalid username");
    } finally {
      setLoading(false); // Set loading false
    }
  };

  const handleSecurityQuestionSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading true
    try {
      const response = await axios.post("http://localhost:8800/verify-answer", {
        username,
        answer: securityAnswer
      });
      if (response.status === 200) {
        setStage("passwordReset");
      } else {
        toast.error(response.data.error); // Show toast on error
      }
    } catch (err) {
      console.error(err);
      toast.error("Invalid answer");
    } finally {
      setLoading(false); // Set loading false
    }
  };

  const handlePasswordResetSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading true
    if (newPassword !== confirmPassword) {
      toast.error("Password did not match");
      setLoading(false); // Set loading false
      return;
    }

    try {
      const response = await axios.post("http://localhost:8800/reset-password", {
        username,
        securityAnswer, // Send security answer to server for verification
        newPassword
      });
      if (response.status === 200) {
        toast.success("Password successfully reset.");
        setStage("username");
      } else {
        console.error(response.data.error); 
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="forgot-pass-container">
      {stage === "username" && (
        <form onSubmit={handleUsernameSubmit} className="forgot-pass-form">
          <h3>Forgot Password</h3>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={handleUsernameChange}
            required
          />
          <button type="submit" disabled={loading} className="btn--forgot">
            {loading ? "Loading..." : "Submit"}
          </button>
          <Link className="link-to-login" to={'/'}>Login here</Link>
        </form>
      )}

      {stage === "securityQuestion" && (
        <form onSubmit={handleSecurityQuestionSubmit} className="security-question-form">
          <h3>Security Question</h3>
          <p className="question">{securityQuestion}</p>
          <input
          className="fp--input"
            type="text"
            placeholder="Enter your answer"
            value={securityAnswer}
            onChange={handleSecurityAnswerChange}
            required
          />
          <button type="submit" disabled={loading} className="btn--forgot">
            {loading ? "Loading..." : "Submit"}
          </button>
        </form>
      )}

      {stage === "passwordReset" && (
        <form onSubmit={handlePasswordResetSubmit} className="password-reset-form">
          <h3>Reset Password</h3>
          <input
            className="fp--input"
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={handleNewPasswordChange}
            required
          />
          <input
          className="fp--input"
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            required
          />
          <button type="submit" disabled={loading} className="btn--forgot">
            {loading ? "Loading..." : "Submit"}
          </button>
        </form>
      )}

      <ToastContainer/>
    </div>
  );
}
