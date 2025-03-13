'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check existing constraints
      const constraints = await queryInterface.sequelize.query(
        `SELECT constraint_name 
         FROM information_schema.table_constraints 
         WHERE table_name = 'Products' 
         AND constraint_name IN ('Products_userID_fkey', 'Products_categoryID_fkey')`
      );

      const existingConstraints = constraints[0].map(c => c.constraint_name);

      // Add userID foreign key if it doesn't exist
      if (!existingConstraints.includes('Products_userID_fkey')) {
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
      }

      // Add categoryID foreign key if it doesn't exist
      if (!existingConstraints.includes('Products_categoryID_fkey')) {
        await queryInterface.addConstraint('Products', {
          fields: ['categoryID'],
          type: 'foreign key',
          name: 'Products_categoryID_fkey',
          references: {
            table: 'Categories',
            field: 'id'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        });
      }
    } catch (error) {
      console.log('Migration skipped - constraints might already exist:', error.message);
    }

    // Make sure the status field can handle "In Stock" value
    await queryInterface.changeColumn('Products', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Pending Approval'
    });
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Remove constraints if they exist
      await queryInterface.sequelize.query(
        `DO $$ 
        BEGIN 
          IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Products_userID_fkey') THEN
            ALTER TABLE "Products" DROP CONSTRAINT "Products_userID_fkey";
          END IF;
          
          IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Products_categoryID_fkey') THEN
            ALTER TABLE "Products" DROP CONSTRAINT "Products_categoryID_fkey";
          END IF;
        END $$;`
      );
    } catch (error) {
      console.log('Rollback skipped - constraints might not exist:', error.message);
    }

    await queryInterface.changeColumn('Products', 'status', {
      type: Sequelize.STRING,
      allowNull: true
    });
  }
}; 