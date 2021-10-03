import * as aws from 'aws-sdk'
import { getApiData, parseVornData } from './data-utils'
const deliveryStream = new aws.Firehose()

export const handler = async(event:any) => {
  console.log("request:", JSON.stringify(event, undefined, 2));
 
  const options = {
    hostname: 'www.vedrid.fo',
    path: '/Home/WeatherStationLatestData/',
    method: 'GET',
  }

  const response = await getApiData(options)
  console.log('RESPONSE: %j', response)

  const params = parseVornData(response, process.env.DELIVERYSTREAM_NAME!)
  console.log('PARAMS: %j', params)
  
  return deliveryStream.putRecordBatch(params).promise()
    .then(() => {
      console.log('Record written to stream')
    })
    .catch((err) => {
      console.log(err)
   })
}

