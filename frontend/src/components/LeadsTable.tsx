/**
 * LeadsTable — displays leads in a table with loading, empty, and error states.
 * Used by both MemberDashboard and AdminDashboard.
 */

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

interface LeadsTableProps {
  leads: Lead[];
  loading: boolean;
  error: string | null;
  showOwner?: boolean; // true for admin view
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onDelete?: (id: number) => void;
}

export default function LeadsTable({
  leads = [],
  loading,
  error,
  showOwner = false,
  page,
  totalPages,
  onPageChange,
  onDelete,
}: LeadsTableProps) {
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading leads...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (leads.length === 0) {
    return <div className="empty-state">No leads found. Create one to get started!</div>;
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Company</th>
            <th>Status</th>
            {showOwner && <th>Owner</th>}
            <th>Created</th>
            {onDelete && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td>{lead.name}</td>
              <td>{lead.email}</td>
              <td>{lead.company}</td>
              <td>
                <span className={`status-badge status-${lead.status}`}>
                  {lead.status}
                </span>
              </td>
              {showOwner && <td>{lead.owner_name || "—"}</td>}
              <td>{new Date(lead.created_at).toLocaleDateString()}</td>
              {onDelete && (
                <td>
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => onDelete(lead.id)}
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      
      {page && totalPages && onPageChange && totalPages > 1 && (
        <div className="pagination">
          <button 
            className="btn btn-logout btn-sm"
            disabled={page === 1} 
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </button>
          <span>Page {page} of {totalPages}</span>
          <button 
            className="btn btn-logout btn-sm"
            disabled={page === totalPages} 
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
