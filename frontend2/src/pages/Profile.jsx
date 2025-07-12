import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  User, 
  Mail, 
  Calendar, 
  MessageSquare, 
  ThumbsUp,
  Edit,
  Save,
  X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [userQuestions, setUserQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      username: user?.username || '',
      email: user?.email || ''
    }
  });

  useEffect(() => {
    fetchUserContent();
  }, []);

  const fetchUserContent = async () => {
    try {
      const [questionsRes, answersRes] = await Promise.all([
        axios.get(`/questions?author=${user._id}&limit=5`),
        axios.get(`/answers?author=${user._id}&limit=5`)
      ]);
      
      setUserQuestions(questionsRes.data.questions);
      setUserAnswers(answersRes.data.answers);
    } catch (error) {
      console.error('Error fetching user content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (data) => {
    try {
      await updateProfile(data);
      setIsEditing(false);
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  const formatDate = (date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600">Manage your account and view your activity</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-1">
          <div className="card p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-primary-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{user.username}</h2>
              <p className="text-gray-600">{user.email}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Member since</span>
                <span className="font-medium">
                  {formatDate(user.joinedAt)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Reputation</span>
                <span className="font-medium">{user.reputation}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Questions</span>
                <span className="font-medium">{user.questionsCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Answers</span>
                <span className="font-medium">{user.answersCount}</span>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="w-full mt-6 btn-outline"
            >
              {isEditing ? (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </>
              )}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit Profile Form */}
          {isEditing && (
            <div className="card p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Profile</h3>
              <form onSubmit={handleSubmit(handleUpdateProfile)} className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    {...register('username', {
                      required: 'Username is required',
                      minLength: {
                        value: 3,
                        message: 'Username must be at least 3 characters'
                      },
                      maxLength: {
                        value: 30,
                        message: 'Username must be less than 30 characters'
                      },
                      pattern: {
                        value: /^[a-zA-Z0-9_]+$/,
                        message: 'Username can only contain letters, numbers, and underscores'
                      }
                    })}
                    className={`input ${errors.username ? 'border-red-500' : ''}`}
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    className={`input ${errors.email ? 'border-red-500' : ''}`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div className="flex gap-4">
                  <button type="submit" className="btn-primary">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Recent Questions */}
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Questions</h3>
            {userQuestions.length === 0 ? (
              <p className="text-gray-500">No questions yet</p>
            ) : (
              <div className="space-y-3">
                {userQuestions.map((question) => (
                  <div key={question._id} className="border-b border-gray-200 pb-3 last:border-b-0">
                    <a
                      href={`/questions/${question._id}`}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      {question.title}
                    </a>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <span>{formatDate(question.createdAt)}</span>
                      <span>{question.answers?.length || 0} answers</span>
                      <span>{question.voteCount} votes</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Answers */}
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Answers</h3>
            {userAnswers.length === 0 ? (
              <p className="text-gray-500">No answers yet</p>
            ) : (
              <div className="space-y-3">
                {userAnswers.map((answer) => (
                  <div key={answer._id} className="border-b border-gray-200 pb-3 last:border-b-0">
                    <a
                      href={`/questions/${answer.question}`}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      {answer.questionTitle || 'Question'}
                    </a>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <span>{formatDate(answer.createdAt)}</span>
                      <span>{answer.voteCount} votes</span>
                      {answer.isAccepted && (
                        <span className="text-green-600 font-medium">✓ Accepted</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 