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
        lastname: "floralink",
        email: "floralink.2025@gmail.com",
        phone: "0771384741",
        role: "admin",
        status: "active",
        password: hashedPasswordAdmin,
        gender: "Male",
        address: "Kigali, Rwanda",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        firstname: "Joanna",
        lastname: "Lebbie",
        email: "tituslebbie@rocketmail.com",
        phone: "0790336714",
        role: "seller",
        status: "active",
        password: hashedPasswordSeller,
        gender: "Female",
        address: "Kigali, Rwanda",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        firstname: "Epatus",
        lastname: "Lebbie",
        email: "lebbie1.titus14@gmail.com",
        phone: "0791503966",
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
