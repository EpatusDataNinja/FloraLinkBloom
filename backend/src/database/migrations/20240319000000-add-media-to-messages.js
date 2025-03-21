'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Messages', 'mediaType', {
      type: Sequelize.ENUM('text', 'image', 'video', 'audio', 'document'),
      defaultValue: 'text',
      allowNull: false
    });

    await queryInterface.addColumn('Messages', 'mediaUrl', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('Messages', 'fileName', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('Messages', 'fileSize', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Messages', 'mediaType');
    await queryInterface.removeColumn('Messages', 'mediaUrl');
    await queryInterface.removeColumn('Messages', 'fileName');
    await queryInterface.removeColumn('Messages', 'fileSize');
  }
}; 