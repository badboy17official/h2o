import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/store';
import { adminAPI } from '../services/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState('teams'); // teams, leaderboard, upload
  const [teams, setTeams] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (activeTab === 'teams') {
      fetchTeams();
    } else if (activeTab === 'leaderboard') {
      fetchLeaderboard();
    }
  }, [activeTab]);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getTeams();
      setTeams(response.data.teams);
    } catch (error) {
      console.error('Error fetching teams:', error);
      alert('Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getLeaderboard();
      setLeaderboard(response.data.leaderboard);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      alert('Failed to fetch leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    setSelectedFile(e.target.files[0]);
    setUploadResult(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    setUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await adminAPI.uploadTeams(formData);
      setUploadResult(response.data);
      setSelectedFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('file-upload');
      if (fileInput) fileInput.value = '';

      // Refresh teams if on teams tab
      if (activeTab === 'teams') {
        fetchTeams();
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert(error.response?.data?.error || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleExportResults = async () => {
    try {
      const response = await adminAPI.exportResults();
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `results-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting results:', error);
      alert('Failed to export results');
    }
  };

  const handleDeleteTeam = async (teamId, teamName) => {
    const confirm = window.confirm(`Are you sure you want to delete team "${teamName}"?`);
    if (!confirm) return;

    try {
      await adminAPI.deleteTeam(teamId);
      fetchTeams();
    } catch (error) {
      console.error('Error deleting team:', error);
      alert('Failed to delete team');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-success-container text-success border border-success/20',
      'in-progress': 'bg-warning-container text-warning border border-warning/20',
      'not-started': 'bg-surface-bright text-on-surface-variant border border-outline-variant',
    };

    return (
      <span className={`px-3 py-1 rounded-xl text-xs font-medium ${styles[status]}`}>
        {status.replace('-', ' ').toUpperCase()}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-surface-dim px-4 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="surface-1 rounded-3xl shadow-elevated-2 p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-on-surface mb-1">
                Admin Dashboard
              </h1>
              <p className="text-sm text-on-surface-variant">
                Manage teams and view competition results
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-5 py-2 rounded-2xl font-medium text-sm surface-2 text-on-surface-variant hover:text-error hover:border-error/30 transition-all duration-200"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="surface-1 rounded-2xl shadow-elevated-1 p-1.5 flex gap-1.5">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeTab === 'upload'
                  ? 'bg-secondary-container border border-secondary/20 text-secondary'
                  : 'text-on-surface-variant hover:bg-surface-bright'
              }`}
            >
              📤 Upload Teams
            </button>
            <button
              onClick={() => setActiveTab('teams')}
              className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeTab === 'teams'
                  ? 'bg-primary-container border border-primary/20 text-primary'
                  : 'text-on-surface-variant hover:bg-surface-bright'
              }`}
            >
              👥 Teams ({teams.length})
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeTab === 'leaderboard'
                  ? 'bg-success-container border border-success/20 text-success'
                  : 'text-on-surface-variant hover:bg-surface-bright'
              }`}
            >
              🏆 Leaderboard
            </button>
          </div>
        </div>

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="surface-1 rounded-3xl shadow-elevated-2 p-6 animate-fade-in">
            <h2 className="text-xl font-semibold mb-4 text-on-surface">
              Upload Teams from Excel
            </h2>
            
            <div className="mb-6 p-4 rounded-2xl surface-2">
              <h3 className="font-medium mb-2 text-primary text-sm">
                Excel Format Required:
              </h3>
              <table className="w-full text-sm text-on-surface-variant">
                <thead>
                  <tr className="border-b border-outline-variant">
                    <th className="p-2 text-left text-xs">Team ID</th>
                    <th className="p-2 text-left text-xs">Team Name</th>
                    <th className="p-2 text-left text-xs">Password</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 font-mono text-xs">TEAM001</td>
                    <td className="p-2 text-xs">Alpha Team</td>
                    <td className="p-2 font-mono text-xs">alpha123</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono text-xs">TEAM002</td>
                    <td className="p-2 text-xs">Beta Team</td>
                    <td className="p-2 font-mono text-xs">beta456</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mb-4">
              <input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="w-full p-3 rounded-2xl input-m3 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border file:border-secondary/30 file:bg-secondary-container file:text-secondary file:font-medium file:text-sm file:cursor-pointer"
              />
            </div>

            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="btn-secondary w-full py-3 rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
            >
              {uploading ? 'Uploading...' : 'Upload Teams'}
            </button>

            {uploadResult && (
              <div className={`mt-4 p-4 rounded-2xl ${
                uploadResult.created > 0
                  ? 'surface-2 border border-success/20'
                  : 'surface-2 border border-warning/20'
              }`}>
                <h4 className="font-semibold mb-2 text-on-surface text-sm">
                  Upload Results:
                </h4>
                <p className="text-on-surface-variant text-sm">
                  ✅ Created: {uploadResult.created} teams
                </p>
                <p className="text-on-surface-variant text-sm">
                  ⏭️ Skipped: {uploadResult.skipped} teams
                </p>
                {uploadResult.errors && uploadResult.errors.length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-error text-sm">
                      View Errors ({uploadResult.errors.length})
                    </summary>
                    <ul className="mt-2 ml-4 text-sm list-disc">
                      {uploadResult.errors.map((error, idx) => (
                        <li key={idx} className="text-error/80">
                          {error}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            )}
          </div>
        )}

        {/* Teams Tab */}
        {activeTab === 'teams' && (
          <div className="surface-1 rounded-3xl shadow-elevated-2 p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-on-surface">
                Registered Teams
              </h2>
              <button onClick={fetchTeams} className="btn-primary px-4 py-2 rounded-xl text-sm font-medium">
                🔄 Refresh
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 spinner-m3 mx-auto"></div>
              </div>
            ) : teams.length === 0 ? (
              <p className="text-center py-12 text-on-surface-variant">
                No teams registered yet
              </p>
            ) : (
              <div className="overflow-x-auto rounded-2xl">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-outline">
                      <th className="p-3 text-left text-on-surface-variant text-xs font-medium">Team ID</th>
                      <th className="p-3 text-left text-on-surface-variant text-xs font-medium">Team Name</th>
                      <th className="p-3 text-left text-on-surface-variant text-xs font-medium">Status</th>
                      <th className="p-3 text-left text-on-surface-variant text-xs font-medium">Score</th>
                      <th className="p-3 text-left text-on-surface-variant text-xs font-medium">Progress</th>
                      <th className="p-3 text-left text-on-surface-variant text-xs font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((team) => (
                      <tr 
                        key={team.id}
                        className="border-b border-outline-variant hover:bg-surface-bright transition-colors duration-150"
                      >
                        <td className="p-3 font-mono text-sm text-primary/80">
                          {team.team_id}
                        </td>
                        <td className="p-3 text-on-surface text-sm">
                          {team.team_name}
                        </td>
                        <td className="p-3">
                          {getStatusBadge(team.status)}
                        </td>
                        <td className="p-3 font-semibold text-on-surface font-mono text-sm">
                          {team.score !== null && team.score !== undefined ? `${team.score}/20` : '-'}
                        </td>
                        <td className="p-3 text-on-surface-variant font-mono text-sm">
                          {team.answered_count}/20
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleDeleteTeam(team.id, team.team_name)}
                            className="px-3 py-1.5 rounded-xl bg-error-container text-error border border-error/20 hover:bg-error/20 text-xs font-medium transition-all duration-200"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <div className="surface-1 rounded-3xl shadow-elevated-2 p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-on-surface">
                Leaderboard
              </h2>
              <div className="flex gap-2">
                <button onClick={fetchLeaderboard} className="btn-primary px-4 py-2 rounded-xl text-sm font-medium">
                  🔄 Refresh
                </button>
                <button onClick={handleExportResults} className="btn-primary px-4 py-2 rounded-xl text-sm font-medium">
                  📥 Export CSV
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 spinner-m3 mx-auto"></div>
              </div>
            ) : leaderboard.length === 0 ? (
              <p className="text-center py-12 text-on-surface-variant">
                No results available yet
              </p>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.rank}
                    className={`p-4 rounded-2xl flex items-center justify-between transition-all duration-200 border ${
                      entry.rank === 1
                        ? 'bg-yellow-500/8 border-yellow-500/20'
                        : entry.rank === 2
                        ? 'bg-gray-400/5 border-gray-400/15'
                        : entry.rank === 3
                        ? 'bg-orange-500/5 border-orange-500/15'
                        : 'surface-2'
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`text-xl font-bold ${
                        entry.rank === 1 ? 'rank-gold' :
                        entry.rank === 2 ? 'rank-silver' :
                        entry.rank === 3 ? 'rank-bronze' :
                        'text-on-surface-variant'
                      }`}>
                        #{entry.rank}
                      </div>
                      <div>
                        <div className="font-semibold text-on-surface text-sm">
                          {entry.team_name}
                        </div>
                        <div className="text-xs text-on-surface-variant font-mono">
                          {entry.team_id}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-sm font-semibold text-success font-mono">
                          {(Number.isFinite(entry.accuracy) ? entry.accuracy : 0).toFixed(1)}%
                        </div>
                        <div className="text-[10px] text-on-surface-variant">
                          Accuracy
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary font-mono">
                          {entry.score}/{entry.total}
                        </div>
                        <div className="text-xs text-on-surface-variant font-mono">
                          {entry.time_taken ? `${Math.floor(entry.time_taken / 60)}m ${entry.time_taken % 60}s` : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
