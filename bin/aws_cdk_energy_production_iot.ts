#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { AwsCdkEnergyProductionIoTStack } from '../lib/aws_cdk_energy_production_iot-stack';

const app = new cdk.App();
new AwsCdkEnergyProductionIoTStack(app, 'AwsCdkEnergyProductionIoTStack');
