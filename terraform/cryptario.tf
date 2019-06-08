data "aws_region" "current" {}
data "aws_caller_identity" "current" {}

provider "aws" {
  region = "eu-west-1"
}



// DynamoDB dictionary table
resource "aws_dynamodb_table" "cryptario-dictionary-db" {
  name = "cryptarioDictionary-${terraform.workspace}"
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
  name = "cryptario${terraform.workspace}"
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
  function_name = "cryptario-anagram-${terraform.workspace}"
  role = "${aws_iam_role.cryptario_lambda_role.arn}"
  handler = "index.handler"
  runtime = "nodejs8.10"
}

// create an API gateway
resource "aws_api_gateway_rest_api" "cryptario_api" {
  name = "cryptario-${terraform.workspace}"
}

module "anagram_method" {
  source = "./modules/apimethod"
  api_id = "${aws_api_gateway_rest_api.cryptario_api.id}"
  api_root_resource_id = "${aws_api_gateway_rest_api.cryptario_api.root_resource_id}"
  api_path_part = "anagram"
  api_lambda_arn = "${aws_lambda_function.cryptario_anagram_lambda.arn}"
  api_lambda_name = "${aws_lambda_function.cryptario_anagram_lambda.function_name}"
  api_region = "${data.aws_region.current.name}"
  api_account_id = "${data.aws_caller_identity.current.account_id}"
}

# create api gateway deployment
resource "aws_api_gateway_deployment" "cryptario_api_deployment" {
#  depends_on = ["anagram_method"]
  rest_api_id = "${aws_api_gateway_rest_api.cryptario_api.id}"
  stage_name = "${terraform.workspace}"
}



