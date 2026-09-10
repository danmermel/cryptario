# cryptario
module "cryptario" {
  source        = "./modules/apicall"
  function_name = "cryptario"
  role          = aws_iam_role.cryptarioLambdaRole.arn
}


output "cryptarioFunctionUrl" {
  value = module.cryptario.url
}

module "mcp" {
  source        = "./modules/apicall"
  function_name = "mcp"
  role          = aws_iam_role.cryptarioLambdaRole.arn
}


output "mcpFunctionUrl" {
  value = module.mcp.url
}