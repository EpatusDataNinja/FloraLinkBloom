'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('Products', {
      fields: ['userID'],
      type: 'foreign key',
      name: 'Products_userID_fkey',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('Products', {
      fields: ['categoryID'],
      type: 'foreign key',
      name: 'Products_categoryID_fkey',
      references: {
        table: 'Categories',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    // Make sure the status field can handle "In Stock" value
    await queryInterface.changeColumn('Products', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Pending Approval'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('Products', 'Products_userID_fkey');
    await queryInterface.removeConstraint('Products', 'Products_categoryID_fkey');
    
    await queryInterface.changeColumn('Products', 'status', {
      type: Sequelize.STRING,
      allowNull: true
    });
  }
}; 