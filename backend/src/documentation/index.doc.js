import { name } from "ejs";
import { Router } from "express";
import { serve, setup } from "swagger-ui-express";

const docrouter = Router();

const options = {
  openapi: "3.0.1",
  info: {
    title: "FloraLink system APIs documentation",
    version: "1.0.0",
    description: "FloraLink system APIs documentation",
  },
  basePath: "/api",
  security: [
    {
      bearerAuth: [],
    },
  ],
  tags: [
    { name: "System Authontication", description: "" },
    { name: "Users", description: "Users" },
    { name: "product", description: "product" },
    { name: "categories", description: "categories" },
    { name: "notification", description: "notification" },
    { name: "message", description: "message" },
    { name: "order", description: "order" },
    { name: "payment", description: "payment" },

  ],
  paths: {
    "/api/v1/auth/login": {
      post: {
        tags: ["System Authontication"],
        summary: "Login a user",
        description: "Login a user",
        operationId: "loginUser",
        security: [],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/User",
              },
              example: {
                email: "admin@gmail.com",
                password: "admin",
              },
            },
            required: true,
          },
        },
        responses: {
          200: {
            description: "User logged in successfully",
          },
          400: {
            description: "Bad request",
          },
          401: {
            description: "Unauthorized",
          },
          500: {
            description: "Something went wrong",
          },
        },
      },
    },

    "/api/v1/users/addUser": {
      post: {
        tags: ["Users"],
        summary: "Add a user",
        description: "Add a user",
        operationId: "addOneUser",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/User",
              },
              example: {
                firstname: "John",
                lastname: "Doe",
                email: "test@example.com",
                phone: "08012345678",
                role: "buyer/seller",
                gender: "Male",
                address: "Gatsata",
  
              },
            },
            required: true,
          },
        },
        responses: {
          201: {
            description: "User created successfully",
          },
          400: {
            description: "Bad request",
          },
          401: {
            description: "Unauthorized",
          },
          500: {
            description: "Something went wrong",
          },
        },
      },
    },
    "/api/v1/users/signup": {
      post: {
        tags: ["Users"],
        summary: "Register account for user",
        description: "Register account for user",
        operationId: "registerUser",

        requestBody: {
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/User",
              },
              example: {
                firstname: "John",
                lastname: "Doe",
                email: "test@example.com",
                phone: "08012345678",
                role: "buyer/seller",
                password: "1234",
                confirmPassword: "1234",
                gender: "Male",
                address: "Gatsata",
                        
             
              },
            },
            required: true,
          },
        },
        responses: {
          201: {
            description: "User created successfully",
          },
          400: {
            description: "Bad request",
          },
          401: {
            description: "Unauthorized",
          },
          500: {
            description: "Something went wrong",
          },
        },
      },
    },



    "/api/v1/users": {
      get: {
        tags: ["Users"],
        summary: "Get all users",
        description: "Get all users",
        operationId: "getAllUsers",
        responses: {
          200: {
            description: "User deleted successfully",
          },
          400: {
            description: "Bad request",
          },
          401: {
            description: "Unauthorized",
          },
          404: {
            description: "User not found",
          },
          500: {
            description: "Something went wrong",
          },
        },
      },
    },

    "/api/v1/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "Get a user",
        description: "Get a user",
        operationId: "getOneUser",
        parameters: [
          {
            name: "id",
            in: "path",
            description: "User's id",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "User deleted successfully",
          },
          400: {
            description: "Bad request",
          },
          401: {
            description: "Unauthorized",
          },
          404: {
            description: "User not found",
          },
          500: {
            description: "Something went wrong",
          },
        },
      },
    },

    "/api/v1/users/update/{id}": {
      put: {
        tags: ["Users"],
        summary: "Update a user",
        description: "Update a user",
        operationId: "updateOneUser",
        parameters: [
          {
            name: "id",
            in: "path",
            description: "User's id",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/User",
              },
              example: {
                firstname: "John",
                lastname: "Doe",
                email: "test@example.com",
                phone: "08012345678",
                rank: "General",
                armyid: "1234576",
                joindate: "20000-05-20",  
              },
            },
            "multipart/form-data": {
              schema: {
                $ref: "#/components/schemas/User",
              },
            },
          },
        },
        responses: {
          200: {
            description: "User deleted successfully",
          },
          400: {
            description: "Bad request",
          },
          401: {
            description: "Unauthorized",
          },
          404: {
            description: "User not found",
          },
          500: {
            description: "Something went wrong",
          },
        },
      },
    },

    "/api/v1/users/changePassword": {
      put: {
        tags: ["Users"],
        summary: "change  user password",
        description: "change  user password  for current loged in user !! ",
        operationId: "change-passwordr",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/User",
              },
              example: {
                oldPassword: "oldp",
                newPassword: "newp",
                confirmPassword: "cpass",
               
              },
            },
          },
        },
        responses: {
          200: {
            description: "User password updated  successfully",
          },
          400: {
            description: "Bad request",
          },
          401: {
            description: "Unauthorized",
          },
          404: {
            description: "User not found",
          },
          500: {
            description: "Something went wrong",
          },
        },
      },
    },

    "/api/v1/users/check": {
      post: {
        tags: ["Users"],
        summary: "Get  users user by email by email and send code",
        description: "Get all users",
        operationId: "getAllUserscheck",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/User",
              },
              example: {
                email: "cedrickhakuzimana.com",                    
              },
            },
            required: true,
          },
        },
        responses: {
          200: {
            description: "User retrived successfully",
          },
          400: {
            description: "Bad request",
          },
          401: {
            description: "Unauthorized",
          },
          404: {
            description: "User not found",
          },
          500: {
            description: "Something went wrong",
          },
        },
      },
    },

    "/api/v1/users/code/{email}": {
      post: {
        tags: ["Users"],
        summary: "check code !",
        description: "checking code send thrugth email",
        operationId: "code",
        parameters: [
          {
            name: "email",
            in: "path",
            description: "User's email",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/User",
              },
              example: {
                code: "10000",                    
              },
            },
            required: true,
          },
        },
        responses: {
          200: {
            description: "User retrived successfully",
          },
          400: {
            description: "Bad request",
          },
          401: {
            description: "Unauthorized",
          },
          404: {
            description: "User not found",
          },
          500: {
            description: "Something went wrong",
          },
        },
      },
    },

    "/api/v1/users/resetPassword/{email}": {
      put: {
        tags: ["Users"],
        summary: "reset  user password",
        description: "reset  user password  !! ",
        operationId: "reset-passwordr",
        parameters: [
          {
            name: "email",
            in: "path",
            description: "User's email",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/User",
              },
              example: {
                newPassword: "newp",
                confirmPassword: "cpass",
               
              },
            },
          },
        },
        responses: {
          200: {
            description: "User password updated  successfully",
          },
          400: {
            description: "Bad request",
          },
          401: {
            description: "Unauthorized",
          },
          404: {
            description: "User not found",
          },
          500: {
            description: "Something went wrong",
          },
        },
      },
    },



    "/api/v1/users/delete/{id}": {
      delete: {
        tags: ["Users"],
        summary: "Delete a user",
        description: "Delete a user",
        operationId: "deleteOneUser",
        parameters: [
          {
            name: "id",
            in: "path",
            description: "User's id",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "User deleted successfully",
          },
          400: {
            description: "Bad request",
          },
          401: {
            description: "Unauthorized",
          },
          404: {
            description: "User not found",
          },
          500: {
            description: "Something went wrong",
          },
        },
      },
    },

    "/api/v1/users/activate/{id}": {
      put: {
        tags: ["Users"],
        summary: "Activate a user",
        description: "Activate a user",
        operationId: "activateOneUser",
        parameters: [
          {
            name: "id",
            in: "path",
            description: "User's id",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "User activated successfully",
          },
          400: {
            description: "Bad request",
          },
          401: {
            description: "Unauthorized",
          },
          404: {
            description: "User not found",
          },
          500: {
            description: "Something went wrong",
          },
        },
      },
    },
    "/api/v1/users/deactivate/{id}": {
      put: {
        tags: ["Users"],
        summary: "Deactivate a user",
        description: "Deactivate a user",
        operationId: "deactivateOneUser",
        parameters: [
          {
            name: "id",
            in: "path",
            description: "User's id",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "User deactivated successfully",
          },
          400: {
            description: "Bad request",
          },
          401: {
            description: "Unauthorized",
          },
          404: {
            description: "User not found",
          },
          500: {
            description: "Something went wrong",
          },
        },
      },
    },

    
    "/api/v1/users/admin/overview": {
      get: {
        tags: ["Users"],
        summary: "Get admin overview",
        description: "Get all overview",
        operationId: "adminoverview",
        responses: {
          200: {
            description: "User deleted successfully",
          },
          400: {
            description: "Bad request",
          },
          401: {
            description: "Unauthorized",
          },
          404: {
            description: "User not found",
          },
          500: {
            description: "Something went wrong",
          },
        },
      },
    },

    "/api/v1/users/seller/overview": {
      get: {
        tags: ["Users"],
        summary: "Get admin overview",
        description: "Get all overview",
        operationId: "adminoverview",
        responses: {
          200: {
            description: "User deleted successfully",
          },
          400: {
            description: "Bad request",
          },
          401: {
            description: "Unauthorized",
          },
          404: {
            description: "User not found",
          },
          500: {
            description: "Something went wrong",
          },
        },
      },
    },
   

    "/api/v1/users/buyer/overview": {
      get: {
        tags: ["Users"],
        summary: "Get admin overview",
        description: "Get all overview",
        operationId: "adminoverview",
        responses: {
          200: {
            description: "User deleted successfully",
          },
          400: {
            description: "Bad request",
          },
          401: {
            description: "Unauthorized",
          },
          404: {
            description: "User not found",
          },
          500: {
            description: "Something went wrong",
          },
        },
      },
    },

    "/api/v1/users/seller/salles-report": {
      get: {
        tags: ["Users"],
        summary: "Get admin overview",
        description: "Get all overview",
        operationId: "adminoverview",
        responses: {
          200: {
            description: "User deleted successfully",
          },
          400: {
            description: "Bad request",
          },
          401: {
            description: "Unauthorized",
          },
          404: {
            description: "User not found",
          },
          500: {
            description: "Something went wrong",
          },
        },
      },
    },
   
   
   






    "/api/v1/product/add": {
      post: {
        tags: ["product"],
        summary: "Add a product",
        description: "Add a product",
        operationId: "addproduct",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/product",
              },
              example: {
                categoryID: "1",
                name: "huye/ngoma",
                description: "descri.......",
                price: "2000",
                quantity: "2",
                              
              },
            },
            "multipart/form-data": {
              schema: {
                $ref: "#/components/schemas/product",
              },
            },
            required: true,
          },
        },
        responses: {
          201: {
            description: "product created successfully",
          },
          400: {
            description: "Bad request",
          },
          401: {
            description: "Unauthorized",
          },
          500: {
            description: "Something went wrong",
          },
        },
      },
    },
    "/api/v1/product/add/{id}": {
      post: {
        tags: ["product"],
        summary: "Add a product for others",
        description: "Add a product",
        operationId: "addotherproduct",
        parameters: [
          {
            name: "id",
            in: "path",
            description: "product's id",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/product",
              },
              example: {
                categoryID: "1",
                name: "huye/ngoma",
                description: "descri.......",
               
              },
            },
            "multipart/form-data": {
              schema: {
                $ref: "#/components/schemas/product",
              },
            },
            required: true,
          },
        },
        responses: {
          201: {
            description: "product created successfully",
          },
          400: {
            description: "Bad request",
          },
          401: {
            description: "Unauthorized",
          },
          500: {
            description: "Something went wrong",
          },
        },
      },
    },
    "/api/v1/product/": {
      get: {
        tags: ["product"],
        summary: "Get a product",
        description: "Get a product",
        operationId: "getOneproduct",
    
        responses: {
          200: {
            description: "User deleted successfully",
          },
          400: {
            description: "Bad request",
          },
          401: {
            description: "Unauthorized",
          },
          404: {
            description: "User not found",
          },
          500: {
            description: "Something went wrong",
          },
        },
      },
    },
    "/api/v1/product/outofstock": {
      get: {
        tags: ["product"],
        summary: "Get a outofstock product",
        description: "Get a outofstock product",
        operationId: "getoutofstockproduct",

        responses: {
          200: {
            description: "outofstock retrieved successfully",
          },
          400: {
            description: "Bad request",
          },
          401: {
            description: "Unauthorized",
          },
          404: {
            description: "User not found",
          },
          500: {
            description: "Something went wrong",
          },
        },
      },
    },
    "/api/v1/product/instock": {
      get: {
        tags: ["product"],
        summary: "Get a instock product",
        description: "Get a instock product",
        operationId: "instock",

        responses: {
          200: {
            description: "instock retrieved successfully",
          },
          400: {
            description: "Bad request",
          },
          401: {
            description: "Unauthorized",
          },
          404: {
            description: "User not found",
          },
          500: {
            description: "Something went wrong",
          },
        },
      },
    },
    "/api/v1/product/users_statistics": {
      get: {
        tags: ["product"],
        summary: "Get a user product",
        description: "Get a user product",
        operationId: "user",

        responses: {
          200: {
            description: "user product retrieved successfully",
          },
          400: {
            description: "Bad request",
          },
          401: {
            description: "Unauthorized",
          },
          404: {
            description: "User not found",
          },
          500: {
            description: "Something went wrong",
          },
        },
      },
    },
    "/api/v1/product/user/{id}": {
      get: {
        tags: ["product"],
        summary: "Get a user products",
        description: "Get a user products",
        operationId: "user",
        parameters: [
          {
            name: "id",
            in: "path",
            description: "product's id",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "user product retrieved successfully",
          },
          400: {
            description: "Bad request",
          },
          401: {
            description: "Unauthorized",
          },
          404: {
            description: "User not found",
          },
          500: {
            description: "Something went wrong",
          },
        },
      },
    },
    "/api/v1/product/delete/{id}": {
      delete: {
        tags: ["product"],
        summary: "delete a product",
        description: "delete a product",
        operationId: "deleteOneproduct",
        parameters: [
          {
            name: "id",
            in: "path",
            description: "product's id",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "product deleted successfully",
          },
          400: {
            description: "Bad request",
          },
          401: {
            description: "Unauthorized",
          },
          404: {
            description: "User not found",
          },
          500: {
            description: "Something went wrong",
          },
        },
      },
    },
 
    "/api/v1/product/update/{id}": {
      put: {
        tags: ["product"],
        summary: "Add a product",
        description: "Add a product",
        operationId: "updateproduct",
        parameters: [
          {
            name: "id",
            in: "path",
            description: "product's id",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/product",
              },
              example: {
                categoryID: "1",
                name: "huye/ngoma",
                description: "descri.......",
                price: "2000",
                quantity: "2",
               
              },
            },
            "multipart/form-data": {
              schema: {
                $ref: "#/components/schemas/product",
              },
            },
            required: true,
          },
        },
        responses: {
          201: {
            description: "product created successfully",
          },
          400: {
            description: "Bad request",
          },
          401: {
            description: "Unauthorized",
          },
          500: {
            description: "Something went wrong",
          },
        },
      },
    },
    "/api/v1/product/one/{id}": {
      get: {
        tags: ["product"],
        summary: "Get a product",
        description: "Get a product",
        operationId: "getOneproduct",
        parameters: [
          {
            name: "id",
            in: "path",
            description: "product's id",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "product deleted successfully",
          },
          400: {
            description: "Bad request",
          },
          401: {
            description: "Unauthorized",
          },
          404: {
            description: "User not found",
          },
          500: {
            description: "Something went wrong",
          },
        },
      },
    },
    "/api/v1/product/activate/{id}": {
      put: {
        tags: ["product"],
        summary: "activate a product",
        description: "activate a product",
        operationId: "activateOneproduct",
        parameters: [
          {
            name: "id",
            in: "path",
            description: "product's id",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],

        responses: {
          200: {
            description: "product activated successfully",
          },
          400: {
            description: "Bad request",
          },
          401: {
            description: "Unauthorized",
          },
          404: {
            description: "User not found",
          },
          500: {
            description: "Something went wrong",
          },
        },
      },
    },
    "/api/v1/product/disactivate/{id}": {
      put: {
        tags: ["product"],
        summary: "disactivate a product",
        description: "disactivate a product",
        operationId: "disactivateproduct",
        parameters: [
          {
            name: "id",
            in: "path",
            description: "product's id",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],

        responses: {
          200: {
            description: "product disactivated successfully",
          },
          400: {
            description: "Bad request",
          },
          401: {
            description: "Unauthorized",
          },
          404: {
            description: "User not found",
          },
          500: {
            description: "Something went wrong",
          },
        },
      },
    },



    "/api/v1/notification/": {
      get: {
        tags: ["notification"],
        summary: "Get a notification",
        description: "Get a notification",
        operationId: "getOneNotification",
    
        responses: {
          200: {
            description: " notifications retrieved successfully",
          },
          400: {
            description: "Bad request",
          },
          401: {
            description: "Unauthorized",
          },
          404: {
            description: "User not found",
          },
          500: {
            description: "Something went wrong",
          },
        },
      },
    },

    "/api/v1/notification/read-all": {
      put: {
        tags: ["notification"],
        summary: "mark read a notification",
        description: "read notification",
        operationId: "getreadNotification",
  
        responses: {
          200: {
            description: " notifications marhed as read successfully",
          },
          400: {
            description: "Bad request",
          },
          401: {
            description: "Unauthorized",
          },
          404: {
            description: "User not found",
          },
          500: {
            description: "Something went wrong",
          },
        },
      },
    },

    "/api/v1/notification/read/{id}": {
      put: {
        tags: ["notification"],
        summary: "mark one read a notification",
        description: "read one notification",
        operationId: "onereadNotification",
        parameters: [
          {
            name: "id",
            in: "path",
            description: "notification's id",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
  
        responses: {
          200: {
            description: "notifications marhed as read successfully",
          },
          400: {
            description: "Bad request",
          },
          401: {
            description: "Unauthorized",
          },
          404: {
            description: "User not found",
          },
          500: {
            description: "Something went wrong",
          },
        },
      },
    },

    "/api/v1/notification/read/{id}": {
      put: {
        tags: ["notification"],
        summary: "read all a notification",
        description: "read all notification",
        operationId: "read_all_notification",
        parameters: [
          {
            name: "id",
            in: "path",
            description: "notification's id",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],

  
        responses: {
          200: {
            description: "notifications marhed as read successfully",
          },
          400: {
            description: "Bad request",
          },
          401: {
            description: "Unauthorized",
          },
          404: {
            description: "User not found",
          },
          500: {
            description: "Something went wrong",
          },
        },
      },
    },

    "/api/v1/notification/delete/{id}": {
      delete: {
        tags: ["notification"],
        summary: "delete a notification",
        description: "delete a notification",
        operationId: "deleteOnenotification",
        parameters: [
          {
            name: "id",
            in: "path",
            description: "notification's id",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],

       
        responses: {
          200: {
            description: "notification deleted successfully",
          },
          400: {
            description: "Bad request",
          },
          401: {
            description: "Unauthorized",
          },
          404: {
            description: "User not found",
          },
          500: {
            description: "Something went wrong",
          },
        },
      },
    },
    "/api/v1/notification/delete-all": {
      delete: {
        tags: ["notification"],
        summary: "delete all notification",
        description: "delete all notification",
        operationId: "deleteALLnotification",
        responses: {
          200: {
            description: "notification deleted successfully",
          },
          400: {
            description: "Bad request",
          },
          401: {
            description: "Unauthorized",
          },
          404: {
            description: "User not found",
          },
          500: {
            description: "Something went wrong",
          },
        },
      },
    },


    "/api/v1/categories/add": {
      post: {
        tags: ["categories"],
        summary: "Add a department",
        description: "Add a department",
        operationId: "adddepartment",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/categories",
              },
              // example: {
              //   name: "obina",
              //   address: "huye/ngoma",
              //   description: "restourent descri.......",
               
              // },
            },
            required: true,
          },
        },
        responses: {
          201: {
            description: "User created successfully",
          },
          400: {
            description: "Bad request",
          },
          401: {
            description: "Unauthorized",
          },
          500: {
            description: "Something went wrong",
          },
        },
      },
    },
    "/api/v1/categories/": {
      get: {
        tags: ["categories"],
        summary: "Get a categories",
        description: "Get a categories",
        operationId: "getOnecategory",
    
        responses: {
          200: {
            description: "categories deleted successfully",
          },
          400: {
            description: "Bad request",
          },
          401: {
            description: "Unauthorized",
          },
          404: {
            description: "User not found",
          },
          500: {
            description: "Something went wrong",
          },
        },
      },
    },
    "/api/v1/categories/delete/{id}": {
      delete: {
        tags: ["categories"],
        summary: "delete a categories",
        description: "delete a categories",
        operationId: "deleteOnecategories",
        parameters: [
          {
            name: "id",
            in: "path",
            description: "Restaurent's id",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "User deleted successfully",
          },
          400: {
            description: "Bad request",
          },
          401: {
            description: "Unauthorized",
          },
          404: {
            description: "User not found",
          },
          500: {
            description: "Something went wrong",
          },
        },
      },
    },
    "/api/v1/categories/{id}": {
      put: {
        tags: ["categories"],
        summary: "Update a categories",
        description: "Update a categories",
        operationId: "updateOnecategories",
        parameters: [
          {
            name: "id",
            in: "path",
            description: "categories's id",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/categories",
              },
              // example: {
              //   firstname: "John",
              //   lastname: "Doe",
              //   email: "test@example.com",
              //   phone: "08012345678",
              // },
            },
          },
        },
        responses: {
          200: {
            description: "categories updated successfully",
          },
          400: {
            description: "Bad request",
          },
          401: {
            description: "Unauthorized",
          },
          404: {
            description: "User not found",
          },
          500: {
            description: "Something went wrong",
          },
        },
      },
    },
    "/api/v1/categories/one/{id}": {
      get: {
        tags: ["categories"],
        summary: "Get a categories",
        description: "Get a categories",
        operationId: "getOnecategories",
        parameters: [
          {
            name: "id",
            in: "path",
            description: "categories's id",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "categories deleted successfully",
          },
          400: {
            description: "Bad request",
          },
          401: {
            description: "Unauthorized",
          },
          404: {
            description: "User not found",
          },
          500: {
            description: "Something went wrong",
          },
        },
      },
    },

    // message
    "/api/v1/message/add/{id}": {
      post: {
        tags: ["message"],
        summary: "message a user",
        description: "Add a message",
        operationId: "addmessage",
        parameters: [
          {
            name: "id",
            in: "path",
            description: "receiver's id",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],

        requestBody: {
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/message",
              },
              example: {
                message: "hello",               
              },
            },
            required: true,
          },
        },
        responses: {
          201: {
            description: "message created successfully",
          },
          400: {
            description: "Bad request",
          },
          401: {
            description: "Unauthorized",
          },
          500: {
            description: "Something went wrong",
          },
        },
      },
    },
    "/api/v1/message/{id}": {
      get: {
        tags: ["message"],
        summary: "Get a message",
        description: "Get a message",
        operationId: "getmessages",
        parameters: [
          {
            name: "id",
            in: "path",
            description: "receiver's id",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
    
        responses: {
          200: {
            description: "messages retrieved successfully",
          },
          400: {
            description: "Bad request",
          },
          401: {
            description: "Unauthorized",
          },
          404: {
            description: "User not found",
          },
          500: {
            description: "Something went wrong",
          },
        },
      },
    },

     // order
     "/api/v1/order/add": {
      post: {
        tags: ["order"],
        summary: "order a user",
        description: "Add a order",
        operationId: "addorder",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/order",
              },
              example: {
                productId: 1,  
                quantity: "2",  
             
              },
            },
            required: true,
          },
        },
        responses: {
          201: {
            description: "message created successfully",
          },
          400: {
            description: "Bad request",
          },
          401: {
            description: "Unauthorized",
          },
          500: {
            description: "Something went wrong",
          },
        },
      },
    },
    "/api/v1/order/checkout/{id}": {
      post: {
        tags: ["order"],
        summary: "order a checkout",
        description: "Add a checkout",
        operationId: "checkout",
        parameters: [
          {
            name: "id",
            in: "path",
            description: "order's id",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
    
        responses: {
          201: {
            description: "checkout created successfully",
          },
          400: {
            description: "Bad request",
          },
          401: {
            description: "Unauthorized",
          },
          500: {
            description: "Something went wrong",
          },
        },
      },
    },

    "/api/v1/order/status/{id}": {
      put: {
        tags: ["order"],
        summary: "order a status",
        description: "Add a status",
        operationId: "statusorder",
        parameters: [
          {
            name: "id",
            in: "path",
            description: "order's id",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],

        requestBody: {
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/order",
              },
              example: {

                status: "shipped",  
             
              },
            },
            required: true,
          },
        },
        responses: {
          201: {
            description: "message created successfully",
          },
          400: {
            description: "Bad request",
          },
          401: {
            description: "Unauthorized",
          },
          500: {
            description: "Something went wrong",
          },
        },
      },
    },
    
    "/api/v1/order/one/{id}": {
      get: {
        tags: ["order"],
        summary: "get order",
        description: "geting one order",
        operationId: "oneorder",
        parameters: [
          {
            name: "id",
            in: "path",
            description: "order's id",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "order retrieved successfully",
          },
          400: {
            description: "Bad request",
          },
          401: {
            description: "Unauthorized",
          },
          500: {
            description: "Something went wrong",
          },
        },
      },
    },
    "/api/v1/order": {
      get: {
        tags: ["order"],
        summary: "Get a order",
        description: "Get a order",
        operationId: "getorder",

        responses: {
          200: {
            description: "order retrieved successfully",
          },
          400: {
            description: "Bad request",
          },
          401: {
            description: "Unauthorized",
          },
          404: {
            description: "User not found",
          },
          500: {
            description: "Something went wrong",
          },
        },
      },
    },
    "/api/v1/payment": {
      get: {
        tags: ["payment"],
        summary: "Get a payment",
        description: "Get a payment",
        operationId: "payment",
        responses: {
          200: {
            description: "payment retrieved successfully",
          },
          400: {
            description: "Bad request",
          },
          401: {
            description: "Unauthorized",
          },
          404: {
            description: "User not found",
          },
          500: {
            description: "Something went wrong",
          },
        },
      },
    },


       

  },

  components: {
    schemas: {
      User: {
        type: "object",
        properties: {
          firstname: {
            type: "string",
            description: "User's firstname",
          },
          lastname: {
            type: "string",
            description: "User's lastname",
          },
          username: {
            type: "string",
            description: "User's names",
          },
          gender: {
            type: "string",
            description: "User's gender",
          },
          dob: {
            type: "string",
            description: "User's date of birth",
          },
          address: {
            type: "string",
            description: "User's address",
          },
          phone: {
            type: "string",
            description: "User's phone number",
          },
          role: {
            type: "string",
            description: "User's role",
          },

          image: {
            type: "string",
            description: "User's product image",
            format: "binary",
          },
          email: {
            type: "string",
            description: "User's email",
          },
          password: {
            type: "string",
            description: "User's password",
          },
          confirm_password: {
            type: "string",
            description: "User's confirm password",
          },
        },
      },
      product: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "product name",
          },
          categoryID: {
            type: "integer",
            description: "category integer",
          },
          description: {
            type: "string",
            description: "product's description",
          },
          image: {
            type: "string",
            description: "product image",
            format: "binary",
          },
          price: {
            type: "string",
            description: "product price",
          },

          quantity: { 
            type: "string",
            description: "product quantity",
          },



        },
      },
    
      categories: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "name address",
          },
         
        },
      },
      message: {
        type: "object",
        properties: {
          message: {
            type: "string",
            description: "message",
          },
         
        },
      },

    
    },

    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
};

docrouter.use("/", serve, setup(options));

export default docrouter;
