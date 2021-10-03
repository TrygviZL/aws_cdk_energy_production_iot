import * as aws from 'aws-sdk'
import * as https from 'https'
import { httpoptions, vornResponse, sevResponse } from './data-utils.test'

export const getApiData = async(options:httpoptions): Promise<any> => {
  return new Promise((resolve) => {
    https.request(options, res => {
      let data:any = []
      res.on("data", chunk => {
        data.push(chunk)
      })
      res.on("end",() => {
        data = Buffer.concat(data).toString()
        resolve(data)
      })
    }).end()
  })
}

export const parseSevData = (data:sevResponse, deliveryStreamName: string): aws.Firehose.PutRecordInput => {
  
  var params = {
    DeliveryStreamName: deliveryStreamName,
    Record: {
      Data: JSON.stringify(data) + '\n', 
    }
  }

  return params
}

export const parseVornData = (data:vornResponse, deliveryStreamName: string): aws.Firehose.PutRecordBatchInput => {

  /*Using firehose sdk putRecordBatch, we need to add 'Data' to JSON object*/
  const weatherRecords = data.weatherStations.map( (weatherRecord) => {
      return {
        Data: weatherRecord 
        }
      }
    )

  const params = {
    DeliveryStreamName: deliveryStreamName,
    Records: weatherRecords,
  }

  return params
}
 
