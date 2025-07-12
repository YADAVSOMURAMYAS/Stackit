import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Users, 
  MessageSquare, 
  ThumbsUp, 
  Tag, 
  Shield,
  AlertTriangle,
  Ban,
  CheckCircle,
  X,
  Send,
  BarChart3
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [moderationQueue, setModerationQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [alertForm, setAlertForm] = useState({ title: '', message: '' });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, usersRes, queueRes] = await Promise.all([
        axios.get('/admin/dashboard'),
        axios.get('/admin/users'),
        axios.get('/admin/moderation-queue')
      ]);
      
      setStats(statsRes.data);
      setUsers(usersRes.data.users);
      setModerationQueue(queueRes.data.items);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId, reason) => {
    try {
      await axios.put(`/admin/users/${userId}/ban`, { reason });
      toast.success('User ban status updated');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to update user ban status');
    }
  };

  const handleModerateContent = async (contentId, type, status, reason) => {
    try {
      const endpoint = type === 'question' 
        ? `/admin/questions/${contentId}/moderate`
        : `/admin/answers/${contentId}/moderate`;
      
      await axios.put(endpoint, { status, reason });
      toast.success('Content moderated successfully');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to moderate content');
    }
  };

  const handleSendAlert = async (e) => {
    e.preventDefault();
    if (!alertForm.title || !alertForm.message) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await axios.post('/admin/alerts', alertForm);
      toast.success('Alert sent successfully');
      setAlertForm({ title: '', message: '' });
    } catch (error) {
      toast.error('Failed to send alert');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage the platform and moderate content</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'dashboard', label: 'Overview', icon: BarChart3 },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'moderation', label: 'Moderation', icon: Shield },
            { id: 'alerts', label: 'Alerts', icon: Send }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Dashboard Overview */}
      {activeTab === 'dashboard' && stats && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.stats.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Questions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.stats.totalQuestions}</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ThumbsUp className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Answers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.stats.totalAnswers}</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Ban className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Banned Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.stats.bannedUsers}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Users</h3>
              <div className="space-y-3">
                {stats.recentActivity.users.map((user) => (
                  <div key={user._id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{user.username}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(user.joinedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Questions</h3>
              <div className="space-y-3">
                {stats.recentActivity.questions.map((question) => (
                  <div key={question._id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{question.title}</p>
                      <p className="text-sm text-gray-500">by {question.author.username}</p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(question.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Management */}
      {activeTab === 'users' && (
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">User Management</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.username}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.isBanned 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.isBanned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.joinedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => handleBanUser(user._id, 'Admin action')}
                          className={`text-sm ${
                            user.isBanned 
                              ? 'text-green-600 hover:text-green-900' 
                              : 'text-red-600 hover:text-red-900'
                          }`}
                        >
                          {user.isBanned ? 'Unban' : 'Ban'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Moderation Queue */}
      {activeTab === 'moderation' && (
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Moderation Queue</h3>
          <div className="space-y-4">
            {moderationQueue.length === 0 ? (
              <p className="text-gray-500">No items in moderation queue</p>
            ) : (
              moderationQueue.map((item) => (
                <div key={item._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        by {item.author?.username} • {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleModerateContent(item._id, 'question', 'active', 'Approved')}
                        className="btn-primary text-sm"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleModerateContent(item._id, 'question', 'closed', 'Inappropriate content')}
                        className="btn-outline text-sm"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Send Alerts */}
      {activeTab === 'alerts' && (
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Send Platform Alert</h3>
          <form onSubmit={handleSendAlert} className="space-y-4">
            <div>
              <label htmlFor="alertTitle" className="block text-sm font-medium text-gray-700 mb-1">
                Alert Title
              </label>
              <input
                type="text"
                id="alertTitle"
                value={alertForm.title}
                onChange={(e) => setAlertForm({ ...alertForm, title: e.target.value })}
                className="input"
                placeholder="Enter alert title"
                required
              />
            </div>
            <div>
              <label htmlFor="alertMessage" className="block text-sm font-medium text-gray-700 mb-1">
                Alert Message
              </label>
              <textarea
                id="alertMessage"
                value={alertForm.message}
                onChange={(e) => setAlertForm({ ...alertForm, message: e.target.value })}
                className="input"
                rows={4}
                placeholder="Enter alert message"
                required
              />
            </div>
            <button type="submit" className="btn-primary">
              <Send className="w-4 h-4 mr-2" />
              Send Alert
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 