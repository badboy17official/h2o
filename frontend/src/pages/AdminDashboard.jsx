import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useThemeStore } from '../store/store';
import { adminAPI } from '../services/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { theme } = useThemeStore();
  
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
      completed: theme === 'elegant' 
        ? 'bg-green-100 text-green-700' 
        : 'bg-green-500 bg-opacity-20 text-green-400 border border-green-500',
      'in-progress': theme === 'elegant'
        ? 'bg-yellow-100 text-yellow-700'
        : 'bg-yellow-500 bg-opacity-20 text-yellow-400 border border-yellow-500',
      'not-started': theme === 'elegant'
        ? 'bg-gray-100 text-gray-700'
        : 'bg-gray-500 bg-opacity-20 text-gray-400 border border-gray-500',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
        {status.replace('-', ' ').toUpperCase()}
      </span>
    );
  };

  const cardClass = theme === 'elegant' 
    ? 'bg-white rounded-xl shadow-lg p-6'
    : 'glass border border-gray-700 rounded-xl p-6';

  const buttonClass = theme === 'elegant'
    ? 'px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'
    : 'px-4 py-2 bg-neon-blue bg-opacity-20 border border-neon-blue text-neon-blue rounded-lg hover:bg-opacity-30 transition-colors';

  return (
    <div className={`min-h-screen px-4 py-8 ${theme === 'elegant' ? 'bg-gradient-to-br from-purple-50 to-pink-50' : 'bg-gray-900 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`mb-8 p-6 rounded-xl ${cardClass}`}>
          <div className="flex justify-between items-center">
            <div>
              <h1 className={`text-3xl font-bold mb-2 ${theme === 'elegant' ? 'text-gray-800' : 'text-neon-purple'}`}>
                Admin Dashboard
              </h1>
              <p className={theme === 'elegant' ? 'text-gray-600' : 'text-gray-400'}>
                Manage teams and view competition results
              </p>
            </div>
            <button
              onClick={handleLogout}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                theme === 'elegant'
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-gray-800 border border-gray-600 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className={`flex gap-2 p-2 rounded-xl ${cardClass}`}>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'upload'
                  ? (theme === 'elegant' 
                      ? 'bg-purple-500 text-white shadow-lg'
                      : 'bg-neon-purple bg-opacity-30 border border-neon-purple text-neon-purple')
                  : (theme === 'elegant' ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-400 hover:bg-gray-800')
              }`}
            >
              📤 Upload Teams
            </button>
            <button
              onClick={() => setActiveTab('teams')}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'teams'
                  ? (theme === 'elegant'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-neon-blue bg-opacity-30 border border-neon-blue text-neon-blue')
                  : (theme === 'elegant' ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-400 hover:bg-gray-800')
              }`}
            >
              👥 Teams ({teams.length})
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'leaderboard'
                  ? (theme === 'elegant'
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-green-500 bg-opacity-30 border border-green-500 text-green-400')
                  : (theme === 'elegant' ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-400 hover:bg-gray-800')
              }`}
            >
              🏆 Leaderboard
            </button>
          </div>
        </div>

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className={cardClass}>
            <h2 className={`text-2xl font-bold mb-4 ${theme === 'elegant' ? 'text-gray-800' : 'text-white'}`}>
              Upload Teams from Excel
            </h2>
            
            <div className={`mb-6 p-4 rounded-lg ${theme === 'elegant' ? 'bg-blue-50' : 'bg-gray-800 bg-opacity-50'}`}>
              <h3 className={`font-semibold mb-2 ${theme === 'elegant' ? 'text-gray-800' : 'text-white'}`}>
                Excel Format Required:
              </h3>
              <table className={`w-full text-sm ${theme === 'elegant' ? 'text-gray-700' : 'text-gray-300'}`}>
                <thead>
                  <tr className={theme === 'elegant' ? 'bg-blue-100' : 'bg-gray-700'}>
                    <th className="p-2 text-left">Team ID</th>
                    <th className="p-2 text-left">Team Name</th>
                    <th className="p-2 text-left">Password</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2">TEAM001</td>
                    <td className="p-2">Alpha Team</td>
                    <td className="p-2">alpha123</td>
                  </tr>
                  <tr>
                    <td className="p-2">TEAM002</td>
                    <td className="p-2">Beta Team</td>
                    <td className="p-2">beta456</td>
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
                className={`w-full p-3 rounded-lg border-2 ${
                  theme === 'elegant'
                    ? 'border-gray-300 bg-white'
                    : 'border-gray-700 bg-gray-800 text-white'
                }`}
              />
            </div>

            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className={`w-full py-3 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                theme === 'elegant'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                  : 'bg-neon-purple bg-opacity-20 border-2 border-neon-purple text-neon-purple hover:bg-opacity-30'
              }`}
            >
              {uploading ? 'Uploading...' : 'Upload Teams'}
            </button>

            {uploadResult && (
              <div className={`mt-4 p-4 rounded-lg ${
                uploadResult.created > 0
                  ? (theme === 'elegant' ? 'bg-green-50 border-2 border-green-200' : 'bg-green-900 bg-opacity-30 border border-green-500')
                  : (theme === 'elegant' ? 'bg-yellow-50 border-2 border-yellow-200' : 'bg-yellow-900 bg-opacity-30 border border-yellow-500')
              }`}>
                <h4 className={`font-bold mb-2 ${theme === 'elegant' ? 'text-gray-800' : 'text-white'}`}>
                  Upload Results:
                </h4>
                <p className={theme === 'elegant' ? 'text-gray-700' : 'text-gray-300'}>
                  ✅ Created: {uploadResult.created} teams
                </p>
                <p className={theme === 'elegant' ? 'text-gray-700' : 'text-gray-300'}>
                  ⏭️ Skipped: {uploadResult.skipped} teams
                </p>
                {uploadResult.errors && uploadResult.errors.length > 0 && (
                  <details className="mt-2">
                    <summary className={`cursor-pointer ${theme === 'elegant' ? 'text-red-600' : 'text-red-400'}`}>
                      View Errors ({uploadResult.errors.length})
                    </summary>
                    <ul className="mt-2 ml-4 text-sm list-disc">
                      {uploadResult.errors.map((error, idx) => (
                        <li key={idx} className={theme === 'elegant' ? 'text-red-600' : 'text-red-400'}>
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
          <div className={cardClass}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-2xl font-bold ${theme === 'elegant' ? 'text-gray-800' : 'text-white'}`}>
                Registered Teams
              </h2>
              <button onClick={fetchTeams} className={buttonClass}>
                🔄 Refresh
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
              </div>
            ) : teams.length === 0 ? (
              <p className={`text-center py-12 ${theme === 'elegant' ? 'text-gray-600' : 'text-gray-400'}`}>
                No teams registered yet
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={theme === 'elegant' ? 'border-b-2 border-gray-200' : 'border-b-2 border-gray-700'}>
                      <th className={`p-3 text-left ${theme === 'elegant' ? 'text-gray-700' : 'text-gray-300'}`}>Team ID</th>
                      <th className={`p-3 text-left ${theme === 'elegant' ? 'text-gray-700' : 'text-gray-300'}`}>Team Name</th>
                      <th className={`p-3 text-left ${theme === 'elegant' ? 'text-gray-700' : 'text-gray-300'}`}>Status</th>
                      <th className={`p-3 text-left ${theme === 'elegant' ? 'text-gray-700' : 'text-gray-300'}`}>Score</th>
                      <th className={`p-3 text-left ${theme === 'elegant' ? 'text-gray-700' : 'text-gray-300'}`}>Progress</th>
                      <th className={`p-3 text-left ${theme === 'elegant' ? 'text-gray-700' : 'text-gray-300'}`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((team) => (
                      <tr 
                        key={team.id}
                        className={`${theme === 'elegant' ? 'border-b border-gray-100 hover:bg-gray-50' : 'border-b border-gray-800 hover:bg-gray-800 hover:bg-opacity-30'}`}
                      >
                        <td className={`p-3 font-mono ${theme === 'elegant' ? 'text-gray-800' : 'text-gray-300'}`}>
                          {team.team_id}
                        </td>
                        <td className={`p-3 ${theme === 'elegant' ? 'text-gray-800' : 'text-white'}`}>
                          {team.team_name}
                        </td>
                        <td className="p-3">
                          {getStatusBadge(team.status)}
                        </td>
                        <td className={`p-3 font-bold ${theme === 'elegant' ? 'text-gray-800' : 'text-white'}`}>
                          {team.score !== null && team.score !== undefined ? `${team.score}/20` : '-'}
                        </td>
                        <td className={`p-3 ${theme === 'elegant' ? 'text-gray-600' : 'text-gray-400'}`}>
                          {team.answered_count}/20
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleDeleteTeam(team.id, team.team_name)}
                            className={`px-3 py-1 rounded ${
                              theme === 'elegant'
                                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                : 'bg-red-900 bg-opacity-30 text-red-400 hover:bg-opacity-50 border border-red-500'
                            } text-sm transition-colors`}
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
          <div className={cardClass}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-2xl font-bold ${theme === 'elegant' ? 'text-gray-800' : 'text-white'}`}>
                Leaderboard
              </h2>
              <div className="flex gap-2">
                <button onClick={fetchLeaderboard} className={buttonClass}>
                  🔄 Refresh
                </button>
                <button onClick={handleExportResults} className={buttonClass}>
                  📥 Export CSV
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
              </div>
            ) : leaderboard.length === 0 ? (
              <p className={`text-center py-12 ${theme === 'elegant' ? 'text-gray-600' : 'text-gray-400'}`}>
                No results available yet
              </p>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.rank}
                    className={`p-4 rounded-lg flex items-center justify-between ${
                      entry.rank === 1
                        ? (theme === 'elegant' ? 'bg-gradient-to-r from-yellow-100 to-yellow-50 border-2 border-yellow-400' : 'bg-yellow-500 bg-opacity-20 border-2 border-yellow-500')
                        : entry.rank === 2
                        ? (theme === 'elegant' ? 'bg-gradient-to-r from-gray-100 to-gray-50 border-2 border-gray-400' : 'bg-gray-500 bg-opacity-20 border-2 border-gray-500')
                        : entry.rank === 3
                        ? (theme === 'elegant' ? 'bg-gradient-to-r from-orange-100 to-orange-50 border-2 border-orange-400' : 'bg-orange-500 bg-opacity-20 border-2 border-orange-500')
                        : (theme === 'elegant' ? 'bg-gray-50 border border-gray-200' : 'bg-gray-800 bg-opacity-50 border border-gray-700')
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`text-2xl font-bold ${
                        entry.rank === 1 ? 'text-yellow-600' :
                        entry.rank === 2 ? 'text-gray-600' :
                        entry.rank === 3 ? 'text-orange-600' :
                        (theme === 'elegant' ? 'text-gray-800' : 'text-white')
                      }`}>
                        #{entry.rank}
                      </div>
                      <div>
                        <div className={`font-bold ${theme === 'elegant' ? 'text-gray-800' : 'text-white'}`}>
                          {entry.team_name}
                        </div>
                        <div className={`text-sm ${theme === 'elegant' ? 'text-gray-600' : 'text-gray-400'}`}>
                          {entry.team_id}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className={`text-lg font-bold ${theme === 'elegant' ? 'text-green-600' : 'text-green-400'}`}>
                          {(Number.isFinite(entry.accuracy) ? entry.accuracy : 0).toFixed(2)}%
                        </div>
                        <div className={`text-xs ${theme === 'elegant' ? 'text-gray-500' : 'text-gray-500'}`}>
                          Accuracy
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${theme === 'elegant' ? 'text-blue-600' : 'text-neon-blue'}`}>
                          {entry.score}/{entry.total}
                        </div>
                        <div className={`text-sm ${theme === 'elegant' ? 'text-gray-600' : 'text-gray-400'}`}>
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
