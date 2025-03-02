'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Notifications', [
      {
        userID: 1, // assuming user with ID 1 exists
        title: 'profile changed',
        message: 'Your profile has been changed, they added profile detail for you',
        type: 'alert',
        isRead: false, // Unread notification
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userID: 2, // assuming user with ID 1 exists
        title: 'new order',
        message: 'You have a new order, please check your order list !',
        type: 'alert',
        isRead: false, // Unread notification
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userID: 3, // assuming user with ID 1 exists
        title: 'new message',
        message: 'You have a new message, please check your message list !',
        type: 'alert',
        isRead: false, // Unread notification
        createdAt: new Date(),
        updatedAt: new Date(),
      },
     
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Notifications', null, {});
  }
};
