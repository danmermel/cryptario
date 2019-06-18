# Cryptario

A cryptic crossword solving service.

## Dependencies

- Node.js
- Terraform
- aws-cli

Check out this GitHub repository.

## Deployment

## Staging

```sh
# Create infrastructure
cd terraform
terraform workspace set stage
terraform apply

# Add test data
cd ..
cd scripts
cp stagedata.txt data.txt
# !edit config.json to add "stage" to the database name
node bulkimport.js

# Deploy code
cd ..
cd lambda
./deploy.sh stage
```

## Production

```sh
# Create infrastructure
cd terraform
terraform workspace set prod
terraform apply

# Add test data
cd ..
cd scripts
cp proddata.txt data.txt
# !edit config.json to add "prod" to the database name
node bulkimport.js

# Deploy code
cd ..
cd lambda
./deploy.sh prod
```
