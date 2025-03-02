'use strict';
import bcrypt from "bcrypt";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const saltRounds = 10; // Number of salt rounds for bcrypt

    const hashedPasswordAdmin = await bcrypt.hash("1234", saltRounds);
    const hashedPasswordSeller = await bcrypt.hash("1234", saltRounds);
    const hashedPasswordBuyer = await bcrypt.hash("1234", saltRounds);

    // Calculate join date (exactly 3 years ago)
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 4);

    return queryInterface.bulkInsert("Users", [
      {
        firstname: "admin",
        lastname: "diodone",
        email: "cedrotech1@gmail.com",
        phone: "0780000000",
        role: "admin",
        status: "active",
        password: hashedPasswordAdmin,
        gender: "Male",
        address: "huye/tumba",
         createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        firstname: "cedrick",
        lastname: "hakuzimana",
        email: "cedrickhakuzimana75@gmail.com",
        phone: "0784366616",
        role: "seller",
        status: "active",
        password: hashedPasswordSeller,
        gender: "Male",
        address: "Kigali, Rwanda",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        firstname: "cedrick",
        lastname: "hakuzimana",
        email: "cedrojoe@gmail.com",
        phone: "0783043021",
        role: "buyer",
        status: "active",
        password: hashedPasswordBuyer,
        gender: "Male",
        address: "Kigali, Rwanda",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Users", null, {});
  }
};
