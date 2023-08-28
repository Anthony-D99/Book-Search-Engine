const { User } = require('../models');
const { signToken } = require('../utils/auth');


const resolvers = {
  Query: {
    getSingleUser: async (parent, { _id }) => {
      const params = _id ? { _id } : {};
      return User.findOne(params).populate('savedBooks');
    },
    me: async (parent, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id }).populate('thoughts');
      }
      throw new AuthenticationError('You need to be logged in!');
    },
  },
  Mutation: {
    createUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('No user found with this email address');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user);

      return { token, user };
    },
    saveBook: async (parent, { bookId }) => {
      const book = await User.findOneAndUpdate(
        { _id: user._id },
        { $addToSet: { savedBooks: book.bookId} },
        { new: true, runValidators: true }
      );
      return book;
    },
  },
  removeBook: async (parent, { bookId }, context) => {
    if (context.user) {

      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        { $pull: { savedBooks: {_id: bookId}  } },
        { new: true }
      );

      return updatedUser;
    }
    throw new AuthenticationError('You need to be logged in!');
  },
};

module.exports = resolvers;
