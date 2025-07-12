import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { User, Edit, Save, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

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

  const handleUpdateProfile = async (data) => {
    try {
      await updateProfile(data);
      setIsEditing(false);
    } catch (error) {
      // Error handled in context
    }
  };

  const formatDate = (date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
<div className="min-h-screen bg-gray-50 flex flex-col items-center px-4 pt-6">

      {/* Heading */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600">Manage your account</p>
      </div>

      {/* Profile Card */}
      <div className="w-full max-w-xl bg-white p-6 rounded-xl shadow-sm border">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">{user.username}</h2>
          <p className="text-gray-600">{user.email}</p>
        </div>

        {!isEditing ? (
          <>
            <div className="space-y-4 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Member since</span>
                <span className="font-medium">{formatDate(user.joinedAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Reputation</span>
                <span className="font-medium">{user.reputation}</span>
              </div>
              <div className="flex justify-between">
                <span>Questions</span>
                <span className="font-medium">{user.questionsCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Answers</span>
                <span className="font-medium">{user.answersCount}</span>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 border bg-blue-100 text-blue-600 border-blue-300 hover:bg-blue-200 shadow-sm hover:shadow-md font-medium"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit(handleUpdateProfile)} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                {...register('username', {
                  required: 'Username is required',
                  minLength: { value: 3, message: 'Min 3 characters' },
                  maxLength: { value: 30, message: 'Max 30 characters' },
                  pattern: {
                    value: /^[a-zA-Z0-9_]+$/,
                    message: 'Only letters, numbers, and underscores'
                  }
                })}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.username ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.username && (
                <p className="text-sm text-red-600 mt-1">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
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
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;
