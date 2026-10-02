/**
 * UsersTable — displays all users in a table (admin only).
 */

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

interface UsersTableProps {
  users: User[];
  loading: boolean;
  error: string | null;
}

export default function UsersTable({ users, loading, error }: UsersTableProps) {
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading users...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <span className={`role-badge role-${user.role}`}>{user.role}</span>
              </td>
              <td>{new Date(user.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
