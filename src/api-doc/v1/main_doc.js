export default {
  "openapi": "3.0.0",
  "info": {
    "title": "Task Manager API",
    "description": "API documentation for the Task Manager with Auth, User, Project, and Task endpoints",
    "version": "1.0.0"
  },
  "servers": [
    {
      "url": "http://localhost:3000/api/v1",
      "description": "Local server"
    }
  ],
  "components": {
    "securitySchemes": {
      "bearerAuth": {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT"
      }
    },
    "schemas": {
      "User": {
        "type": "object",
        "properties": {
          "id": { "type": "integer", "example": 1 },
          "name": { "type": "string", "example": "Jane Doe" },
          "email": { "type": "string", "example": "jane@example.com" }
        }
      },
      "Project": {
        "type": "object",
        "properties": {
          "id": { "type": "integer", "example": 1 },
          "name": { "type": "string", "example": "Project Alpha" },
          "description": { "type": "string", "example": "Description of the project" }
        }
      },
      "Task": {
        "type": "object",
        "properties": {
          "id": { "type": "integer", "example": 1 },
          "title": { "type": "string", "example": "Implement endpoint" },
          "description": { "type": "string", "example": "Implement the POST /tasks" },
          "status": { "type": "string", "example": "pending" },
          "dueDate": { "type": "string", "format": "date-time" },
          "projectId": { "type": "integer", "example": 1 }
        }
      }
    }
  },
  
  "paths": {
    "/auth/register": {
      "post": {
        "summary": "Register a new user",
        "tags": ["Auth"],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["name", "email", "password"],
                "properties": {
                  "name": { "type": "string" },
                  "email": { "type": "string" },
                  "password": { "type": "string" }
                }
              }
            }
          }
        },
        "responses": {
          "201": { "description": "User registered" },
          "500": { "description": "Server error" }
        }
      }
    },
    "/auth/login": {
      "post": {
        "summary": "User login",
        "tags": ["Auth"],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["email", "password"],
                "properties": {
                  "email": { "type": "string" },
                  "password": { "type": "string" }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Successful login",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "token": { "type": "string" },
                    "refreshToken": { "type": "string" }
                  }
                }
              }
            }
          },
          "401": { "description": "Unauthorized" }
        }
      }
    },

    "/auth/refresh": {
  "post": {
    "summary": "Refresh JWT tokens",
    "tags": ["Auth"],
    "requestBody": {
      "required": true,
      "content": {
        "application/json": {
          "schema": {
            "type": "object",
            "properties": {
              "refreshToken": {
                "type": "string",
                "example": "eyJhbGciOiJIUzI1NiIsInR5..."
              }
            },
            "required": ["refreshToken"]
          }
        }
      }
    },
    "responses": {
      "200": {
        "description": "New access and refresh tokens generated",
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "accessToken": {
                  "type": "string",
                  "example": "eyJhbGciOiJIUzI1NiIsInR5..."
                },
                "refreshToken": {
                  "type": "string",
                  "example": "eyJhbGciOiJIUzI1NiIsInR5..."
                }
              }
            }
          }
        }
      },
      "401": {
        "description": "No refresh token provided or invalid"
      },
      "403": {
        "description": "Invalid or expired refresh token"
      },
      "500": {
        "description": "Server error"
      }
    }
  }
},
    "/users": {
      "get": {
        "summary": "Get all users",
        "tags": ["Users"],
         "security": [{ "bearerAuth": [] }],
        "responses": {
          "200": {
            "description": "List of users",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": { "$ref": "#/components/schemas/User" }
                }
              }
            }
          }
        }
      },
    },
    "/users/{id}": {
      "get": {
        "summary": "Get user by ID",
        "tags": ["Users"],
        "parameters": [
          { "name": "id", "in": "path", "required": true, "schema": { "type": "integer" } }
        ],
         "security": [{ "bearerAuth": [] }],
        "responses": {
          "200": { "description": "User found", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/User" } } } },
          "404": { "description": "User not found" }
        }
      },
      "put": {
        "summary": "Update user by ID",
        "tags": ["Users"],
        "security": [{ "bearerAuth": [] }],
        "parameters": [
          { "name": "id", "in": "path", "required": true, "schema": { "type": "integer" } }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "name": { "type": "string" },
                  "email": { "type": "string" }
                }
              }
            }
          }
        },
        "responses": {
          "200": { "description": "User updated" },
          "404": { "description": "User not found" }
        }
      },
      "delete": {
        "summary": "Delete user by ID",
        "tags": ["Users"],
         "security": [{ "bearerAuth": [] }],
        "parameters": [
          { "name": "id", "in": "path", "required": true, "schema": { "type": "integer" } }
        ],
        "responses": {
          "200": { "description": "User deleted" },
          "404": { "description": "User not found" }
        }
      }
    },
    "/projects": {
      "post": {
        "summary": "Create project",
        "tags": ["Projects"],
        "security": [{ "bearerAuth": [] }],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "name": { "type": "string" },
                  "description": { "type": "string" }
                }
              }
            }
          }
        },
        "responses": {
          "201": { "description": "Project created" }
        }
      },
      "get": {
        "summary": "Get user's projects",
        "tags": ["Projects"],
        "security": [{ "bearerAuth": [] }],
        "responses": {
          "200": {
            "description": "Projects list",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": { "$ref": "#/components/schemas/Project" }
                }
              }
            }
          }
        }
      }
    },
    "/tasks/projects/{id}/tasks": {
      "post": {
        "summary": "Create task in project",
        "tags": ["Tasks"],
        "security": [{ "bearerAuth": [] }],
        "parameters": [
          { "name": "id", "in": "path", "required": true, "schema": { "type": "integer" } }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "title": { "type": "string" },
                  "description": { "type": "string" },
                  "dueDate": { "type": "string", "format": "date-time" }
                }
              }
            }
          }
        },
        "responses": {
          "201": { "description": "Task created" }
        }
      }
    },
    "/tasks": {
      "get": {
        "summary": "Get tasks with filters",
        "tags": ["Tasks"],
        "security": [{ "bearerAuth": [] }],
        "parameters": [
          { "name": "status", "in": "query", "schema": { "type": "string" } },
          { "name": "projectId", "in": "query", "schema": { "type": "integer" } }
        ],
        "responses": {
          "200": {
            "description": "Tasks list",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": { "$ref": "#/components/schemas/Task" }
                }
              }
            }
          }
        }
      }
    },
    "/tasks/{id}/status": {
      "put": {
        "summary": "Update task status",
        "tags": ["Tasks"],
        "security": [{ "bearerAuth": [] }],
        "parameters": [
          { "name": "id", "in": "path", "required": true, "schema": { "type": "integer" } }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "status": { "type": "string" }
                }
              }
            }
          }
        },
        "responses": {
          "200": { "description": "Task status updated" }
        }
      }
    },
    "/tasks/analytics": {
      "get": {
        "summary": "Get task analytics",
        "tags": ["Tasks"],
        "security": [{ "bearerAuth": [] }],
        "responses": {
          "200": {
            "description": "Task stats",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "total": { "type": "integer" },
                    "completed": { "type": "integer" },
                    "pending": { "type": "integer" }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tags": [
    { "name": "Auth" },
    { "name": "Users" },
    { "name": "Projects" },
    { "name": "Tasks" }
  ]
}

