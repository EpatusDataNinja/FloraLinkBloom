"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("Categories", [
      {
        name: "love flowers",
        userID: 2, // Ensure this user exists in the Users table
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "birthday flowers",
        userID: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
   
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Categories", null, {});
  },
};
