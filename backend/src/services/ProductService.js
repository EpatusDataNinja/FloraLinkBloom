import { Sequelize } from 'sequelize';
import db from "../database/models/index.js";
const users = db["Users"];
const Products = db["Products"];
const Notifications = db["Notifications"];
const Categories = db["Categories"];

export const getuserproduct = async (userID) => {
  try {
    const Info = await Products.findAll({
      where: { userID: userID, status: "In Stock" }, 
      include: [
        {
          model: Categories,
          as: "category",
        }
      ],
    });

    return Info;
  } catch (error) {
    console.error("Error fetching profile details for user:", error);
    throw error;
  }
};

export const getOneProductsWithDetails = async (id) => {
  try {
    const info = await Products.findByPk(id,{
      include: [
        {
          model: Categories,
          as: "category",
        }
      ],

    });

    return info;
  } catch (error) {
    console.error("Error fetching all restaurants with users:", error);
    throw error;
  }
};

export const generalproducts = async (userID) => {
  try {
    const Info = await Products.findAll({
     include: [
        {
          model: Categories,
          as: "category",
        }
      ],   
    }
      
    );

    return Info;
  } catch (error) {
    console.error("Error fetching profile details for user:", error);
    throw error;
  }
};

export const generalproducts_available = async () => {
  try {
    const Info = await Products.findAll({
      where: { status: "In Stock"},
      include: [
        {
          model: Categories,
          as: "category",
        }
      ],   
    }
      
    );

    return Info;
  } catch (error) {
    console.error("Error fetching profile details for user:", error);
    throw error;
  }
};

// buyeroutofstock

export const outstock = async () => {
  try {
    const Info = await Products.findAll({
      where: {status: "Out of Stock"}, 
      include: [
        {
          model: Categories,
          as: "category",
        }
      ],
    });

    return Info;
  } catch (error) {
    console.error("Error fetching profile details for user:", error);
    throw error;
  }
};

export const instock = async (userID) => {
  try {
    const Info = await Products.findAll({
      where: {status: "In Stock"}, 
      include: [
        {
          model: Categories,
          as: "category",
        }
      ],
    });

    return Info;
  } catch (error) {
    console.error("Error fetching profile details for user:", error);
    throw error;
  }
};

export const getAllProductses = async (userID) => {
  try {
    const Info = await Products.findAll({
      where: { userID }, 
      include: [
        {
          model: Categories,
          as: "category",
        }
      ],
    });

    return Info;
  } catch (error) {
    console.error("Error fetching profile details for user:", error);
    throw error;
  }
};

export const createProducts = async (ProductsData) => {
  try {
    return await Products.create(ProductsData);
  } catch (error) {
    throw new Error(`Error creating Products: ${error.message}`);
  }
};

export const checkExistingProducts = async (name,id) => {
  return await Products.findOne({
    where: {
      name:name,
      userID: id,
    },
  });
};

// export const getAllProductses = async () => {
//   return await ProductsModel.findAll();
// };

export const deleteOneProducts = async (id) => {
  const restToDelete = await Products.findOne({ where: { id } });
  if (restToDelete) {
    await Products.destroy({ where: { id } });
    return restToDelete;
  }
  return null;
};


export const updateOne = async (id, data) => {
  const dataToUpdate = await Products.findOne({ where: { id } });
  if (dataToUpdate) {
    await Products.update(data, { where: { id } });
    return data;
  }
  return null;
};

export const status_change = async (id,status) => {
  const restoToUpdate = await Products.findOne({ where: { id } });
  if (restoToUpdate) {
   const updatedone= await Products.update({ status: status }, { where: { id } });
    return updatedone;
  }
  return null;
};



