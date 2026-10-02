/**
 * MemberDashboard — shows the member's own leads and an "Add Lead" form.
 */

import { useCallback, useEffect, useState } from "react";
import apiClient from "../api/client";
import AddLeadForm from "../components/AddLeadForm";
import Header from "../components/Header";
import LeadsTable from "../components/LeadsTable";
import Modal from "../components/Modal";

interface Lead {
  id: number;
  name: string;
  email: string;
  company: string;
  website: string | null;
  status: string;
  created_at: string;
}

export default function MemberDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [activeTab, setActiveTab] = useState<"leads">("leads");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get("/api/leads/", {
        params: { page, search, status: statusFilter }
      });
      const data = res.data;
      if (data && data.results) {
        setLeads(data.results);
        setTotalPages(Math.ceil((data.count || 0) / 10));
      } else {
        setLeads(Array.isArray(data) ? data : []);
        setTotalPages(1);
      }
    } catch {
      setError("Failed to load leads. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  return (
    <div className="dashboard">
      <Header />
      <main className="dashboard-content">
        {/* Nav Tabs are no longer needed since it's just one view, but keeping the layout for consistency */}
        <div className="nav-tabs">
          <button 
            className="nav-tab active"
          >
            My Leads
          </button>
        </div>

        <section>
          <div className="filters-bar">
            <input 
              type="text" 
              placeholder="Search leads..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="lost">Lost</option>
            </select>
            <button 
              className="btn btn-primary" 
              onClick={() => setIsAddModalOpen(true)}
              style={{ whiteSpace: "nowrap" }}
            >
              + New Lead
            </button>
          </div>

          <LeadsTable 
            leads={leads} 
            loading={loading} 
            error={error} 
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </section>

        <Modal 
          title="Create New Lead" 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)}
        >
          <AddLeadForm onLeadCreated={() => {
            fetchLeads();
            setIsAddModalOpen(false);
          }} />
        </Modal>
      </main>
    </div>
  );
}
