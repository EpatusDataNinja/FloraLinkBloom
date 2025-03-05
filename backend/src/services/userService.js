import bcrypt from "bcryptjs";
import db from "../database/models/index.js";
const users = db["Users"];
const Products = db["Products"];
const Notifications = db["Notifications"];
const Categories = db["Categories"];


import Sequelize, { where } from "sequelize";

export const getUsers = async () => {
  try {
    const allUsers = await users.findAll({
      attributes: { exclude: ["password"] },
      // include: [
      //   {
      //     model: ProfileDetails,
      //     as: "Products",  
      //     include: [
      //       {
      //         model: ProfileCategories,
      //         as: "category", 
      //       },
      //     ],

      //   },
      //   {
      //     model: Notifications,
      //     as: "notifications",
      //   },
  
        
      // ],
    });

    return allUsers;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

export const getUsers1 = async () => {
  try {
    const allUsers = await users.findAll({
      where:{role:'user'},
      attributes: { exclude: ["password"] },
      // include: [
      //   {
      //     model: ProfileDetails,
      //     as: "ProfileDetails",  
      //     include: [
      //       {
      //         model: ProfileCategories,
      //         as: "category", 
      //       },
      //     ],

      //   },
      //   {
      //     model: Missions,
      //     as: "missions",
      //   },
      //   {
      //     model: Appointments,
      //     as: "appointments",
      //   },
      
      //   {
      //     model: Notifications,
      //     as: "notifications",
      //   },
      //   {
      //     model: Department,
      //     as: "department",
      //     include: [
      //       {
      //         model: users,
      //         as: "reader",
      //         attributes: { exclude: ["password"] }, // Exclude password
      //       },
      //     ],
      //   },
        
      // ],
    });

    return allUsers;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
};



export const createUser = async (user) => {
  // hashing password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  const newUser = await users.create(user);
  return newUser;
};

export const createUserCustomer = async (user) => {
  // hashing password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  const newUser = await users.create(user);
  return newUser;
};

export const getUser = async (id) => {
  const user = await users.findByPk(id, {
    attributes: { exclude: ["password"] },
    // include: [
    //   {
    //     model: ProfileDetails,
    //     as: "ProfileDetails",  
    //     include: [
    //       {
    //         model: ProfileCategories,
    //         as: "category", 
    //       },
    //     ],

    //   },
    //   {
    //     model: Missions,
    //     as: "missions",
    //   },
    //   {
    //     model: Appointments,
    //     as: "appointments",
    //   },
    
    //   {
    //     model: Notifications,
    //     as: "notifications",
    //   },
    //   {
    //     model: Department,
    //     as: "department",
    //     include: [
    //       {
    //         model: users,
    //         as: "reader",
    //       },
    //     ],
    //   },
      
    // ],
  });
  return user;
};
export const GetUserPassword = async (id) => {
  const user = await users.findByPk(id, {
    attributes: ['password'],
  });
  return user ? user.password : null;
};

export const getUserByEmail = async (email) => {
  try {
    const user = await users.findOne({
      where: { email },
    });

    return user;
  } catch (error) {
    // Handle errors here
    console.error("Error fetching user:", error);
    throw error;
  }
};





export const getUserByPhone = async (phone) => {
  try {
    const user = await users.findOne({
      where: { phone }

    });

    return user;
  } catch (error) {
    // Handle errors here
    console.error("Error fetching user:", error);
    throw error;
  }
};



export const getallUsers = async () => {
  const allUsers = await users.findAll({
    // where: { restaurents },
    attributes: { exclude: ["password"] },
  });
  return allUsers;
};



export const updateUser = async (id, user) => {
  try {
    console.log('=== Starting User Update Process ===');
    console.log('User ID to update:', id);
    console.log('Update data:', JSON.stringify(user, null, 2));
    
    // First check if user exists
    const userToUpdate = await users.findByPk(id);
    if (!userToUpdate) {
      console.log('ERROR: User not found with ID:', id);
      return null;
    }
    console.log('Found existing user:', JSON.stringify(userToUpdate.toJSON(), null, 2));
    
    // Perform the update
    console.log('Attempting to update user with data:', JSON.stringify(user, null, 2));
    const [updatedCount, updatedRows] = await users.update(user, { 
      where: { id },
      returning: true // This will return the updated rows
    });
    
    console.log('Update operation result:', {
      updatedCount,
      updatedRows: updatedRows ? updatedRows[0].toJSON() : null
    });
    
    if (updatedCount > 0) {
      // Get the updated user
      const updatedUser = await users.findByPk(id);
      console.log('Successfully updated user:', JSON.stringify(updatedUser.toJSON(), null, 2));
      return updatedUser.toJSON();
    }
    
    console.log('No rows were updated');
    return null;
  } catch (error) {
    console.error('=== Error in updateUser ===');
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);
    throw error;
  }
};

export const deleteUser = async (id) => {
  const userToDelete = await users.findOne({ where: { id } });
  if (userToDelete) {
    await users.destroy({ where: { id } });
    return userToDelete;
  }
  return null;
};

export const activateUser = async (id) => {
  const userToActivate = await users.findOne(
    { where: { id } },
    { attributes: { exclude: ["password"] } }
  );
  if (userToActivate) {
    await users.update({ status: "active" }, { where: { id } });
    return userToActivate;
  }
  return null;
};

export const deactivateUser = async (id) => {
  const userToDeactivate = await users.findOne(
    { where: { id } },
    { attributes: { exclude: ["password"] } }
  );
  if (userToDeactivate) {
    await users.update({ status: "inactive" }, { where: { id } });
    return userToDeactivate;
  }
  return null;
};


export const updateUserCode = async (email, user) => {
  const userToUpdate = await users.findOne(
    { where: { email } },
    { attributes: { exclude: ["password"] } }
  );
  if (userToUpdate) {
    await users.update(user, { where: { email } });
    return user;
  }
  return null;
};
export const getUserByCode = async (email,code) => {
  try {
    const user = await users.findOne(
      {
        where: { code: code ,email:email},
      }
    );

    return user;
  } catch (error) {
    // Handle errors here
    console.error("Error fetching user:", error);
    throw error;
  }
};