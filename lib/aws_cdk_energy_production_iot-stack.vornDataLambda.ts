import * as aws from 'aws-sdk'
import { getApiData, parseSevData } from './data-utils'
const deliveryStream = new aws.Firehose()

export const handler = async(event:any) => {
  console.log("request:", JSON.stringify(event, undefined, 2));
 
  const options = {
    hostname: 'www.vedrid.fo',
    path: '/Home/WeatherStationLatestData/',
    method: 'GET',
  }

  var response = await getApiData(options)
  console.log('RESPONSE: %j', response)

  var params = await parseVornData(response, process.env.DELIVERYSTREAM_NAME!)
  console.log('PARAMS: %j', params)

  return deliveryStream.putRecord(params).promise()
    .then(() => {
      console.log('Record written to stream')
    })
    .catch((err) => {
      console.log(err)
   })
}

