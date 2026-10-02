/**
 * AddLeadForm — form to create a new lead.
 * Validates input client-side, shows API errors, and calls onLeadCreated
 * so the parent component can update the table without a page reload.
 */

import { FormEvent, useState } from "react";
import apiClient from "../api/client";

interface AddLeadFormProps {
  onLeadCreated: () => void;
}

export default function AddLeadForm({ onLeadCreated }: AddLeadFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    website: "",
    status: "new",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Client-side validation
    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setError("Valid email is required");
      return;
    }
    if (!formData.company.trim()) {
      setError("Company is required");
      return;
    }

    setLoading(true);

    try {
      await apiClient.post("/api/leads/", {
        ...formData,
        website: formData.website || null,
      });
      setSuccess(true);
      setFormData({ name: "", email: "", company: "", website: "", status: "new" });
      onLeadCreated(); // Refresh the table
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as { response?: { data?: { error?: string } } }).response?.data?.error
      ) {
        setError(
          (err as { response: { data: { error: string } } }).response.data.error
        );
      } else {
        setError("Failed to create lead. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="add-lead-form" onSubmit={handleSubmit}>
      <h3>Add New Lead</h3>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Lead created successfully!</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        <div className="form-group">
          <label htmlFor="lead-name">Name *</label>
          <input
            id="lead-name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Contact name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="lead-email">Email *</label>
          <input
            id="lead-email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="contact@company.com"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="lead-company">Company *</label>
          <input
            id="lead-company"
            type="text"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            placeholder="Company name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="lead-website">Website</label>
          <input
            id="lead-website"
            type="url"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            placeholder="https://example.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="lead-status">Status</label>
          <select
            id="lead-status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="lost">Lost</option>
          </select>
        </div>
      </div>

      <button className="btn btn-primary" type="submit" disabled={loading}>
        {loading ? "Creating..." : "Add Lead"}
      </button>
    </form>
  );
}
