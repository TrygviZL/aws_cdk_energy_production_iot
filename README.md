# AWS CDK - Energy production streaming pipeline 

I was originally looking for an excuse to learn Vim but needed a project to do it with, so I decided to create a small app based around a public API with the Faroese energy production data. All infrastructure and logic is written in Typescript and deployed using aws CDK. Additionally a simple CI/CD pipeline is setup using GitHub Actions which deploys the application when a branch is merged with main.

## Energy data

The energy production on the Faroe Islands is handled by the public comany SEV. On their webpage https://www.sev.fo/framleidsla/el-orka-i-foroyum/ they show the current energy production across all types from biogas to oil. While there is to my knowledge no public API to call historic data for the energy production, the endpoint which genereates the data for this page is https://www.sev.fo/api/realtimemap/now/. This endpoint returns the current energy data including a timestamp.

## Application
![AWS architecture](https://github.com/TrygviZL/aws_cdk_energy_production_iot/blob/main/static/FirehoseToS3.png?raw=true)

## To-Do
* Setup Lambda function to fetch data and dynamically parse it to JSON
* Setup Kinesis Firehose to recieve data and create partitions dynamically based on incomming data
* Create S3 bucket for storing data
* Write unit test around Lambda function
* Write IaC test around stateful recourses to avoid uninteded destruction
