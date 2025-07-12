import { Link } from 'react-router-dom';
import { MessageSquare, Eye, ThumbsUp, Clock, Tag, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const QuestionCard = ({ question }) => {
  const formatDate = (date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <div className="card p-6 hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        {/* Stats */}
        <div className="flex flex-col items-center space-y-2 text-sm text-gray-500 min-w-[80px]">
          <div className="flex items-center space-x-1">
            <ThumbsUp className="w-4 h-4" />
            <span>{question.voteCount}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MessageSquare className="w-4 h-4" />
            <span>{question.answers?.length || 0}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Eye className="w-4 h-4" />
            <span>{question.views}</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <Link
              to={`/questions/${question._id}`}
              className="text-lg font-medium text-gray-900 hover:text-primary-600 line-clamp-2"
            >
              {question.title}
            </Link>
            {question.acceptedAnswer && (
              <span className="ml-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                Solved
              </span>
            )}
          </div>

          {/* Description preview */}
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {question.description.replace(/<[^>]*>/g, '').substring(0, 150)}
            {question.description.length > 150 && '...'}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {question.tags?.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>

          {/* Meta */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>{question.author?.username}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{formatDate(question.createdAt)}</span>
              </div>
            </div>
            
            {question.updatedAt !== question.createdAt && (
              <span className="text-xs">
                edited {formatDate(question.updatedAt)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard; 