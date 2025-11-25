// 此文件由 generateApiSpecs.ts 自动生成，请勿手动修改。
import type { ApiSpecsGenerated } from '../../config/api/types';

export const apiSpecs: ApiSpecsGenerated = {
  "bundles": [
    {
      "service": "toolbox",
      "version": "v1",
      "raw": {
        "openapi": "3.0.3",
        "info": {
          "title": "Toolbox API",
          "version": "v1",
          "description": "基础工具箱服务的接口集合（示例）。"
        },
        "servers": [
          {
            "url": "https://api.example.com",
            "description": "示例主服务"
          }
        ],
        "tags": [
          {
            "name": "video",
            "description": "视频处理相关接口"
          },
          {
            "name": "util",
            "description": "通用工具函数接口"
          }
        ],
        "paths": {
          "/videos/{id}": {
            "get": {
              "operationId": "getVideoById",
              "summary": "获取单个视频元信息",
              "description": "根据视频唯一标识返回元信息（不含实际文件）。",
              "tags": [
                "video"
              ],
              "parameters": [
                {
                  "name": "id",
                  "in": "path",
                  "required": true,
                  "description": "视频ID",
                  "schema": {
                    "type": "string"
                  }
                },
                {
                  "name": "includeDetails",
                  "in": "query",
                  "required": false,
                  "description": "是否包含附加细节",
                  "schema": {
                    "type": "boolean"
                  }
                }
              ],
              "responses": {
                "200": {
                  "description": "成功返回",
                  "content": {
                    "application/json": {
                      "schema": {
                        "$ref": "#/components/schemas/VideoMeta"
                      }
                    }
                  }
                },
                "404": {
                  "description": "视频不存在"
                }
              },
              "x-error-codes": [
                {
                  "code": "VIDEO_NOT_FOUND",
                  "httpStatus": 404,
                  "message": "视频不存在",
                  "solution": "请检查视频ID是否正确"
                }
              ]
            },
            "delete": {
              "operationId": "deleteVideo",
              "summary": "删除视频",
              "description": "删除指定视频记录（异步删除文件）。",
              "tags": [
                "video"
              ],
              "parameters": [
                {
                  "name": "id",
                  "in": "path",
                  "required": true,
                  "description": "视频ID",
                  "schema": {
                    "type": "string"
                  }
                }
              ],
              "responses": {
                "204": {
                  "description": "删除成功，无内容"
                },
                "404": {
                  "description": "视频不存在"
                }
              }
            }
          },
          "/videos": {
            "post": {
              "operationId": "createVideo",
              "summary": "创建新视频记录",
              "description": "上传视频元信息并生成记录（文件需单独上传）。",
              "tags": [
                "video"
              ],
              "requestBody": {
                "required": true,
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/VideoCreateRequest"
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
                        "$ref": "#/components/schemas/VideoMeta"
                      }
                    }
                  }
                },
                "400": {
                  "description": "请求参数错误"
                }
              },
              "x-error-codes": [
                {
                  "code": "INVALID_VIDEO_TITLE",
                  "httpStatus": 400,
                  "message": "标题不能为空或过长",
                  "solution": "标题长度应在1-100字符之间"
                }
              ]
            }
          },
          "/utils/ping": {
            "get": {
              "operationId": "ping",
              "summary": "健康检查",
              "tags": [
                "util"
              ],
              "responses": {
                "200": {
                  "description": "服务正常",
                  "content": {
                    "text/plain": {
                      "schema": {
                        "type": "string"
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
            "VideoMeta": {
              "type": "object",
              "properties": {
                "id": {
                  "type": "string"
                },
                "title": {
                  "type": "string"
                },
                "duration": {
                  "type": "integer"
                }
              },
              "required": [
                "id",
                "title"
              ]
            },
            "VideoCreateRequest": {
              "type": "object",
              "properties": {
                "title": {
                  "type": "string",
                  "description": "视频标题",
                  "example": "我的第一个视频"
                },
                "duration": {
                  "type": "integer",
                  "description": "视频时长（秒）",
                  "example": 120
                },
                "tags": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  },
                  "description": "标签列表",
                  "example": [
                    "教程",
                    "编程"
                  ]
                }
              },
              "required": [
                "title"
              ]
            }
          }
        }
      },
      "endpoints": [
        {
          "service": "toolbox",
          "version": "v1",
          "method": "get",
          "path": "/videos/{id}",
          "operationId": "getVideoById",
          "summary": "获取单个视频元信息",
          "description": "根据视频唯一标识返回元信息（不含实际文件）。",
          "tags": [
            "video"
          ],
          "deprecated": false,
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "required": true,
              "description": "视频ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "includeDetails",
              "in": "query",
              "required": false,
              "description": "是否包含附加细节",
              "schema": {
                "type": "boolean"
              }
            }
          ],
          "responses": [
            {
              "status": "200",
              "description": "成功返回",
              "schema": {
                "$ref": "#/components/schemas/VideoMeta"
              },
              "resolvedSchema": {
                "type": "object",
                "properties": {
                  "id": {
                    "type": "string"
                  },
                  "title": {
                    "type": "string"
                  },
                  "duration": {
                    "type": "integer"
                  }
                },
                "required": [
                  "id",
                  "title"
                ]
              },
              "exampleJson": "{\n  \"id\": \"string\",\n  \"title\": \"string\",\n  \"duration\": 0\n}"
            },
            {
              "status": "404",
              "description": "视频不存在"
            }
          ],
          "errorCodes": [
            {
              "code": "VIDEO_NOT_FOUND",
              "httpStatus": 404,
              "message": "视频不存在",
              "solution": "请检查视频ID是否正确"
            }
          ],
          "searchText": "getVideoById\n/videos/{id}\n获取单个视频元信息\n根据视频唯一标识返回元信息（不含实际文件）。\nvideo",
          "curlExample": "curl -X GET 'https://api.example.com/videos/<id>?includeDetails=<includeDetails>' -H 'Accept: application/json'"
        },
        {
          "service": "toolbox",
          "version": "v1",
          "method": "delete",
          "path": "/videos/{id}",
          "operationId": "deleteVideo",
          "summary": "删除视频",
          "description": "删除指定视频记录（异步删除文件）。",
          "tags": [
            "video"
          ],
          "deprecated": false,
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "required": true,
              "description": "视频ID",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": [
            {
              "status": "204",
              "description": "删除成功，无内容"
            },
            {
              "status": "404",
              "description": "视频不存在"
            }
          ],
          "searchText": "deleteVideo\n/videos/{id}\n删除视频\n删除指定视频记录（异步删除文件）。\nvideo",
          "curlExample": "curl -X DELETE 'https://api.example.com/videos/<id>' -H 'Accept: application/json'"
        },
        {
          "service": "toolbox",
          "version": "v1",
          "method": "post",
          "path": "/videos",
          "operationId": "createVideo",
          "summary": "创建新视频记录",
          "description": "上传视频元信息并生成记录（文件需单独上传）。",
          "tags": [
            "video"
          ],
          "deprecated": false,
          "parameters": [],
          "requestBody": {
            "mimeType": "application/json",
            "schema": {
              "$ref": "#/components/schemas/VideoCreateRequest"
            },
            "resolvedSchema": {
              "type": "object",
              "properties": {
                "title": {
                  "type": "string",
                  "description": "视频标题"
                },
                "duration": {
                  "type": "integer",
                  "description": "视频时长（秒）"
                },
                "tags": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  },
                  "description": "标签列表"
                }
              },
              "required": [
                "title"
              ]
            },
            "exampleJson": "{\n  \"title\": \"我的第一个视频\",\n  \"duration\": 120,\n  \"tags\": [\n    \"教程\",\n    \"编程\"\n  ]\n}",
            "required": true
          },
          "responses": [
            {
              "status": "201",
              "description": "创建成功",
              "schema": {
                "$ref": "#/components/schemas/VideoMeta"
              },
              "resolvedSchema": {
                "type": "object",
                "properties": {
                  "id": {
                    "type": "string"
                  },
                  "title": {
                    "type": "string"
                  },
                  "duration": {
                    "type": "integer"
                  }
                },
                "required": [
                  "id",
                  "title"
                ]
              },
              "exampleJson": "{\n  \"id\": \"string\",\n  \"title\": \"string\",\n  \"duration\": 0\n}"
            },
            {
              "status": "400",
              "description": "请求参数错误"
            }
          ],
          "errorCodes": [
            {
              "code": "INVALID_VIDEO_TITLE",
              "httpStatus": 400,
              "message": "标题不能为空或过长",
              "solution": "标题长度应在1-100字符之间"
            }
          ],
          "searchText": "createVideo\n/videos\n创建新视频记录\n上传视频元信息并生成记录（文件需单独上传）。\nvideo",
          "curlExample": "curl -X POST 'https://api.example.com/videos' -H 'Accept: application/json' -H 'Content-Type: application/json' -d '{\"title\":\"我的第一个视频\",\"duration\":120,\"tags\":[\"教程\",\"编程\"]}'"
        },
        {
          "service": "toolbox",
          "version": "v1",
          "method": "get",
          "path": "/utils/ping",
          "operationId": "ping",
          "summary": "健康检查",
          "tags": [
            "util"
          ],
          "deprecated": false,
          "parameters": [],
          "responses": [
            {
              "status": "200",
              "description": "服务正常"
            }
          ],
          "searchText": "ping\n/utils/ping\n健康检查\nutil",
          "curlExample": "curl -X GET 'https://api.example.com/utils/ping' -H 'Accept: application/json'"
        }
      ]
    }
  ],
  "allEndpoints": [
    {
      "service": "toolbox",
      "version": "v1",
      "method": "get",
      "path": "/videos/{id}",
      "operationId": "getVideoById",
      "summary": "获取单个视频元信息",
      "description": "根据视频唯一标识返回元信息（不含实际文件）。",
      "tags": [
        "video"
      ],
      "deprecated": false,
      "parameters": [
        {
          "name": "id",
          "in": "path",
          "required": true,
          "description": "视频ID",
          "schema": {
            "type": "string"
          }
        },
        {
          "name": "includeDetails",
          "in": "query",
          "required": false,
          "description": "是否包含附加细节",
          "schema": {
            "type": "boolean"
          }
        }
      ],
      "responses": [
        {
          "status": "200",
          "description": "成功返回",
          "schema": {
            "$ref": "#/components/schemas/VideoMeta"
          },
          "resolvedSchema": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string"
              },
              "title": {
                "type": "string"
              },
              "duration": {
                "type": "integer"
              }
            },
            "required": [
              "id",
              "title"
            ]
          },
          "exampleJson": "{\n  \"id\": \"string\",\n  \"title\": \"string\",\n  \"duration\": 0\n}"
        },
        {
          "status": "404",
          "description": "视频不存在"
        }
      ],
      "errorCodes": [
        {
          "code": "VIDEO_NOT_FOUND",
          "httpStatus": 404,
          "message": "视频不存在",
          "solution": "请检查视频ID是否正确"
        }
      ],
      "searchText": "getVideoById\n/videos/{id}\n获取单个视频元信息\n根据视频唯一标识返回元信息（不含实际文件）。\nvideo",
      "curlExample": "curl -X GET 'https://api.example.com/videos/<id>?includeDetails=<includeDetails>' -H 'Accept: application/json'"
    },
    {
      "service": "toolbox",
      "version": "v1",
      "method": "delete",
      "path": "/videos/{id}",
      "operationId": "deleteVideo",
      "summary": "删除视频",
      "description": "删除指定视频记录（异步删除文件）。",
      "tags": [
        "video"
      ],
      "deprecated": false,
      "parameters": [
        {
          "name": "id",
          "in": "path",
          "required": true,
          "description": "视频ID",
          "schema": {
            "type": "string"
          }
        }
      ],
      "responses": [
        {
          "status": "204",
          "description": "删除成功，无内容"
        },
        {
          "status": "404",
          "description": "视频不存在"
        }
      ],
      "searchText": "deleteVideo\n/videos/{id}\n删除视频\n删除指定视频记录（异步删除文件）。\nvideo",
      "curlExample": "curl -X DELETE 'https://api.example.com/videos/<id>' -H 'Accept: application/json'"
    },
    {
      "service": "toolbox",
      "version": "v1",
      "method": "post",
      "path": "/videos",
      "operationId": "createVideo",
      "summary": "创建新视频记录",
      "description": "上传视频元信息并生成记录（文件需单独上传）。",
      "tags": [
        "video"
      ],
      "deprecated": false,
      "parameters": [],
      "requestBody": {
        "mimeType": "application/json",
        "schema": {
          "$ref": "#/components/schemas/VideoCreateRequest"
        },
        "resolvedSchema": {
          "type": "object",
          "properties": {
            "title": {
              "type": "string",
              "description": "视频标题"
            },
            "duration": {
              "type": "integer",
              "description": "视频时长（秒）"
            },
            "tags": {
              "type": "array",
              "items": {
                "type": "string"
              },
              "description": "标签列表"
            }
          },
          "required": [
            "title"
          ]
        },
        "exampleJson": "{\n  \"title\": \"我的第一个视频\",\n  \"duration\": 120,\n  \"tags\": [\n    \"教程\",\n    \"编程\"\n  ]\n}",
        "required": true
      },
      "responses": [
        {
          "status": "201",
          "description": "创建成功",
          "schema": {
            "$ref": "#/components/schemas/VideoMeta"
          },
          "resolvedSchema": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string"
              },
              "title": {
                "type": "string"
              },
              "duration": {
                "type": "integer"
              }
            },
            "required": [
              "id",
              "title"
            ]
          },
          "exampleJson": "{\n  \"id\": \"string\",\n  \"title\": \"string\",\n  \"duration\": 0\n}"
        },
        {
          "status": "400",
          "description": "请求参数错误"
        }
      ],
      "errorCodes": [
        {
          "code": "INVALID_VIDEO_TITLE",
          "httpStatus": 400,
          "message": "标题不能为空或过长",
          "solution": "标题长度应在1-100字符之间"
        }
      ],
      "searchText": "createVideo\n/videos\n创建新视频记录\n上传视频元信息并生成记录（文件需单独上传）。\nvideo",
      "curlExample": "curl -X POST 'https://api.example.com/videos' -H 'Accept: application/json' -H 'Content-Type: application/json' -d '{\"title\":\"我的第一个视频\",\"duration\":120,\"tags\":[\"教程\",\"编程\"]}'"
    },
    {
      "service": "toolbox",
      "version": "v1",
      "method": "get",
      "path": "/utils/ping",
      "operationId": "ping",
      "summary": "健康检查",
      "tags": [
        "util"
      ],
      "deprecated": false,
      "parameters": [],
      "responses": [
        {
          "status": "200",
          "description": "服务正常"
        }
      ],
      "searchText": "ping\n/utils/ping\n健康检查\nutil",
      "curlExample": "curl -X GET 'https://api.example.com/utils/ping' -H 'Accept: application/json'"
    }
  ]
};
