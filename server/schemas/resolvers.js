const { User } = require('../models');
const { signToken } = require('../utils/auth');
const {AuthenticationError} = require('apollo-server-express')

const resolvers = {
  Query: {
    me: async (parent, context) => {
      if (context.user) {
        const userData =  User.findOne({ _id: context.user._id }).select('-__v -password');
        console.log(userData)
        return userData
      }
      throw new AuthenticationError('You need to be logged in!');
    },
  },
  Mutation: {
    addUser: async (parent, { username, email, password }) => {
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
    saveBook: async (parent, { bookData }, context) => {
      const book = await User.findOneAndUpdate(
        { _id: context.user._id },
        { $addToSet: { savedBooks: {bookData}} },
        { new: true, runValidators: true }
      );
      return book;
    },
  
  removeBook: async (parent, { bookId }, context) => {
    if (context.user) {

      const updatedUser = await User.findOneAndUpdate(
        { _id: context.user._id },
        { $pull: { savedBooks:  {bookId}  } },
        { new: true }
      );

      return updatedUser;
    }
    throw new AuthenticationError('You need to be logged in!');
  },
}
}
module.exports = resolvers;
