import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Eye, 
  Clock, 
  Tag, 
  User,
  CheckCircle,
  Edit,
  Trash2,
  Flag
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import LoadingSpinner from '../components/LoadingSpinner';

const QuestionDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [answerContent, setAnswerContent] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [editingAnswer, setEditingAnswer] = useState(null);

  useEffect(() => {
    fetchQuestion();
  }, [id]);

  const fetchQuestion = async () => {
    try {
      const response = await axios.get(`/questions/${id}`);
      setQuestion(response.data);
      setAnswers(response.data.answers || []);
    } catch (error) {
      console.error('Error fetching question:', error);
      toast.error('Failed to load question');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (type, itemId, itemType) => {
    if (!isAuthenticated) {
      toast.error('Please login to vote');
      return;
    }

    try {
      const endpoint = itemType === 'question' 
        ? `/questions/${itemId}/vote`
        : `/answers/${itemId}/vote`;
      
      await axios.post(endpoint, { voteType: type });
      
      // Update the item's vote count
      if (itemType === 'question') {
        setQuestion(prev => ({
          ...prev,
          voteCount: prev.voteCount + (type === 'upvote' ? 1 : -1)
        }));
      } else {
        setAnswers(prev => prev.map(answer => 
          answer._id === itemId 
            ? { ...answer, voteCount: answer.voteCount + (type === 'upvote' ? 1 : -1) }
            : answer
        ));
      }
      
      toast.success('Vote recorded');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to vote';
      toast.error(message);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answerContent.trim()) {
      toast.error('Please provide an answer');
      return;
    }

    setSubmittingAnswer(true);
    try {
      const response = await axios.post(`/answers/question/${id}`, {
        content: answerContent
      });

      setAnswers(prev => [...prev, response.data.answer]);
      setAnswerContent('');
      setShowAnswerForm(false);
      toast.success('Answer posted successfully!');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to post answer';
      toast.error(message);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleAcceptAnswer = async (answerId) => {
    try {
      await axios.post(`/questions/${id}/accept-answer`, { answerId });
      
      // Update the question and answers
      setQuestion(prev => ({ ...prev, acceptedAnswer: answerId }));
      setAnswers(prev => prev.map(answer => ({
        ...answer,
        isAccepted: answer._id === answerId
      })));
      
      toast.success('Answer accepted!');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to accept answer';
      toast.error(message);
    }
  };

  const handleDeleteAnswer = async (answerId) => {
    if (!confirm('Are you sure you want to delete this answer?')) return;

    try {
      await axios.delete(`/answers/${answerId}`);
      setAnswers(prev => prev.filter(answer => answer._id !== answerId));
      toast.success('Answer deleted');
    } catch (error) {
      toast.error('Failed to delete answer');
    }
  };

  const handleUpdateAnswer = async (answerId) => {
    if (!answerContent.trim()) {
      toast.error('Please provide an answer');
      return;
    }

    setSubmittingAnswer(true);
    try {
      const response = await axios.put(`/answers/${answerId}`, {
        content: answerContent
      });

      setAnswers(prev => prev.map(answer => 
        answer._id === answerId ? response.data.answer : answer
      ));
      setAnswerContent('');
      setEditingAnswer(null);
      toast.success('Answer updated successfully!');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update answer';
      toast.error(message);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const formatDate = (date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!question) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Question not found</h2>
        <Link to="/" className="btn-primary">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Question */}
      <div className="card p-6 mb-6">
        <div className="flex gap-4">
          {/* Vote buttons */}
          <div className="flex flex-col items-center space-y-2">
            <button
              onClick={() => handleVote('upvote', question._id, 'question')}
              className="p-2 text-gray-400 hover:text-green-600 transition-colors"
              disabled={!isAuthenticated}
            >
              <ThumbsUp className="w-5 h-5" />
            </button>
            <span className="text-lg font-semibold text-gray-900">
              {question.voteCount}
            </span>
            <button
              onClick={() => handleVote('downvote', question._id, 'question')}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              disabled={!isAuthenticated}
            >
              <ThumbsDown className="w-5 h-5" />
            </button>
          </div>

          {/* Question content */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {question.title}
            </h1>
            
            <div 
              className="prose max-w-none mb-4"
              dangerouslySetInnerHTML={{ __html: question.description }}
            />

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {question.tags?.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
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
                  <span>asked {formatDate(question.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{question.views} views</span>
                </div>
              </div>
              
              {(user?._id === question.author?._id || isAdmin) && (
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/questions/${id}/edit`}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Answers */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {answers.length} Answer{answers.length !== 1 ? 's' : ''}
        </h2>

        {answers.map((answer) => (
          <div key={answer._id} className="card p-6 mb-4">
            <div className="flex gap-4">
              {/* Vote buttons */}
              <div className="flex flex-col items-center space-y-2">
                <button
                  onClick={() => handleVote('upvote', answer._id, 'answer')}
                  className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                  disabled={!isAuthenticated}
                >
                  <ThumbsUp className="w-5 h-5" />
                </button>
                <span className="text-lg font-semibold text-gray-900">
                  {answer.voteCount}
                </span>
                <button
                  onClick={() => handleVote('downvote', answer._id, 'answer')}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  disabled={!isAuthenticated}
                >
                  <ThumbsDown className="w-5 h-5" />
                </button>
                
                {/* Accept button */}
                {user?._id === question.author?._id && !question.acceptedAnswer && (
                  <button
                    onClick={() => handleAcceptAnswer(answer._id)}
                    className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                    title="Accept this answer"
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                )}
                
                {answer.isAccepted && (
                  <div className="p-2 text-green-600" title="Accepted answer">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                )}
              </div>

              {/* Answer content */}
              <div className="flex-1">
                {editingAnswer === answer._id ? (
                  <div className="mb-4">
                    <ReactQuill
                      theme="snow"
                      value={answerContent}
                      onChange={setAnswerContent}
                      modules={{
                        toolbar: [
                          [{ 'header': [1, 2, false] }],
                          ['bold', 'italic', 'underline'],
                          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                          ['link', 'code-block'],
                          ['clean']
                        ]
                      }}
                    />
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleUpdateAnswer(answer._id)}
                        disabled={submittingAnswer}
                        className="btn-primary"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => {
                          setEditingAnswer(null);
                          setAnswerContent('');
                        }}
                        className="btn-outline"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="prose max-w-none mb-4"
                    dangerouslySetInnerHTML={{ __html: answer.content }}
                  />
                )}

                {/* Meta */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{answer.author?.username}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>answered {formatDate(answer.createdAt)}</span>
                    </div>
                  </div>
                  
                  {(user?._id === answer.author?._id || isAdmin) && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setEditingAnswer(answer._id);
                          setAnswerContent(answer.content);
                        }}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAnswer(answer._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Answer Form */}
      {isAuthenticated && (
        <div className="card p-6">
          {!showAnswerForm ? (
            <button
              onClick={() => setShowAnswerForm(true)}
              className="btn-primary"
            >
              Write an Answer
            </button>
          ) : (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Your Answer
              </h3>
              <ReactQuill
                theme="snow"
                value={answerContent}
                onChange={setAnswerContent}
                placeholder="Write your answer here..."
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, false] }],
                    ['bold', 'italic', 'underline'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['link', 'code-block'],
                    ['clean']
                  ]
                }}
                style={{ height: '200px' }}
              />
              <div className="flex gap-4 mt-4">
                <button
                  onClick={handleSubmitAnswer}
                  disabled={submittingAnswer}
                  className="btn-primary"
                >
                  {submittingAnswer ? 'Posting...' : 'Post Answer'}
                </button>
                <button
                  onClick={() => {
                    setShowAnswerForm(false);
                    setAnswerContent('');
                  }}
                  className="btn-outline"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionDetail; 