export default {
  "openapi": "3.0.0",
  "info": {
    "title": "Task Manager API",
    "description": "API documentation for the Task Manager Users endpoints",
    "version": "1.0.0",
    "contact": {
      "name": "",
      "email": "",
      "url": ""
    }
  },
  "servers": [
    {
      "url": "http://localhost:3000/api/v1",
      "description": "Local server"
    }
  ],
  "paths": {
    "/users": {
      "post": {
        "summary": "Create a new user",
        "tags": ["Users"],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["name", "email"],
                "properties": {
                  "name": {
                    "type": "string",
                    "example": "John Doe"
                  },
                  "email": {
                    "type": "string",
                    "example": "john@example.com"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "User created successfully"
          },
          "500": {
            "description": "Server error"
          }
        }
      },
      "get": {
        "summary": "Get all users",
        "tags": ["Users"],
        "responses": {
          "200": {
            "description": "List of users",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/User"
                  }
                }
              }
            }
          },
          "500": {
            "description": "Server error"
          }
        }
      }
    },
    "/users/{id}": {
      "get": {
        "summary": "Get user by ID",
        "tags": ["Users"],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "example": 1
            }
          }
        ],
        "responses": {
          "200": {
            "description": "User found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/User"
                }
              }
            }
          },
          "404": {
            "description": "User not found"
          },
          "500": {
            "description": "Server error"
          }
        }
      },
      "put": {
        "summary": "Update user",
        "tags": ["Users"],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "example": 1
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["name", "email"],
                "properties": {
                  "name": {
                    "type": "string",
                    "example": "Jane Doe"
                  },
                  "email": {
                    "type": "string",
                    "example": "jane@example.com"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "User updated successfully"
          },
          "404": {
            "description": "User not found"
          },
          "500": {
            "description": "Server error"
          }
        }
      },
      "delete": {
        "summary": "Delete user",
        "tags": ["Users"],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "example": 1
            }
          }
        ],
        "responses": {
          "200": {
            "description": "User deleted successfully"
          },
          "404": {
            "description": "User not found"
          },
          "500": {
            "description": "Server error"
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "User": {
        "type": "object",
        "properties": {
          "id": {
            "type": "integer",
            "example": 1
          },
          "name": {
            "type": "string",
            "example": "John Doe"
          },
          "email": {
            "type": "string",
            "example": "john@example.com"
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Users",
      "description": "Operations related to users"
    }
  ]
}
  