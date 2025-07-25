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
          "id": { "type": "integer", "example": 123 },
          "name": { "type": "string", "example": "Jane Doe" },
          "email": { "type": "string", "example": "jane.doe@example.com" }
        }
      },
      "Project": {
        "type": "object",
        "properties": {
          "id": { "type": "integer", "example": 101 },
          "name": { "type": "string", "example": "Marketing Website" },
          "description": { "type": "string", "example": "Redesign of the corporate marketing website." }
        }
      },
      "Task": {
        "type": "object",
        "properties": {
          "id": { "type": "integer", "example": 456 },
          "title": { "type": "string", "example": "Write landing page copy" },
          "description": { "type": "string", "example": "Draft the copy for the new landing page." },
          "status": { "type": "string", "example": "pending" },
          "dueDate": { "type": "string", "format": "date-time", "example": "2025-07-15T09:00:00Z" },
          "projectId": { "type": "integer", "example": 101 }
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
                  "name": { "type": "string", "example": "Jane Doe" },
                  "email": { "type": "string", "example": "jane.doe@example.com" },
                  "password": { "type": "string", "example": "SecurePass123!" }
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
                  "email": { "type": "string", "example": "jane.doe@example.com" },
                  "password": { "type": "string", "example": "SecurePass123!" }
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
                    "token": { "type": "string", "example": "eyJhbGciOiJIUzI1NiIsInR5..." },
                    "refreshToken": { "type": "string", "example": "eyJhbGciOiJIUzI1NiIsInR5..." }
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
      }
    },
    "/users/{id}": {
      "get": {
        "summary": "Get user by ID",
        "tags": ["Users"],
        "parameters": [
          { "name": "id", "in": "path", "required": true, "schema": { "example": "afdgg..." } }
        ],
        "security": [{ "bearerAuth": [] }],
        "responses": {
          "200": {
            "description": "User found",
            "content": { "application/json": { "schema": { "$ref": "#/components/schemas/User" } } }
          },
          "404": { "description": "User not found" }
        }
      },
      "put": {
        "summary": "Update user by ID",
        "tags": ["Users"],
        "security": [{ "bearerAuth": [] }],
        "parameters": [
          { "name": "id", "in": "path", "required": true, "schema": { "example": "afdgg..." } }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "name": { "type": "string", "example": "Jane Doe" },
                  "email": { "type": "string", "example": "jane.doe@example.com" }
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
        "summary": "Soft delete user by ID",
        "tags": ["Users"],
        "security": [{ "bearerAuth": [] }],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "example": "abcd1234encryptedid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "User soft deleted",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "id": { "type": "string", "example": "abcd1234encryptedid" },
                    "name": { "type": "string", "example": "Jane Doe" },
                    "email": { "type": "string", "example": "jane@example.com" },
                    "deletedAt": {
                      "type": "string",
                      "format": "date-time",
                      "example": "2024-07-12T15:34:00.000Z"
                    }
                  }
                }
              }
            }
          },
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
                  "name": { "type": "string", "example": "Marketing Website" },
                  "description": { "type": "string", "example": "Redesign of the corporate marketing website." }
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
          { "name": "id", "in": "path", "required": true, "schema": { "type": "string", "example": "asdgrggd" } }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "multipart/form-data": {
              "schema": {
                "type": "object",
                "properties": {
                  "title": { "type": "string", "example": "Write landing page copy" },
                  "description": { "type": "string", "example": "Draft the copy for the new landing page." },
                  "dueDate": { "type": "string", "format": "date-time", "example": "2025-07-15T09:00:00Z" },
                  "attachment": {
                    "type": "string",
                    "format": "binary",
                    "description": "Attachment file (image or PDF)"
                  }
                },
                "required": ["title"]
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Task created",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message": { "type": "string", "example": "Task created" },
                    "task": { "$ref": "#/components/schemas/Task" },
                    "attachment": {
                      "type": "object",
                      "nullable": true,
                      "properties": {
                        "id": { "type": "string", "example": "encryptedId" },
                        "fileUrl": { "type": "string", "example": "uploads/file-123.png" },
                        "uploadedAt": { "type": "string", "format": "date-time" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/tasks": {
      "get": {
        "summary": "Get tasks with filters",
        "tags": ["Tasks"],
        "security": [{ "bearerAuth": [] }],
        "parameters": [
          { "name": "status", "in": "query", "schema": { "type": "string", "example": "pending" } },
          { "name": "projectId", "in": "query", "schema": { "type": "", "example": "abcd..." } }
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
          { "name": "id", "in": "path", "required": true, "schema": { "type": "", "example": "abcd..." } }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "status": {
                    "type": "string",
                    "enum": ["pending", "in_progress", "completed"],
                    "example": "in_progress",
                    "description": "Status must be one of: pending, in_progress, completed"
                  }
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
    "/uploads/tasks/{id}/attachments": {
      "post": {
        "summary": "Upload attachment to a task",
        "tags": ["Tasks"],
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "description": "Encrypted Task ID",
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "multipart/form-data": {
              "schema": {
                "type": "object",
                "properties": {
                  "file": {
                    "type": "string",
                    "format": "binary"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Attachment uploaded successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message": {
                      "type": "string"
                    },
                    "attachment": {
                      "$ref": "#/components/schemas/TaskAttachment"
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "No file uploaded or invalid input"
          },
          "401": {
            "description": "Unauthorized"
          },
          "409": {
            "description": "Task with duplicate title"
          }
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
                    "total": { "type": "integer", "example": 50 },
                    "completed": { "type": "integer", "example": 20 },
                    "pending": { "type": "integer", "example": 30 }
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
