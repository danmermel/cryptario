data "aws_region" "current" {}
data "aws_caller_identity" "current" {}

provider "aws" {
  region = "eu-west-1"
}



// DynamoDB dictionary table
resource "aws_dynamodb_table" "cryptario-dictionary-db" {
  name = "cryptarioDictionary-prod"
  billing_mode = "PAY_PER_REQUEST"
  hash_key = "id"
  attribute {
   name = "id"
   type = "S"
  }
  attribute {
   name = "problem"
   type = "S"
  }
  attribute {
   name = "solution"
   type = "S"
  }
  global_secondary_index {
    name = "problem-index"
    hash_key = "problem"
    projection_type = "INCLUDE"
    non_key_attributes = ["solution"]
  }
  global_secondary_index {
    name = "solution-index"
    hash_key = "solution"
    projection_type = "INCLUDE"
    non_key_attributes = ["problem"]
  }
}

// AWS Role for Lambda
resource "aws_iam_role" "cryptario_lambda_role" {
  name = "cryptarioprod"
  assume_role_policy = <<EOF
{
 "Version": "2012-10-17",
 "Statement": [{
   "Effect": "Allow",
   "Principal": {"Service": "lambda.amazonaws.com"},
   "Action": "sts:AssumeRole"
  }
 ]
}
  EOF
}

// Adding logs access to our tole
resource "aws_iam_role_policy" "logs_policy" {
  name = "logs_policy"
  role = "${aws_iam_role.cryptario_lambda_role.id}"
  policy = <<EOF
{
 "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "arn:aws:logs:*:*:*"
        }
    ]
}
  EOF
}

// Adding DynamoDB access to our Lambda role
resource "aws_iam_role_policy_attachment" "cryptario_role_attach" {
  role = "${aws_iam_role.cryptario_lambda_role.name}"
  policy_arn = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
}

// create stub Lambda function with dummy code
resource "aws_lambda_function" "cryptario_anagram_lambda" {
  filename = "dummy.zip"
  function_name = "cryptario-anagram-prod"
  role = "${aws_iam_role.cryptario_lambda_role.arn}"
  handler = "index.handler"
  runtime = "nodejs8.10"
}

// create an API gateway
resource "aws_api_gateway_rest_api" "cryptario_api" {
  name = "cryptario-prod"
}

// create anagram path in the API gateway
resource "aws_api_gateway_resource" "cryptario_anagram_resource" {
  rest_api_id = "${aws_api_gateway_rest_api.cryptario_api.id}"
  parent_id = "${aws_api_gateway_rest_api.cryptario_api.root_resource_id}"
  path_part = "anagram"
}

// specify ANY HTTP method is allowed
resource "aws_api_gateway_method" "cryptario_anagram_method" {
  rest_api_id = "${aws_api_gateway_rest_api.cryptario_api.id}"
  resource_id = "${aws_api_gateway_resource.cryptario_anagram_resource.id}"
  http_method = "ANY"
  authorization = "NONE"
}

// integrate this API call with its Lambda function
resource "aws_api_gateway_integration" "cryptario_anagram_integration" {
  depends_on = ["aws_api_gateway_method.cryptario_anagram_method"]
  rest_api_id = "${aws_api_gateway_rest_api.cryptario_api.id}"
  resource_id = "${aws_api_gateway_resource.cryptario_anagram_resource.id}"
  http_method  = "${aws_api_gateway_method.cryptario_anagram_method.http_method}"
  integration_http_method = "POST"
  type = "AWS_PROXY"
  uri = "arn:aws:apigateway:${data.aws_region.current.name}:lambda:path/2015-03-31/functions/${aws_lambda_function.cryptario_anagram_lambda.arn}/invocations"
  passthrough_behavior = "WHEN_NO_MATCH"
  content_handling = "CONVERT_TO_TEXT"
  cache_namespace = "${aws_api_gateway_resource.cryptario_anagram_resource.id}"
  timeout_milliseconds = 5000 
}

// create an OPTIONS method for CORS
resource "aws_api_gateway_method" "cryptario_anagram_options_method" {
  rest_api_id = "${aws_api_gateway_rest_api.cryptario_api.id}"
  resource_id = "${aws_api_gateway_resource.cryptario_anagram_resource.id}"
  http_method = "OPTIONS"
  authorization = "NONE"
}

// create an integration for the OPTIONS method
resource "aws_api_gateway_integration" "cryptario_anagram_options_integration" {
  depends_on = ["aws_api_gateway_method.cryptario_anagram_options_method"]
  rest_api_id = "${aws_api_gateway_rest_api.cryptario_api.id}"
  resource_id = "${aws_api_gateway_resource.cryptario_anagram_resource.id}"
  http_method  = "${aws_api_gateway_method.cryptario_anagram_options_method.http_method}"
  type = "MOCK"
  passthrough_behavior = "WHEN_NO_MATCH"
  cache_namespace = "${aws_api_gateway_resource.cryptario_anagram_resource.id}"
  timeout_milliseconds = 29000
  request_templates = {
    "application/json" = <<EOF
      {"statusCode": 200}
    EOF 
  }
}

# create method response for anagram
resource "aws_api_gateway_method_response" "cryptario_anagram_200" {
  rest_api_id = "${aws_api_gateway_rest_api.cryptario_api.id}"
  resource_id = "${aws_api_gateway_resource.cryptario_anagram_resource.id}"
  http_method = "${aws_api_gateway_method.cryptario_anagram_options_method.http_method}"
  status_code = "200"
  response_parameters = {"method.response.header.Access-Control-Allow-Origin"=false,"method.response.header.Access-Control-Allow-Methods"=false ,"method.response.header.Access-Control-Allow-Headers"= false}
  response_models = {"application/json"="Empty"}
}

# create integration response for anagram
resource "aws_api_gateway_integration_response" "cryptario_anagram_integration_response" {
  rest_api_id = "${aws_api_gateway_rest_api.cryptario_api.id}"
  resource_id = "${aws_api_gateway_resource.cryptario_anagram_resource.id}"
  http_method = "${aws_api_gateway_method.cryptario_anagram_options_method.http_method}"
  status_code = "200"
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"= "'*'",
      "method.response.header.Access-Control-Allow-Methods"= "'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT'",
      "method.response.header.Access-Control-Allow-Headers"= "'*'"
    }
  response_templates = {"application/json"= ""}
}

# create api gateway deployment
resource "aws_api_gateway_deployment" "cryptario_api_deployment" {
  depends_on = ["aws_api_gateway_integration.cryptario_anagram_integration","aws_api_gateway_integration.cryptario_anagram_options_integration"]
  rest_api_id = "${aws_api_gateway_rest_api.cryptario_api.id}"
  stage_name = "prod"
}

resource "aws_lambda_permission" "allow_api_gateway" {
  function_name = "${aws_lambda_function.cryptario_anagram_lambda.function_name}"
  statement_id = "${aws_lambda_function.cryptario_anagram_lambda.function_name}"
  action = "lambda:*"
  principal = "apigateway.amazonaws.com"
  source_arn = "arn:aws:execute-api:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:${aws_api_gateway_rest_api.cryptario_api.id}/*/*/analyze"
}


