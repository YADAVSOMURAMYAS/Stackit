import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Tag, X } from 'lucide-react';

const AskQuestion = () => {
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const availableTags = [
    'javascript', 'react', 'nodejs', 'python', 'java', 'css', 'html',
    'database', 'api', 'git', 'docker', 'aws', 'typescript', 'vue',
    'angular', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin'
  ];

  const handleAddTag = (tag) => {
    const cleanTag = tag.toLowerCase().trim();
    if (cleanTag && !tags.includes(cleanTag) && tags.length < 5) {
      setTags([...tags, cleanTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

  const onSubmit = async (data) => {
    if (tags.length === 0) {
      toast.error('Please add at least one tag');
      return;
    }

    if (!description.trim()) {
      toast.error('Please provide a description');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('/questions', {
        title: data.title,
        description: description,
        tags: tags
      });

      toast.success('Question posted successfully!');
      navigate(`/questions/${response.data.question._id}`);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to post question';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Ask a Question
        </h1>
        <p className="text-gray-600">
          Share your knowledge and help others in the community
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            placeholder="What's your question? Be specific."
            {...register('title', {
              required: 'Title is required',
              minLength: {
                value: 10,
                message: 'Title must be at least 10 characters'
              },
              maxLength: {
                value: 300,
                message: 'Title must be less than 300 characters'
              }
            })}
            className={`input ${errors.title ? 'border-red-500' : ''}`}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <div className="border border-gray-300 rounded-lg">
            <ReactQuill
              theme="snow"
              value={description}
              onChange={setDescription}
              placeholder="Provide all the information someone would need to answer your question..."
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  [{ 'color': [] }, { 'background': [] }],
                  [{ 'align': [] }],
                  ['link', 'image', 'code-block'],
                  ['clean']
                ]
              }}
              style={{ height: '200px' }}
            />
          </div>
          {!description.trim() && (
            <p className="mt-1 text-sm text-red-600">Description is required</p>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags * (up to 5)
          </label>
          
          {/* Tag Input */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleTagInputKeyPress}
              placeholder="Add a tag..."
              className="input flex-1"
            />
            <button
              type="button"
              onClick={() => handleAddTag(tagInput)}
              className="btn-secondary"
            >
              Add
            </button>
          </div>

          {/* Selected Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 text-primary-600 hover:text-primary-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          {/* Available Tags */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Popular tags:</p>
            <div className="flex flex-wrap gap-1">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleAddTag(tag)}
                  disabled={tags.includes(tag) || tags.length >= 5}
                  className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {tags.length === 0 && (
            <p className="mt-1 text-sm text-red-600">Please add at least one tag</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isLoading || tags.length === 0 || !description.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Posting...
              </div>
            ) : (
              'Post Question'
            )}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn-outline"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AskQuestion; 