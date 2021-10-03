import * as cdk from '@aws-cdk/core';
import { Bucket } from '@aws-cdk/aws-s3';
import * as kinesis from '@aws-cdk/aws-kinesisfirehose';
import * as destinations from '@aws-cdk/aws-kinesisfirehose-destinations';
import * as lambdanodejs from '@aws-cdk/aws-lambda-nodejs';
import * as lambda from '@aws-cdk/aws-lambda';
import * as targets from '@aws-cdk/aws-events-targets'
import * as events from '@aws-cdk/aws-events'


export class AwsCdkEnergyProductionIoTStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const rawBucket = new Bucket(this, 'rawBucket')

    const sources = [
      'sev',
      'vorn',
    ]
    
    sources.map((id: string) => {

      const s3destination = new destinations.S3Bucket(rawBucket, {
        dataOutputPrefix: `${id}` + 'data/year=!{timestamp:yyyy}/month=!{timestamp:MM}/day=!{timestamp:dd}/',
        errorOutputPrefix: `${id}` + 'dataError/!{firehose:error-output-type}/year=!{timestamp:yyyy}/month=!{timestamp:mm}/day=!{timestamp:dd}/',
        bufferingInterval: cdk.Duration.minutes(5),
        /*compression: destinations.Compression.SNAPPY*/   
      })
      
      const DeliveryStream = new kinesis.DeliveryStream(this, 'rawBucket', {
        destinations: [s3destination],
      })

      const fetchProcessData = new lambdanodejs.NodejsFunction(this, `${id}` + 'DataLambda',{
        runtime: lambda.Runtime.NODEJS_14_X,
        environment: {
          DELIVERYSTREAM_NAME: DeliveryStream.deliveryStreamName
        }
      })

      DeliveryStream.grantPutRecords(fetchProcessData)

      rawBucket.grantPut(DeliveryStream)
 
      const eventRule = new events.Rule(this, 'scheduleRule', {
        schedule: events.Schedule.cron({ minute: '/3'}),
      });
      eventRule.addTarget(new targets.LambdaFunction(fetchProcessData))
    })
  }
}
