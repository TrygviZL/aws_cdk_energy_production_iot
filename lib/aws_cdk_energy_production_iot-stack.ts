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

    const sevRawBucket = new Bucket(this, 'sevRawBucket')

    const s3destination = new destinations.S3Bucket(sevRawBucket) 

    const sevDeliveryStream = new kinesis.DeliveryStream(this, 'sevRawBucket', {
      destinations: [s3destination],
    })

    const fetchProcessSevData = new lambdanodejs.NodejsFunction(this, 'sevDataLambda',{
      runtime: lambda.Runtime.NODEJS_14_X,
      environment: {
        DELIVERYSTREAM_NAME: sevDeliveryStream.deliveryStreamName
      }
    })

    sevDeliveryStream.grantPutRecords(fetchProcessSevData)

    sevRawBucket.grantPut(sevDeliveryStream)
 
    const eventRule = new events.Rule(this, 'scheduleRule', {
      schedule: events.Schedule.cron({ minute: '/3'}),
    });
    eventRule.addTarget(new targets.LambdaFunction(fetchProcessSevData))
  }
}
