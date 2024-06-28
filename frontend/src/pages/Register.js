/*import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "", fullName: "" });
  const [error, setError] = useState("");

  // Function to handle user registration
  const register = async () => {
    try {
      const response = await fetch("http://localhost:4000/register", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();

      if (data.success) {
        navigate("/login");
      } else if (data.error) {
        setError(data.error);
      } else {
        setError("Something went wrong.");
      }
    } catch (error) {
      console.error("Error registering:", error);
      setError("An error occurred. Please try again.");
    }
  };

  // Function to handle form input changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  return (
    <main className="flex flex-col gap-6 px-24 py-8">
      <h2 className="text-2xl font-semibold">Register</h2>
      <p>Register a new account!</p>
      {error && <p className="bg-red-500 text-white p-4 rounded-xl">{error}</p>}
      <input
        name="email"
        value={formData.email}
        onChange={handleFormChange}
        placeholder="Email"
        type="email"
        className="border-2 border-gray-200 p-2 rounded-xl"
      />
      <input
        name="password"
        value={formData.password}
        onChange={handleFormChange}
        placeholder="Password"
        type="password"
        className="border-2 border-gray-200 p-2 rounded-xl"
      />
      <input
        name="fullName"
        value={formData.fullName}
        onChange={handleFormChange}
        placeholder="Full Name"
        type="text"
        className="border-2 border-gray-200 p-2 rounded-xl"
      />
      <button onClick={register} className="bg-black text-white p-2 rounded-xl">
        Register now!
      </button>
    </main>
  );
}*/