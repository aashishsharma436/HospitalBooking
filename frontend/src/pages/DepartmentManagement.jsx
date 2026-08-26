import { useEffect, useState } from "react";
import api from "../api";
import "../css/departmentmanagement.css";

function DepartmentManagement() {
  const [departments, setDepartments] = useState([]);
  const [departmentName, setDepartmentName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await api.get("/departments/");

      console.log("DEPARTMENTS RESPONSE:", response.data);

      setDepartments(response.data.departments || []);
    } catch (error) {
      console.error("FETCH DEPARTMENTS ERROR:", error);

      if (error.response) {
        setMessage(
          error.response.data?.detail ||
            "Departments load nahi ho paaye."
        );
      } else {
        setMessage("Server se connect nahi ho pa raha.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Add department
  const handleAddDepartment = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!departmentName.trim()) {
      setMessage("Department name enter karo.");
      return;
    }

    try {
      const response = await api.post("/departments/", {
        department_name: departmentName.trim(),
        description: description.trim() || null,
      });

      console.log(
        "ADD DEPARTMENT RESPONSE:",
        response.data
      );

      setDepartmentName("");
      setDescription("");

      setMessage(
        "Department successfully add ho gaya."
      );

      fetchDepartments();
    } catch (error) {
      console.error(
        "ADD DEPARTMENT ERROR:",
        error
      );

      if (error.response) {
        setMessage(
          error.response.data?.detail ||
            "Department add nahi ho paaya."
        );
      } else {
        setMessage("Server se connect nahi ho pa raha.");
      }
    }
  };

  return (
    <div className="department-management">

      {/* Header */}
      <div className="department-management-header">
        <div>
          <h1>Department Management</h1>

          <p>
            Hospital ke departments manage karein
          </p>
        </div>

        <button
          className="department-refresh-btn"
          onClick={fetchDepartments}
        >
          Refresh
        </button>
      </div>

      {/* Add Department */}
      <div className="department-card">

        <h2>Add Department</h2>

        <form
          onSubmit={handleAddDepartment}
          className="department-form"
        >

          <div className="department-form-group">

            <label>
              Department Name
            </label>

            <input
              type="text"
              placeholder="e.g. Cardiology"
              value={departmentName}
              onChange={(e) =>
                setDepartmentName(e.target.value)
              }
            />

          </div>

          <div className="department-form-group">

            <label>
              Description
            </label>

            <textarea
              placeholder="Department description"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
            />

          </div>

          <button
            type="submit"
            className="add-department-btn"
          >
            Add Department
          </button>

        </form>

        {message && (
          <div className="department-message">
            {message}
          </div>
        )}

      </div>

      {/* Department List */}
      <div className="department-card">

        <div className="department-list-header">

          <div>
            <h2>Departments</h2>

            <p>
              {departments.length} active departments
            </p>
          </div>

          <button
            className="department-refresh-btn"
            onClick={fetchDepartments}
          >
            Refresh
          </button>

        </div>

        {loading ? (

          <p className="department-loading">
            Loading departments...
          </p>

        ) : departments.length === 0 ? (

          <p className="department-empty">
            Abhi koi department available nahi hai.
          </p>

        ) : (

          <div className="department-list">

            {departments.map((department) => (

              <div
                className="department-item"
                key={department.department_id}
              >

                <div>

                  <h3>
                    {department.department_name}
                  </h3>

                  <p>
                    {department.description ||
                      "No description available"}
                  </p>

                  <span>
                    ID: {department.department_id}
                  </span>

                </div>

                <span className="active-badge">
                  Active
                </span>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}

export default DepartmentManagement;