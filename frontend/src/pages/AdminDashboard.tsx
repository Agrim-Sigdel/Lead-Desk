/**
 * AdminDashboard — shows all leads (with owner column) and all users.
 */

import { useEffect, useState } from "react";
import apiClient from "../api/client";
import Header from "../components/Header";
import LeadsTable from "../components/LeadsTable";
import UsersTable from "../components/UsersTable";
import AddLeadForm from "../components/AddLeadForm";
import Modal from "../components/Modal";

interface Lead {
  id: number;
  name: string;
  email: string;
  company: string;
  website: string | null;
  status: string;
  owner_name?: string;
  created_at: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [leadsError, setLeadsError] = useState<string | null>(null);
  const [usersError, setUsersError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [activeTab, setActiveTab] = useState<"leads" | "users">("leads");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchLeads = () => {
    setLeadsLoading(true);
    apiClient
      .get("/api/leads/", { params: { page, search, status: statusFilter } })
      .then((res) => {
        const data = res.data;
        if (data && data.results) {
          setLeads(data.results);
          setTotalPages(Math.ceil((data.count || 0) / 10));
        } else {
          setLeads(Array.isArray(data) ? data : []);
          setTotalPages(1);
        }
      })
      .catch(() => setLeadsError("Failed to load leads."))
      .finally(() => setLeadsLoading(false));
  };

  useEffect(() => {
    fetchLeads();
  }, [page, search, statusFilter]);

  useEffect(() => {
    // Fetch all users once
    apiClient
      .get("/api/admin/users/")
      .then((res) => setUsers(res.data))
      .catch(() => setUsersError("Failed to load users."))
      .finally(() => setUsersLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this lead?")) {
      try {
        await apiClient.delete(`/api/leads/${id}/`);
        fetchLeads();
      } catch {
        alert("Failed to delete lead");
      }
    }
  };

  return (
    <div className="dashboard">
      <Header />
      <main className="dashboard-content">
        <div className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'leads' ? 'active' : ''}`}
            onClick={() => setActiveTab('leads')}
          >
            All Leads
          </button>
          <button 
            className={`nav-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
        </div>

        {activeTab === 'leads' && (
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
              loading={leadsLoading}
              error={leadsError}
              showOwner
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              onDelete={handleDelete}
            />
          </section>
        )}

        {activeTab === 'users' && (
          <section>
            <UsersTable users={users} loading={usersLoading} error={usersError} />
          </section>
        )}

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
