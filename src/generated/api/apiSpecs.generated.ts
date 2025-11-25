// 此文件由 generateApiSpecs.ts 自动生成，请勿手动修改。
import type { ApiSpecsGenerated } from '../../config/api/types';

export const apiSpecs: ApiSpecsGenerated = {
  "bundles": [
    {
      "service": "example",
      "version": "v1",
      "raw": {
        "openapi": "3.1.0",
        "info": {
          "title": "全特性测试服务",
          "description": "用于测试 generateApiSpecs.ts 解析能力的演示文档。",
          "version": "1.0.0"
        },
        "servers": [
          {
            "url": "https://api.example.com/v1",
            "description": "生产环境"
          }
        ],
        "components": {
          "schemas": {
            "User": {
              "type": "object",
              "required": [
                "id",
                "username"
              ],
              "properties": {
                "id": {
                  "type": "integer",
                  "example": 1001
                },
                "username": {
                  "type": "string",
                  "example": "star_whisper"
                },
                "role": {
                  "type": "string",
                  "enum": [
                    "admin",
                    "user",
                    "guest"
                  ],
                  "example": "admin"
                }
              }
            },
            "Order": {
              "type": "object",
              "properties": {
                "orderId": {
                  "type": "string",
                  "example": "ORD-2025-8888"
                },
                "buyer": {
                  "$ref": "#/components/schemas/User"
                },
                "items": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "productId": {
                        "type": "integer",
                        "example": 99
                      },
                      "name": {
                        "type": "string",
                        "example": "高级机械键盘"
                      },
                      "tags": {
                        "type": "array",
                        "items": {
                          "type": "string",
                          "example": "数码"
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "paths": {
          "/orders/{orderId}": {
            "get": {
              "operationId": "getOrderDetail",
              "summary": "获取订单详情",
              "description": "测试点：\n1. Path 参数替换 (buildCurlExample)\n2. Header 参数解析\n3. x-error-codes 解析\n",
              "tags": [
                "订单管理"
              ],
              "parameters": [
                {
                  "name": "orderId",
                  "in": "path",
                  "required": true,
                  "description": "订单唯一标识",
                  "schema": {
                    "type": "string",
                    "example": "ORD-2025-8888"
                  }
                },
                {
                  "name": "detailed",
                  "in": "query",
                  "description": "是否返回详细信息",
                  "schema": {
                    "type": "boolean",
                    "example": true
                  }
                },
                {
                  "name": "X-Request-ID",
                  "in": "header",
                  "required": false,
                  "schema": {
                    "type": "string",
                    "example": "req-abc-123"
                  }
                }
              ],
              "responses": {
                "200": {
                  "description": "成功返回订单",
                  "content": {
                    "application/json": {
                      "schema": {
                        "$ref": "#/components/schemas/Order"
                      }
                    }
                  }
                }
              },
              "x-error-codes": [
                {
                  "code": "ORDER_NOT_FOUND",
                  "httpStatus": 404,
                  "message": "指定的订单不存在",
                  "solution": "请检查 orderId 是否正确，或联系客服。"
                },
                {
                  "code": "PERMISSION_DENIED",
                  "httpStatus": 403,
                  "message": "无权查看此订单",
                  "solution": "请尝试重新登录或升级权限。"
                }
              ]
            }
          },
          "/orders": {
            "post": {
              "operationId": "createOrder",
              "summary": "创建新订单",
              "tags": [
                "订单管理"
              ],
              "requestBody": {
                "required": true,
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/Order"
                    }
                  }
                }
              },
              "responses": {
                "201": {
                  "description": "创建成功",
                  "content": {
                    "application/json": {
                      "schema": {
                        "type": "object",
                        "properties": {
                          "success": {
                            "type": "boolean",
                            "example": true
                          },
                          "newId": {
                            "type": "string",
                            "example": "ORD-NEW-001"
                          }
                        }
                      }
                    }
                  }
                }
              },
              "x-error-codes": [
                {
                  "code": "INVENTORY_SHORTAGE",
                  "httpStatus": 409,
                  "message": "商品库存不足"
                }
              ]
            }
          }
        }
      },
      "endpoints": [
        {
          "service": "example",
          "version": "v1",
          "method": "get",
          "path": "/orders/{orderId}",
          "operationId": "getOrderDetail",
          "summary": "获取订单详情",
          "description": "测试点：\n1. Path 参数替换 (buildCurlExample)\n2. Header 参数解析\n3. x-error-codes 解析\n",
          "tags": [
            "订单管理"
          ],
          "deprecated": false,
          "parameters": [
            {
              "name": "orderId",
              "in": "path",
              "required": true,
              "description": "订单唯一标识",
              "schema": {
                "type": "string",
                "example": "ORD-2025-8888"
              }
            },
            {
              "name": "detailed",
              "in": "query",
              "required": false,
              "description": "是否返回详细信息",
              "schema": {
                "type": "boolean",
                "example": true
              }
            },
            {
              "name": "X-Request-ID",
              "in": "header",
              "required": false,
              "schema": {
                "type": "string",
                "example": "req-abc-123"
              }
            }
          ],
          "responses": [
            {
              "status": "200",
              "description": "成功返回订单",
              "schema": {
                "$ref": "#/components/schemas/Order"
              },
              "resolvedSchema": {
                "type": "object",
                "properties": {
                  "orderId": {
                    "type": "string"
                  },
                  "buyer": {
                    "type": "object",
                    "properties": {
                      "id": {
                        "type": "integer"
                      },
                      "username": {
                        "type": "string"
                      },
                      "role": {
                        "type": "string",
                        "enum": [
                          "admin",
                          "user",
                          "guest"
                        ]
                      }
                    },
                    "required": [
                      "id",
                      "username"
                    ]
                  },
                  "items": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "productId": {
                          "type": "integer"
                        },
                        "name": {
                          "type": "string"
                        },
                        "tags": {
                          "type": "array",
                          "items": {
                            "type": "string"
                          }
                        }
                      }
                    }
                  }
                }
              },
              "exampleJson": "{\n  \"orderId\": \"ORD-2025-8888\",\n  \"buyer\": {\n    \"id\": 1001,\n    \"username\": \"star_whisper\",\n    \"role\": \"admin\"\n  },\n  \"items\": [\n    {\n      \"productId\": 99,\n      \"name\": \"高级机械键盘\",\n      \"tags\": [\n        \"数码\"\n      ]\n    }\n  ]\n}"
            }
          ],
          "errorCodes": [
            {
              "code": "ORDER_NOT_FOUND",
              "httpStatus": 404,
              "message": "指定的订单不存在",
              "solution": "请检查 orderId 是否正确，或联系客服。"
            },
            {
              "code": "PERMISSION_DENIED",
              "httpStatus": 403,
              "message": "无权查看此订单",
              "solution": "请尝试重新登录或升级权限。"
            }
          ],
          "searchText": "getOrderDetail\n/orders/{orderId}\n获取订单详情\n测试点：\n1. Path 参数替换 (buildCurlExample)\n2. Header 参数解析\n3. x-error-codes 解析\n\n订单管理",
          "curlExample": "curl -X GET 'https://api.example.com/v1/orders/<orderId>?detailed=<detailed>' -H 'Accept: application/json'",
          "codeExamples": {
            "fetch": "import fetch from 'node-fetch';\n\nfetch('https://api.example.com/v1/orders/<orderId>?detailed=<detailed>', {\n  headers: {\n    'Accept': 'application/json'\n  }\n});\n",
            "axios": "import axios from 'axios';\n\nconst response = await axios.get('https://api.example.com/v1/orders/<orderId>?detailed=<detailed>', {\n  headers: {\n    'Accept': 'application/json'\n  }\n});\n",
            "python": "import requests\n\nheaders = {\n    'Accept': 'application/json',\n}\n\nresponse = requests.get('https://api.example.com/v1/orders/<orderId>?detailed=<detailed>', headers=headers)\n"
          }
        },
        {
          "service": "example",
          "version": "v1",
          "method": "post",
          "path": "/orders",
          "operationId": "createOrder",
          "summary": "创建新订单",
          "tags": [
            "订单管理"
          ],
          "deprecated": false,
          "parameters": [],
          "requestBody": {
            "mimeType": "application/json",
            "schema": {
              "$ref": "#/components/schemas/Order"
            },
            "resolvedSchema": {
              "type": "object",
              "properties": {
                "orderId": {
                  "type": "string"
                },
                "buyer": {
                  "type": "object",
                  "properties": {
                    "id": {
                      "type": "integer"
                    },
                    "username": {
                      "type": "string"
                    },
                    "role": {
                      "type": "string",
                      "enum": [
                        "admin",
                        "user",
                        "guest"
                      ]
                    }
                  },
                  "required": [
                    "id",
                    "username"
                  ]
                },
                "items": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "productId": {
                        "type": "integer"
                      },
                      "name": {
                        "type": "string"
                      },
                      "tags": {
                        "type": "array",
                        "items": {
                          "type": "string"
                        }
                      }
                    }
                  }
                }
              }
            },
            "exampleJson": "{\n  \"orderId\": \"ORD-2025-8888\",\n  \"buyer\": {\n    \"id\": 1001,\n    \"username\": \"star_whisper\",\n    \"role\": \"admin\"\n  },\n  \"items\": [\n    {\n      \"productId\": 99,\n      \"name\": \"高级机械键盘\",\n      \"tags\": [\n        \"数码\"\n      ]\n    }\n  ]\n}",
            "required": true
          },
          "responses": [
            {
              "status": "201",
              "description": "创建成功",
              "schema": {
                "type": "object",
                "properties": {
                  "success": {
                    "type": "boolean",
                    "example": true
                  },
                  "newId": {
                    "type": "string",
                    "example": "ORD-NEW-001"
                  }
                }
              },
              "resolvedSchema": {
                "type": "object",
                "properties": {
                  "success": {
                    "type": "boolean"
                  },
                  "newId": {
                    "type": "string"
                  }
                }
              },
              "exampleJson": "{\n  \"success\": true,\n  \"newId\": \"ORD-NEW-001\"\n}"
            }
          ],
          "errorCodes": [
            {
              "code": "INVENTORY_SHORTAGE",
              "httpStatus": 409,
              "message": "商品库存不足"
            }
          ],
          "searchText": "createOrder\n/orders\n创建新订单\n订单管理",
          "curlExample": "curl -X POST 'https://api.example.com/v1/orders' -H 'Accept: application/json' -H 'Content-Type: application/json' -d '{\"orderId\":\"ORD-2025-8888\",\"buyer\":{\"id\":1001,\"username\":\"star_whisper\",\"role\":\"admin\"},\"items\":[{\"productId\":99,\"name\":\"高级机械键盘\",\"tags\":[\"数码\"]}]}'",
          "codeExamples": {
            "fetch": "import fetch from 'node-fetch';\n\nfetch('https://api.example.com/v1/orders', {\n  method: 'POST',\n  headers: {\n    'Accept': 'application/json',\n    'Content-Type': 'application/json'\n  },\n  body: JSON.stringify({\n    'orderId': 'ORD-2025-8888',\n    'buyer': {\n      'id': 1001,\n      'username': 'star_whisper',\n      'role': 'admin'\n    },\n    'items': [\n      {\n        'productId': 99,\n        'name': '\\u9AD8\\u7EA7\\u673A\\u68B0\\u952E\\u76D8',\n        'tags': [\n          '\\u6570\\u7801'\n        ]\n      }\n    ]\n  })\n});\n",
            "axios": "import axios from 'axios';\n\nconst response = await axios.post(\n  'https://api.example.com/v1/orders',\n  {\n    'orderId': 'ORD-2025-8888',\n    'buyer': {\n      'id': 1001,\n      'username': 'star_whisper',\n      'role': 'admin'\n    },\n    'items': [\n      {\n        'productId': 99,\n        'name': '\\u9AD8\\u7EA7\\u673A\\u68B0\\u952E\\u76D8',\n        'tags': [\n          '\\u6570\\u7801'\n        ]\n      }\n    ]\n  },\n  {\n    headers: {\n      'Accept': 'application/json',\n      'Content-Type': 'application/json'\n    }\n  }\n);\n",
            "python": "import requests\n\nheaders = {\n    'Accept': 'application/json',\n    'Content-Type': 'application/json',\n}\n\njson_data = {\n    'orderId': 'ORD-2025-8888',\n    'buyer': {\n        'id': 1001,\n        'username': 'star_whisper',\n        'role': 'admin',\n    },\n    'items': [\n        {\n            'productId': 99,\n            'name': '高级机械键盘',\n            'tags': [\n                '数码',\n            ],\n        },\n    ],\n}\n\nresponse = requests.post('https://api.example.com/v1/orders', headers=headers, json=json_data)\n\n# Note: json_data will not be serialized by requests\n# exactly as it was in the original request.\n#data = '{\"orderId\":\"ORD-2025-8888\",\"buyer\":{\"id\":1001,\"username\":\"star_whisper\",\"role\":\"admin\"},\"items\":[{\"productId\":99,\"name\":\"高级机械键盘\",\"tags\":[\"数码\"]}]}'.encode()\n#response = requests.post('https://api.example.com/v1/orders', headers=headers, data=data)\n"
          }
        }
      ]
    },
    {
      "service": "example",
      "version": "v2",
      "raw": {
        "openapi": "3.1.0",
        "info": {
          "title": "全特性测试服务 V2",
          "description": "V2 版本，包含弃用逻辑测试。",
          "version": "2.0.0"
        },
        "servers": [
          {
            "url": "https://api.example.com/v2",
            "description": "生产环境 V2"
          }
        ],
        "components": {
          "schemas": {
            "Order": {
              "$ref": "../v1/openapi.yaml#/components/schemas/Order"
            }
          }
        },
        "paths": {
          "/orders/{orderId}": {
            "get": {
              "operationId": "getOrderDetailV1",
              "summary": "获取订单详情 (旧)",
              "deprecated": true,
              "x-replaced-by": {
                "path": "/trade-orders/{orderId}",
                "method": "get",
                "operationId": "getTradeOrderDetail",
                "description": "V2 版本架构调整，请迁移至 trade-orders。"
              },
              "tags": [
                "订单管理(Legacy)"
              ],
              "parameters": [
                {
                  "name": "orderId",
                  "in": "path",
                  "required": true,
                  "schema": {
                    "type": "string"
                  }
                }
              ],
              "responses": {
                "200": {
                  "description": "兼容性返回",
                  "content": {
                    "application/json": {
                      "schema": {
                        "type": "object"
                      }
                    }
                  }
                }
              }
            }
          },
          "/trade-orders/{orderId}": {
            "get": {
              "operationId": "getTradeOrderDetail",
              "summary": "获取交易订单详情 (新)",
              "tags": [
                "交易中心"
              ],
              "parameters": [
                {
                  "name": "orderId",
                  "in": "path",
                  "required": true,
                  "schema": {
                    "type": "string"
                  }
                }
              ],
              "responses": {
                "200": {
                  "description": "成功",
                  "content": {
                    "application/json": {
                      "schema": {
                        "type": "object",
                        "properties": {
                          "id": {
                            "type": "string"
                          }
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
      "endpoints": [
        {
          "service": "example",
          "version": "v2",
          "method": "get",
          "path": "/orders/{orderId}",
          "operationId": "getOrderDetailV1",
          "summary": "获取订单详情 (旧)",
          "tags": [
            "订单管理(Legacy)"
          ],
          "deprecated": true,
          "parameters": [
            {
              "name": "orderId",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": [
            {
              "status": "200",
              "description": "兼容性返回",
              "schema": {
                "type": "object"
              },
              "resolvedSchema": {
                "type": "object"
              },
              "exampleJson": "null"
            }
          ],
          "searchText": "getOrderDetailV1\n/orders/{orderId}\n获取订单详情 (旧)\n订单管理(Legacy)",
          "curlExample": "curl -X GET 'https://api.example.com/v2/orders/<orderId>' -H 'Accept: application/json'",
          "codeExamples": {
            "fetch": "import fetch from 'node-fetch';\n\nfetch('https://api.example.com/v2/orders/<orderId>', {\n  headers: {\n    'Accept': 'application/json'\n  }\n});\n",
            "axios": "import axios from 'axios';\n\nconst response = await axios.get('https://api.example.com/v2/orders/<orderId>', {\n  headers: {\n    'Accept': 'application/json'\n  }\n});\n",
            "python": "import requests\n\nheaders = {\n    'Accept': 'application/json',\n}\n\nresponse = requests.get('https://api.example.com/v2/orders/<orderId>', headers=headers)\n"
          }
        },
        {
          "service": "example",
          "version": "v2",
          "method": "get",
          "path": "/trade-orders/{orderId}",
          "operationId": "getTradeOrderDetail",
          "summary": "获取交易订单详情 (新)",
          "tags": [
            "交易中心"
          ],
          "deprecated": false,
          "parameters": [
            {
              "name": "orderId",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": [
            {
              "status": "200",
              "description": "成功",
              "schema": {
                "type": "object",
                "properties": {
                  "id": {
                    "type": "string"
                  }
                }
              },
              "resolvedSchema": {
                "type": "object",
                "properties": {
                  "id": {
                    "type": "string"
                  }
                }
              },
              "exampleJson": "{\n  \"id\": \"string\"\n}"
            }
          ],
          "searchText": "getTradeOrderDetail\n/trade-orders/{orderId}\n获取交易订单详情 (新)\n交易中心",
          "curlExample": "curl -X GET 'https://api.example.com/v2/trade-orders/<orderId>' -H 'Accept: application/json'",
          "codeExamples": {
            "fetch": "import fetch from 'node-fetch';\n\nfetch('https://api.example.com/v2/trade-orders/<orderId>', {\n  headers: {\n    'Accept': 'application/json'\n  }\n});\n",
            "axios": "import axios from 'axios';\n\nconst response = await axios.get('https://api.example.com/v2/trade-orders/<orderId>', {\n  headers: {\n    'Accept': 'application/json'\n  }\n});\n",
            "python": "import requests\n\nheaders = {\n    'Accept': 'application/json',\n}\n\nresponse = requests.get('https://api.example.com/v2/trade-orders/<orderId>', headers=headers)\n"
          }
        }
      ]
    },
    {
      "service": "github-contributions-api",
      "version": "v4",
      "raw": {
        "openapi": "3.1.0",
        "info": {
          "title": "GitHub Contributions API",
          "version": "v4",
          "description": "通过抓取用户 GitHub 个人资料页面，返回 GitHub 贡献数据的 API 服务。\n⚠️ 注意：结果会缓存 1 小时！\n",
          "contact": {
            "name": "GitHub Repository",
            "url": "https://github.com/grubersjoe/github-contributions-api"
          }
        },
        "servers": [
          {
            "url": "https://github-contributions-api.jogruber.de",
            "description": "原版官方托管"
          },
          {
            "url": "https://api.f1a.me/github-contributions-api",
            "description": "赤石科技镜像托管"
          }
        ],
        "tags": [
          {
            "name": "contributions",
            "description": "GitHub 贡献数据相关接口"
          }
        ],
        "paths": {
          "/": {
            "get": {
              "summary": "获取 API 欢迎信息",
              "description": "返回 API 的基本信息和文档链接",
              "operationId": "getWelcome",
              "tags": [
                "contributions"
              ],
              "responses": {
                "200": {
                  "description": "成功返回欢迎信息",
                  "content": {
                    "application/json": {
                      "schema": {
                        "type": "object",
                        "properties": {
                          "message": {
                            "type": "string",
                            "example": "Welcome to the GitHub Contributions API."
                          },
                          "version": {
                            "type": "string",
                            "example": "v4"
                          },
                          "docs": {
                            "type": "string",
                            "format": "uri",
                            "example": "https://github-contributions-api.jogruber.de"
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "/v4": {
            "get": {
              "summary": "重定向到根路径",
              "description": "重定向到 API 根路径",
              "operationId": "redirectToRoot",
              "tags": [
                "contributions"
              ],
              "responses": {
                "302": {
                  "description": "重定向到根路径"
                }
              }
            }
          },
          "/v4/{username}": {
            "get": {
              "summary": "获取用户的 GitHub 贡献数据",
              "description": "根据 GitHub 用户名获取该用户的贡献历史数据。支持按年份筛选和嵌套格式输出。\n\n**缓存机制**：\n- 结果默认缓存 1 小时\n- 可通过 `cache-control: no-cache` 请求头强制刷新（请谨慎使用）\n- 响应头包含 `age` 和 `x-cache` 字段提供缓存状态信息\n",
              "operationId": "getUserContributions",
              "tags": [
                "contributions"
              ],
              "parameters": [
                {
                  "name": "username",
                  "in": "path",
                  "required": true,
                  "description": "GitHub 用户名",
                  "schema": {
                    "type": "string"
                  },
                  "example": "grubersjoe"
                },
                {
                  "name": "y",
                  "in": "query",
                  "required": false,
                  "description": "年份筛选参数，可以是：\n- 具体年份数字（如 2020）\n- `all`：所有年份（默认）\n- `last`：最近一年（GitHub 默认视图）\n- 可多次传递以选择多个年份\n",
                  "schema": {
                    "oneOf": [
                      {
                        "type": "string",
                        "enum": [
                          "all",
                          "last"
                        ]
                      },
                      {
                        "type": "integer",
                        "minimum": 2000
                      },
                      {
                        "type": "array",
                        "items": {
                          "oneOf": [
                            {
                              "type": "string",
                              "enum": [
                                "all",
                                "last"
                              ]
                            },
                            {
                              "type": "integer",
                              "minimum": 2000
                            }
                          ]
                        }
                      }
                    ]
                  },
                  "examples": {
                    "all": {
                      "value": "all",
                      "summary": "所有年份"
                    },
                    "last": {
                      "value": "last",
                      "summary": "最近一年"
                    },
                    "specific": {
                      "value": 2020,
                      "summary": "指定年份"
                    },
                    "multiple": {
                      "value": [
                        2020,
                        2021
                      ],
                      "summary": "多个年份"
                    }
                  }
                },
                {
                  "name": "format",
                  "in": "query",
                  "required": false,
                  "description": "响应数据格式，`nested` 表示按年/月/日嵌套的对象结构",
                  "schema": {
                    "type": "string",
                    "enum": [
                      "nested"
                    ]
                  },
                  "example": "nested"
                },
                {
                  "name": "cache-control",
                  "in": "header",
                  "required": false,
                  "description": "缓存控制，使用 `no-cache` 可强制刷新数据",
                  "schema": {
                    "type": "string",
                    "enum": [
                      "no-cache"
                    ]
                  }
                }
              ],
              "responses": {
                "200": {
                  "description": "成功返回贡献数据",
                  "headers": {
                    "age": {
                      "description": "缓存存在时长（秒）",
                      "schema": {
                        "type": "integer"
                      },
                      "example": 1800
                    },
                    "x-cache": {
                      "description": "缓存命中状态",
                      "schema": {
                        "type": "string",
                        "enum": [
                          "HIT",
                          "MISS"
                        ]
                      },
                      "example": "HIT"
                    }
                  },
                  "content": {
                    "application/json": {
                      "schema": {
                        "oneOf": [
                          {
                            "$ref": "#/components/schemas/Response"
                          },
                          {
                            "$ref": "#/components/schemas/NestedResponse"
                          }
                        ]
                      },
                      "examples": {
                        "standardFormat": {
                          "summary": "标准格式（数组）",
                          "value": {
                            "total": {
                              "2020": 492,
                              "2021": 358
                            },
                            "contributions": [
                              {
                                "date": "2020-01-01",
                                "count": 0,
                                "level": 0
                              },
                              {
                                "date": "2020-01-02",
                                "count": 9,
                                "level": 4
                              },
                              {
                                "date": "2020-01-03",
                                "count": 5,
                                "level": 2
                              }
                            ]
                          }
                        },
                        "nestedFormat": {
                          "summary": "嵌套格式（对象）",
                          "value": {
                            "total": {
                              "2020": 492
                            },
                            "contributions": {
                              "2020": {
                                "1": {
                                  "1": {
                                    "date": "2020-01-01",
                                    "count": 9,
                                    "level": 4
                                  },
                                  "2": {
                                    "date": "2020-01-02",
                                    "count": 5,
                                    "level": 2
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
                "400": {
                  "description": "请求参数错误",
                  "content": {
                    "application/json": {
                      "schema": {
                        "$ref": "#/components/schemas/ErrorResponse"
                      },
                      "examples": {
                        "invalidFormat": {
                          "summary": "format 参数无效",
                          "value": {
                            "error": "Query parameter 'format' must be 'nested' or undefined"
                          }
                        },
                        "invalidYear": {
                          "summary": "y 参数无效",
                          "value": {
                            "error": "Query parameter 'y' must be an integer, 'all' or 'last'"
                          }
                        }
                      }
                    }
                  }
                },
                "404": {
                  "description": "用户不存在",
                  "content": {
                    "application/json": {
                      "schema": {
                        "$ref": "#/components/schemas/ErrorResponse"
                      },
                      "example": {
                        "error": "User \"nonexistentuser\" not found."
                      }
                    }
                  }
                },
                "500": {
                  "description": "服务器内部错误",
                  "content": {
                    "application/json": {
                      "schema": {
                        "$ref": "#/components/schemas/ErrorResponse"
                      },
                      "example": {
                        "error": "Failed scraping contribution data of 'username': unexpected error"
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "components": {
          "schemas": {
            "Contribution": {
              "type": "object",
              "description": "单日贡献数据",
              "required": [
                "date",
                "count",
                "level"
              ],
              "properties": {
                "date": {
                  "type": "string",
                  "format": "date",
                  "description": "日期（ISO 8601 格式）",
                  "example": "2020-01-01"
                },
                "count": {
                  "type": "integer",
                  "minimum": 0,
                  "description": "当日贡献次数",
                  "example": 9
                },
                "level": {
                  "type": "integer",
                  "enum": [
                    0,
                    1,
                    2,
                    3,
                    4
                  ],
                  "description": "贡献强度等级：\n- 0: 无贡献\n- 1: 低强度\n- 2: 中低强度\n- 3: 中高强度\n- 4: 高强度\n",
                  "example": 4
                }
              }
            },
            "Response": {
              "type": "object",
              "description": "标准格式的贡献数据响应（数组形式）",
              "required": [
                "total",
                "contributions"
              ],
              "properties": {
                "total": {
                  "type": "object",
                  "description": "各年份的总贡献次数",
                  "additionalProperties": {
                    "type": "integer"
                  },
                  "example": {
                    "2020": 492,
                    "2021": 358,
                    "lastYear": 425
                  }
                },
                "contributions": {
                  "type": "array",
                  "description": "按时间顺序排列的贡献数据数组",
                  "items": {
                    "$ref": "#/components/schemas/Contribution"
                  }
                }
              }
            },
            "NestedResponse": {
              "type": "object",
              "description": "嵌套格式的贡献数据响应（按年/月/日嵌套的对象结构）",
              "required": [
                "total",
                "contributions"
              ],
              "properties": {
                "total": {
                  "type": "object",
                  "description": "各年份的总贡献次数",
                  "additionalProperties": {
                    "type": "integer"
                  },
                  "example": {
                    "2020": 492,
                    "lastYear": 425
                  }
                },
                "contributions": {
                  "type": "object",
                  "description": "按年/月/日三层嵌套的贡献数据对象",
                  "additionalProperties": {
                    "type": "object",
                    "description": "年份（数字键）",
                    "additionalProperties": {
                      "type": "object",
                      "description": "月份（数字键，1-12）",
                      "additionalProperties": {
                        "$ref": "#/components/schemas/Contribution"
                      }
                    }
                  },
                  "example": {
                    "2020": {
                      "1": {
                        "1": {
                          "date": "2020-01-01",
                          "count": 9,
                          "level": 4
                        },
                        "2": {
                          "date": "2020-01-02",
                          "count": 5,
                          "level": 2
                        }
                      }
                    }
                  }
                }
              }
            },
            "ErrorResponse": {
              "type": "object",
              "description": "错误响应",
              "required": [
                "error"
              ],
              "properties": {
                "error": {
                  "type": "string",
                  "description": "错误信息描述",
                  "example": "User \"username\" not found."
                }
              }
            }
          }
        }
      },
      "endpoints": [
        {
          "service": "github-contributions-api",
          "version": "v4",
          "method": "get",
          "path": "/",
          "operationId": "getWelcome",
          "summary": "获取 API 欢迎信息",
          "description": "返回 API 的基本信息和文档链接",
          "tags": [
            "contributions"
          ],
          "deprecated": false,
          "parameters": [],
          "responses": [
            {
              "status": "200",
              "description": "成功返回欢迎信息",
              "schema": {
                "type": "object",
                "properties": {
                  "message": {
                    "type": "string",
                    "example": "Welcome to the GitHub Contributions API."
                  },
                  "version": {
                    "type": "string",
                    "example": "v4"
                  },
                  "docs": {
                    "type": "string",
                    "format": "uri",
                    "example": "https://github-contributions-api.jogruber.de"
                  }
                }
              },
              "resolvedSchema": {
                "type": "object",
                "properties": {
                  "message": {
                    "type": "string"
                  },
                  "version": {
                    "type": "string"
                  },
                  "docs": {
                    "type": "string"
                  }
                }
              },
              "exampleJson": "{\n  \"message\": \"Welcome to the GitHub Contributions API.\",\n  \"version\": \"v4\",\n  \"docs\": \"https://github-contributions-api.jogruber.de\"\n}"
            }
          ],
          "searchText": "getWelcome\n/\n获取 API 欢迎信息\n返回 API 的基本信息和文档链接\ncontributions",
          "curlExample": "curl -X GET 'https://github-contributions-api.jogruber.de/' -H 'Accept: application/json'",
          "codeExamples": {
            "fetch": "import fetch from 'node-fetch';\n\nfetch('https://github-contributions-api.jogruber.de/', {\n  headers: {\n    'Accept': 'application/json'\n  }\n});\n",
            "axios": "import axios from 'axios';\n\nconst response = await axios.get('https://github-contributions-api.jogruber.de/', {\n  headers: {\n    'Accept': 'application/json'\n  }\n});\n",
            "python": "import requests\n\nheaders = {\n    'Accept': 'application/json',\n}\n\nresponse = requests.get('https://github-contributions-api.jogruber.de/', headers=headers)\n"
          }
        },
        {
          "service": "github-contributions-api",
          "version": "v4",
          "method": "get",
          "path": "/v4",
          "operationId": "redirectToRoot",
          "summary": "重定向到根路径",
          "description": "重定向到 API 根路径",
          "tags": [
            "contributions"
          ],
          "deprecated": false,
          "parameters": [],
          "responses": [
            {
              "status": "302",
              "description": "重定向到根路径"
            }
          ],
          "searchText": "redirectToRoot\n/v4\n重定向到根路径\n重定向到 API 根路径\ncontributions",
          "curlExample": "curl -X GET 'https://github-contributions-api.jogruber.de/v4' -H 'Accept: application/json'",
          "codeExamples": {
            "fetch": "import fetch from 'node-fetch';\n\nfetch('https://github-contributions-api.jogruber.de/v4', {\n  headers: {\n    'Accept': 'application/json'\n  }\n});\n",
            "axios": "import axios from 'axios';\n\nconst response = await axios.get('https://github-contributions-api.jogruber.de/v4', {\n  headers: {\n    'Accept': 'application/json'\n  }\n});\n",
            "python": "import requests\n\nheaders = {\n    'Accept': 'application/json',\n}\n\nresponse = requests.get('https://github-contributions-api.jogruber.de/v4', headers=headers)\n"
          }
        },
        {
          "service": "github-contributions-api",
          "version": "v4",
          "method": "get",
          "path": "/v4/{username}",
          "operationId": "getUserContributions",
          "summary": "获取用户的 GitHub 贡献数据",
          "description": "根据 GitHub 用户名获取该用户的贡献历史数据。支持按年份筛选和嵌套格式输出。\n\n**缓存机制**：\n- 结果默认缓存 1 小时\n- 可通过 `cache-control: no-cache` 请求头强制刷新（请谨慎使用）\n- 响应头包含 `age` 和 `x-cache` 字段提供缓存状态信息\n",
          "tags": [
            "contributions"
          ],
          "deprecated": false,
          "parameters": [
            {
              "name": "username",
              "in": "path",
              "required": true,
              "description": "GitHub 用户名",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "y",
              "in": "query",
              "required": false,
              "description": "年份筛选参数，可以是：\n- 具体年份数字（如 2020）\n- `all`：所有年份（默认）\n- `last`：最近一年（GitHub 默认视图）\n- 可多次传递以选择多个年份\n",
              "schema": {
                "oneOf": [
                  {
                    "type": "string",
                    "enum": [
                      "all",
                      "last"
                    ]
                  },
                  {
                    "type": "integer",
                    "minimum": 2000
                  },
                  {
                    "type": "array",
                    "items": {
                      "oneOf": [
                        {
                          "type": "string",
                          "enum": [
                            "all",
                            "last"
                          ]
                        },
                        {
                          "type": "integer",
                          "minimum": 2000
                        }
                      ]
                    }
                  }
                ]
              }
            },
            {
              "name": "format",
              "in": "query",
              "required": false,
              "description": "响应数据格式，`nested` 表示按年/月/日嵌套的对象结构",
              "schema": {
                "type": "string",
                "enum": [
                  "nested"
                ]
              }
            },
            {
              "name": "cache-control",
              "in": "header",
              "required": false,
              "description": "缓存控制，使用 `no-cache` 可强制刷新数据",
              "schema": {
                "type": "string",
                "enum": [
                  "no-cache"
                ]
              }
            }
          ],
          "responses": [
            {
              "status": "200",
              "description": "成功返回贡献数据",
              "schema": {
                "oneOf": [
                  {
                    "$ref": "#/components/schemas/Response"
                  },
                  {
                    "$ref": "#/components/schemas/NestedResponse"
                  }
                ]
              },
              "resolvedSchema": {},
              "exampleJson": "null"
            },
            {
              "status": "400",
              "description": "请求参数错误",
              "schema": {
                "$ref": "#/components/schemas/ErrorResponse"
              },
              "resolvedSchema": {
                "type": "object",
                "properties": {
                  "error": {
                    "type": "string",
                    "description": "错误信息描述"
                  }
                },
                "required": [
                  "error"
                ],
                "description": "错误响应"
              },
              "exampleJson": "{\n  \"error\": \"User \\\"username\\\" not found.\"\n}"
            },
            {
              "status": "404",
              "description": "用户不存在",
              "schema": {
                "$ref": "#/components/schemas/ErrorResponse"
              },
              "resolvedSchema": {
                "type": "object",
                "properties": {
                  "error": {
                    "type": "string",
                    "description": "错误信息描述"
                  }
                },
                "required": [
                  "error"
                ],
                "description": "错误响应"
              },
              "exampleJson": "{\n  \"error\": \"User \\\"username\\\" not found.\"\n}"
            },
            {
              "status": "500",
              "description": "服务器内部错误",
              "schema": {
                "$ref": "#/components/schemas/ErrorResponse"
              },
              "resolvedSchema": {
                "type": "object",
                "properties": {
                  "error": {
                    "type": "string",
                    "description": "错误信息描述"
                  }
                },
                "required": [
                  "error"
                ],
                "description": "错误响应"
              },
              "exampleJson": "{\n  \"error\": \"User \\\"username\\\" not found.\"\n}"
            }
          ],
          "searchText": "getUserContributions\n/v4/{username}\n获取用户的 GitHub 贡献数据\n根据 GitHub 用户名获取该用户的贡献历史数据。支持按年份筛选和嵌套格式输出。\n\n**缓存机制**：\n- 结果默认缓存 1 小时\n- 可通过 `cache-control: no-cache` 请求头强制刷新（请谨慎使用）\n- 响应头包含 `age` 和 `x-cache` 字段提供缓存状态信息\n\ncontributions",
          "curlExample": "curl -X GET 'https://github-contributions-api.jogruber.de/v4/<username>?y=<y>&format=<format>' -H 'Accept: application/json'",
          "codeExamples": {
            "fetch": "import fetch from 'node-fetch';\n\nfetch('https://github-contributions-api.jogruber.de/v4/<username>?y=<y>&format=<format>', {\n  headers: {\n    'Accept': 'application/json'\n  }\n});\n",
            "axios": "import axios from 'axios';\n\nconst response = await axios.get('https://github-contributions-api.jogruber.de/v4/<username>?y=<y>&format=<format>', {\n  headers: {\n    'Accept': 'application/json'\n  }\n});\n",
            "python": "import requests\n\nheaders = {\n    'Accept': 'application/json',\n}\n\nresponse = requests.get('https://github-contributions-api.jogruber.de/v4/<username>?y=<y>&format=<format>', headers=headers)\n"
          }
        }
      ]
    }
  ],
  "allEndpoints": [
    {
      "service": "example",
      "version": "v1",
      "method": "get",
      "path": "/orders/{orderId}",
      "operationId": "getOrderDetail",
      "summary": "获取订单详情",
      "description": "测试点：\n1. Path 参数替换 (buildCurlExample)\n2. Header 参数解析\n3. x-error-codes 解析\n",
      "tags": [
        "订单管理"
      ],
      "deprecated": false,
      "parameters": [
        {
          "name": "orderId",
          "in": "path",
          "required": true,
          "description": "订单唯一标识",
          "schema": {
            "type": "string",
            "example": "ORD-2025-8888"
          }
        },
        {
          "name": "detailed",
          "in": "query",
          "required": false,
          "description": "是否返回详细信息",
          "schema": {
            "type": "boolean",
            "example": true
          }
        },
        {
          "name": "X-Request-ID",
          "in": "header",
          "required": false,
          "schema": {
            "type": "string",
            "example": "req-abc-123"
          }
        }
      ],
      "responses": [
        {
          "status": "200",
          "description": "成功返回订单",
          "schema": {
            "$ref": "#/components/schemas/Order"
          },
          "resolvedSchema": {
            "type": "object",
            "properties": {
              "orderId": {
                "type": "string"
              },
              "buyer": {
                "type": "object",
                "properties": {
                  "id": {
                    "type": "integer"
                  },
                  "username": {
                    "type": "string"
                  },
                  "role": {
                    "type": "string",
                    "enum": [
                      "admin",
                      "user",
                      "guest"
                    ]
                  }
                },
                "required": [
                  "id",
                  "username"
                ]
              },
              "items": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "productId": {
                      "type": "integer"
                    },
                    "name": {
                      "type": "string"
                    },
                    "tags": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      }
                    }
                  }
                }
              }
            }
          },
          "exampleJson": "{\n  \"orderId\": \"ORD-2025-8888\",\n  \"buyer\": {\n    \"id\": 1001,\n    \"username\": \"star_whisper\",\n    \"role\": \"admin\"\n  },\n  \"items\": [\n    {\n      \"productId\": 99,\n      \"name\": \"高级机械键盘\",\n      \"tags\": [\n        \"数码\"\n      ]\n    }\n  ]\n}"
        }
      ],
      "errorCodes": [
        {
          "code": "ORDER_NOT_FOUND",
          "httpStatus": 404,
          "message": "指定的订单不存在",
          "solution": "请检查 orderId 是否正确，或联系客服。"
        },
        {
          "code": "PERMISSION_DENIED",
          "httpStatus": 403,
          "message": "无权查看此订单",
          "solution": "请尝试重新登录或升级权限。"
        }
      ],
      "searchText": "getOrderDetail\n/orders/{orderId}\n获取订单详情\n测试点：\n1. Path 参数替换 (buildCurlExample)\n2. Header 参数解析\n3. x-error-codes 解析\n\n订单管理",
      "curlExample": "curl -X GET 'https://api.example.com/v1/orders/<orderId>?detailed=<detailed>' -H 'Accept: application/json'",
      "codeExamples": {
        "fetch": "import fetch from 'node-fetch';\n\nfetch('https://api.example.com/v1/orders/<orderId>?detailed=<detailed>', {\n  headers: {\n    'Accept': 'application/json'\n  }\n});\n",
        "axios": "import axios from 'axios';\n\nconst response = await axios.get('https://api.example.com/v1/orders/<orderId>?detailed=<detailed>', {\n  headers: {\n    'Accept': 'application/json'\n  }\n});\n",
        "python": "import requests\n\nheaders = {\n    'Accept': 'application/json',\n}\n\nresponse = requests.get('https://api.example.com/v1/orders/<orderId>?detailed=<detailed>', headers=headers)\n"
      }
    },
    {
      "service": "example",
      "version": "v1",
      "method": "post",
      "path": "/orders",
      "operationId": "createOrder",
      "summary": "创建新订单",
      "tags": [
        "订单管理"
      ],
      "deprecated": false,
      "parameters": [],
      "requestBody": {
        "mimeType": "application/json",
        "schema": {
          "$ref": "#/components/schemas/Order"
        },
        "resolvedSchema": {
          "type": "object",
          "properties": {
            "orderId": {
              "type": "string"
            },
            "buyer": {
              "type": "object",
              "properties": {
                "id": {
                  "type": "integer"
                },
                "username": {
                  "type": "string"
                },
                "role": {
                  "type": "string",
                  "enum": [
                    "admin",
                    "user",
                    "guest"
                  ]
                }
              },
              "required": [
                "id",
                "username"
              ]
            },
            "items": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "productId": {
                    "type": "integer"
                  },
                  "name": {
                    "type": "string"
                  },
                  "tags": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          }
        },
        "exampleJson": "{\n  \"orderId\": \"ORD-2025-8888\",\n  \"buyer\": {\n    \"id\": 1001,\n    \"username\": \"star_whisper\",\n    \"role\": \"admin\"\n  },\n  \"items\": [\n    {\n      \"productId\": 99,\n      \"name\": \"高级机械键盘\",\n      \"tags\": [\n        \"数码\"\n      ]\n    }\n  ]\n}",
        "required": true
      },
      "responses": [
        {
          "status": "201",
          "description": "创建成功",
          "schema": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean",
                "example": true
              },
              "newId": {
                "type": "string",
                "example": "ORD-NEW-001"
              }
            }
          },
          "resolvedSchema": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "newId": {
                "type": "string"
              }
            }
          },
          "exampleJson": "{\n  \"success\": true,\n  \"newId\": \"ORD-NEW-001\"\n}"
        }
      ],
      "errorCodes": [
        {
          "code": "INVENTORY_SHORTAGE",
          "httpStatus": 409,
          "message": "商品库存不足"
        }
      ],
      "searchText": "createOrder\n/orders\n创建新订单\n订单管理",
      "curlExample": "curl -X POST 'https://api.example.com/v1/orders' -H 'Accept: application/json' -H 'Content-Type: application/json' -d '{\"orderId\":\"ORD-2025-8888\",\"buyer\":{\"id\":1001,\"username\":\"star_whisper\",\"role\":\"admin\"},\"items\":[{\"productId\":99,\"name\":\"高级机械键盘\",\"tags\":[\"数码\"]}]}'",
      "codeExamples": {
        "fetch": "import fetch from 'node-fetch';\n\nfetch('https://api.example.com/v1/orders', {\n  method: 'POST',\n  headers: {\n    'Accept': 'application/json',\n    'Content-Type': 'application/json'\n  },\n  body: JSON.stringify({\n    'orderId': 'ORD-2025-8888',\n    'buyer': {\n      'id': 1001,\n      'username': 'star_whisper',\n      'role': 'admin'\n    },\n    'items': [\n      {\n        'productId': 99,\n        'name': '\\u9AD8\\u7EA7\\u673A\\u68B0\\u952E\\u76D8',\n        'tags': [\n          '\\u6570\\u7801'\n        ]\n      }\n    ]\n  })\n});\n",
        "axios": "import axios from 'axios';\n\nconst response = await axios.post(\n  'https://api.example.com/v1/orders',\n  {\n    'orderId': 'ORD-2025-8888',\n    'buyer': {\n      'id': 1001,\n      'username': 'star_whisper',\n      'role': 'admin'\n    },\n    'items': [\n      {\n        'productId': 99,\n        'name': '\\u9AD8\\u7EA7\\u673A\\u68B0\\u952E\\u76D8',\n        'tags': [\n          '\\u6570\\u7801'\n        ]\n      }\n    ]\n  },\n  {\n    headers: {\n      'Accept': 'application/json',\n      'Content-Type': 'application/json'\n    }\n  }\n);\n",
        "python": "import requests\n\nheaders = {\n    'Accept': 'application/json',\n    'Content-Type': 'application/json',\n}\n\njson_data = {\n    'orderId': 'ORD-2025-8888',\n    'buyer': {\n        'id': 1001,\n        'username': 'star_whisper',\n        'role': 'admin',\n    },\n    'items': [\n        {\n            'productId': 99,\n            'name': '高级机械键盘',\n            'tags': [\n                '数码',\n            ],\n        },\n    ],\n}\n\nresponse = requests.post('https://api.example.com/v1/orders', headers=headers, json=json_data)\n\n# Note: json_data will not be serialized by requests\n# exactly as it was in the original request.\n#data = '{\"orderId\":\"ORD-2025-8888\",\"buyer\":{\"id\":1001,\"username\":\"star_whisper\",\"role\":\"admin\"},\"items\":[{\"productId\":99,\"name\":\"高级机械键盘\",\"tags\":[\"数码\"]}]}'.encode()\n#response = requests.post('https://api.example.com/v1/orders', headers=headers, data=data)\n"
      }
    },
    {
      "service": "example",
      "version": "v2",
      "method": "get",
      "path": "/orders/{orderId}",
      "operationId": "getOrderDetailV1",
      "summary": "获取订单详情 (旧)",
      "tags": [
        "订单管理(Legacy)"
      ],
      "deprecated": true,
      "parameters": [
        {
          "name": "orderId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string"
          }
        }
      ],
      "responses": [
        {
          "status": "200",
          "description": "兼容性返回",
          "schema": {
            "type": "object"
          },
          "resolvedSchema": {
            "type": "object"
          },
          "exampleJson": "null"
        }
      ],
      "searchText": "getOrderDetailV1\n/orders/{orderId}\n获取订单详情 (旧)\n订单管理(Legacy)",
      "curlExample": "curl -X GET 'https://api.example.com/v2/orders/<orderId>' -H 'Accept: application/json'",
      "codeExamples": {
        "fetch": "import fetch from 'node-fetch';\n\nfetch('https://api.example.com/v2/orders/<orderId>', {\n  headers: {\n    'Accept': 'application/json'\n  }\n});\n",
        "axios": "import axios from 'axios';\n\nconst response = await axios.get('https://api.example.com/v2/orders/<orderId>', {\n  headers: {\n    'Accept': 'application/json'\n  }\n});\n",
        "python": "import requests\n\nheaders = {\n    'Accept': 'application/json',\n}\n\nresponse = requests.get('https://api.example.com/v2/orders/<orderId>', headers=headers)\n"
      }
    },
    {
      "service": "example",
      "version": "v2",
      "method": "get",
      "path": "/trade-orders/{orderId}",
      "operationId": "getTradeOrderDetail",
      "summary": "获取交易订单详情 (新)",
      "tags": [
        "交易中心"
      ],
      "deprecated": false,
      "parameters": [
        {
          "name": "orderId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string"
          }
        }
      ],
      "responses": [
        {
          "status": "200",
          "description": "成功",
          "schema": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string"
              }
            }
          },
          "resolvedSchema": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string"
              }
            }
          },
          "exampleJson": "{\n  \"id\": \"string\"\n}"
        }
      ],
      "searchText": "getTradeOrderDetail\n/trade-orders/{orderId}\n获取交易订单详情 (新)\n交易中心",
      "curlExample": "curl -X GET 'https://api.example.com/v2/trade-orders/<orderId>' -H 'Accept: application/json'",
      "codeExamples": {
        "fetch": "import fetch from 'node-fetch';\n\nfetch('https://api.example.com/v2/trade-orders/<orderId>', {\n  headers: {\n    'Accept': 'application/json'\n  }\n});\n",
        "axios": "import axios from 'axios';\n\nconst response = await axios.get('https://api.example.com/v2/trade-orders/<orderId>', {\n  headers: {\n    'Accept': 'application/json'\n  }\n});\n",
        "python": "import requests\n\nheaders = {\n    'Accept': 'application/json',\n}\n\nresponse = requests.get('https://api.example.com/v2/trade-orders/<orderId>', headers=headers)\n"
      }
    },
    {
      "service": "github-contributions-api",
      "version": "v4",
      "method": "get",
      "path": "/",
      "operationId": "getWelcome",
      "summary": "获取 API 欢迎信息",
      "description": "返回 API 的基本信息和文档链接",
      "tags": [
        "contributions"
      ],
      "deprecated": false,
      "parameters": [],
      "responses": [
        {
          "status": "200",
          "description": "成功返回欢迎信息",
          "schema": {
            "type": "object",
            "properties": {
              "message": {
                "type": "string",
                "example": "Welcome to the GitHub Contributions API."
              },
              "version": {
                "type": "string",
                "example": "v4"
              },
              "docs": {
                "type": "string",
                "format": "uri",
                "example": "https://github-contributions-api.jogruber.de"
              }
            }
          },
          "resolvedSchema": {
            "type": "object",
            "properties": {
              "message": {
                "type": "string"
              },
              "version": {
                "type": "string"
              },
              "docs": {
                "type": "string"
              }
            }
          },
          "exampleJson": "{\n  \"message\": \"Welcome to the GitHub Contributions API.\",\n  \"version\": \"v4\",\n  \"docs\": \"https://github-contributions-api.jogruber.de\"\n}"
        }
      ],
      "searchText": "getWelcome\n/\n获取 API 欢迎信息\n返回 API 的基本信息和文档链接\ncontributions",
      "curlExample": "curl -X GET 'https://github-contributions-api.jogruber.de/' -H 'Accept: application/json'",
      "codeExamples": {
        "fetch": "import fetch from 'node-fetch';\n\nfetch('https://github-contributions-api.jogruber.de/', {\n  headers: {\n    'Accept': 'application/json'\n  }\n});\n",
        "axios": "import axios from 'axios';\n\nconst response = await axios.get('https://github-contributions-api.jogruber.de/', {\n  headers: {\n    'Accept': 'application/json'\n  }\n});\n",
        "python": "import requests\n\nheaders = {\n    'Accept': 'application/json',\n}\n\nresponse = requests.get('https://github-contributions-api.jogruber.de/', headers=headers)\n"
      }
    },
    {
      "service": "github-contributions-api",
      "version": "v4",
      "method": "get",
      "path": "/v4",
      "operationId": "redirectToRoot",
      "summary": "重定向到根路径",
      "description": "重定向到 API 根路径",
      "tags": [
        "contributions"
      ],
      "deprecated": false,
      "parameters": [],
      "responses": [
        {
          "status": "302",
          "description": "重定向到根路径"
        }
      ],
      "searchText": "redirectToRoot\n/v4\n重定向到根路径\n重定向到 API 根路径\ncontributions",
      "curlExample": "curl -X GET 'https://github-contributions-api.jogruber.de/v4' -H 'Accept: application/json'",
      "codeExamples": {
        "fetch": "import fetch from 'node-fetch';\n\nfetch('https://github-contributions-api.jogruber.de/v4', {\n  headers: {\n    'Accept': 'application/json'\n  }\n});\n",
        "axios": "import axios from 'axios';\n\nconst response = await axios.get('https://github-contributions-api.jogruber.de/v4', {\n  headers: {\n    'Accept': 'application/json'\n  }\n});\n",
        "python": "import requests\n\nheaders = {\n    'Accept': 'application/json',\n}\n\nresponse = requests.get('https://github-contributions-api.jogruber.de/v4', headers=headers)\n"
      }
    },
    {
      "service": "github-contributions-api",
      "version": "v4",
      "method": "get",
      "path": "/v4/{username}",
      "operationId": "getUserContributions",
      "summary": "获取用户的 GitHub 贡献数据",
      "description": "根据 GitHub 用户名获取该用户的贡献历史数据。支持按年份筛选和嵌套格式输出。\n\n**缓存机制**：\n- 结果默认缓存 1 小时\n- 可通过 `cache-control: no-cache` 请求头强制刷新（请谨慎使用）\n- 响应头包含 `age` 和 `x-cache` 字段提供缓存状态信息\n",
      "tags": [
        "contributions"
      ],
      "deprecated": false,
      "parameters": [
        {
          "name": "username",
          "in": "path",
          "required": true,
          "description": "GitHub 用户名",
          "schema": {
            "type": "string"
          }
        },
        {
          "name": "y",
          "in": "query",
          "required": false,
          "description": "年份筛选参数，可以是：\n- 具体年份数字（如 2020）\n- `all`：所有年份（默认）\n- `last`：最近一年（GitHub 默认视图）\n- 可多次传递以选择多个年份\n",
          "schema": {
            "oneOf": [
              {
                "type": "string",
                "enum": [
                  "all",
                  "last"
                ]
              },
              {
                "type": "integer",
                "minimum": 2000
              },
              {
                "type": "array",
                "items": {
                  "oneOf": [
                    {
                      "type": "string",
                      "enum": [
                        "all",
                        "last"
                      ]
                    },
                    {
                      "type": "integer",
                      "minimum": 2000
                    }
                  ]
                }
              }
            ]
          }
        },
        {
          "name": "format",
          "in": "query",
          "required": false,
          "description": "响应数据格式，`nested` 表示按年/月/日嵌套的对象结构",
          "schema": {
            "type": "string",
            "enum": [
              "nested"
            ]
          }
        },
        {
          "name": "cache-control",
          "in": "header",
          "required": false,
          "description": "缓存控制，使用 `no-cache` 可强制刷新数据",
          "schema": {
            "type": "string",
            "enum": [
              "no-cache"
            ]
          }
        }
      ],
      "responses": [
        {
          "status": "200",
          "description": "成功返回贡献数据",
          "schema": {
            "oneOf": [
              {
                "$ref": "#/components/schemas/Response"
              },
              {
                "$ref": "#/components/schemas/NestedResponse"
              }
            ]
          },
          "resolvedSchema": {},
          "exampleJson": "null"
        },
        {
          "status": "400",
          "description": "请求参数错误",
          "schema": {
            "$ref": "#/components/schemas/ErrorResponse"
          },
          "resolvedSchema": {
            "type": "object",
            "properties": {
              "error": {
                "type": "string",
                "description": "错误信息描述"
              }
            },
            "required": [
              "error"
            ],
            "description": "错误响应"
          },
          "exampleJson": "{\n  \"error\": \"User \\\"username\\\" not found.\"\n}"
        },
        {
          "status": "404",
          "description": "用户不存在",
          "schema": {
            "$ref": "#/components/schemas/ErrorResponse"
          },
          "resolvedSchema": {
            "type": "object",
            "properties": {
              "error": {
                "type": "string",
                "description": "错误信息描述"
              }
            },
            "required": [
              "error"
            ],
            "description": "错误响应"
          },
          "exampleJson": "{\n  \"error\": \"User \\\"username\\\" not found.\"\n}"
        },
        {
          "status": "500",
          "description": "服务器内部错误",
          "schema": {
            "$ref": "#/components/schemas/ErrorResponse"
          },
          "resolvedSchema": {
            "type": "object",
            "properties": {
              "error": {
                "type": "string",
                "description": "错误信息描述"
              }
            },
            "required": [
              "error"
            ],
            "description": "错误响应"
          },
          "exampleJson": "{\n  \"error\": \"User \\\"username\\\" not found.\"\n}"
        }
      ],
      "searchText": "getUserContributions\n/v4/{username}\n获取用户的 GitHub 贡献数据\n根据 GitHub 用户名获取该用户的贡献历史数据。支持按年份筛选和嵌套格式输出。\n\n**缓存机制**：\n- 结果默认缓存 1 小时\n- 可通过 `cache-control: no-cache` 请求头强制刷新（请谨慎使用）\n- 响应头包含 `age` 和 `x-cache` 字段提供缓存状态信息\n\ncontributions",
      "curlExample": "curl -X GET 'https://github-contributions-api.jogruber.de/v4/<username>?y=<y>&format=<format>' -H 'Accept: application/json'",
      "codeExamples": {
        "fetch": "import fetch from 'node-fetch';\n\nfetch('https://github-contributions-api.jogruber.de/v4/<username>?y=<y>&format=<format>', {\n  headers: {\n    'Accept': 'application/json'\n  }\n});\n",
        "axios": "import axios from 'axios';\n\nconst response = await axios.get('https://github-contributions-api.jogruber.de/v4/<username>?y=<y>&format=<format>', {\n  headers: {\n    'Accept': 'application/json'\n  }\n});\n",
        "python": "import requests\n\nheaders = {\n    'Accept': 'application/json',\n}\n\nresponse = requests.get('https://github-contributions-api.jogruber.de/v4/<username>?y=<y>&format=<format>', headers=headers)\n"
      }
    }
  ]
};
