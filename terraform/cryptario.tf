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

resource "aws_lambda_function" "cryptario_anagram_lambda" {
  filename = "dummy.zip"
  function_name = "cryptario-anagram-prod"
  role = "${aws_iam_role.cryptario_lambda_role.arn}"
  handler = "index.handler"
  runtime = "nodejs8.10"
}

