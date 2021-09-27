import * as cdk from '@aws-cdk/core';
import { Bucket } from '@aws-cdk/aws-s3';
import * as kinesis from '@aws-cdk/aws-kinesisfirehose';
import * as destinations from '@aws-cdk/aws-kinesisfirehose-destinations';

export class AwsCdkEnergyProductionIoTStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const sevRawBucket = new Bucket(this, 'sevRawBucket')
    
    const s3destination = new destinations.S3Bucket(sevRawBucket) 

    const sevDeliveryStream = new kinesis.DeliveryStream(this, 'sevRawBucket', {
      destinations: [s3destination],
    })
  }
}
