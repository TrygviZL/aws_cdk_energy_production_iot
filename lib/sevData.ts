import * as aws from 'aws-sdk'
import * as https from 'https'
const deliveryStream = new aws.Firehose()

interface httpoptions {
  hostname: string
  path: string
  method: string
}

export const handler = async(event:any) => {
  console.log("request:", JSON.stringify(event, undefined, 2));
 
  const options = {
    hostname: 'www.sev.fo',
    path: '/api/realtimemap/now',
    method: 'GET',
  }

  var response = await getSevData(options)
  console.log('API RESPONSE: %j', response)

  var params = await parseSevData(response, process.env.DELIVERYSTREAM_NAME!)
  console.log('PARAMS: %j', params)

  return deliveryStream.putRecord(params).promise()
    .then(() => {
      console.log('Record written to stream')
    })
    .catch((err) => {
      console.log(err)
   })
}

export const getSevData = async(options:httpoptions) => {
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

export const parseSevData = async(data:any, deliveryStreamName: string): Promise<aws.Firehose.PutRecordInput> => {
  var dataJSONed = JSON.parse(data)
  
  var sevData = {
    Datestamp: dataJSONed.tiden.split(" ")[0],
    Timestamp: dataJSONed.tiden.split(" ")[1],
    Oil_Sum: dataJSONed.OlieSev_E.replace(/,/g, '.'),
    Water_Sum: dataJSONed.VandSev_E.replace(/,/g, '.'),
    Wind_Sum: dataJSONed.VindSev_E.replace(/,/g, '.'),
    Biogas_Sum: dataJSONed.BiogasSev_E.replace(/,/g, '.'),
    Sun_Sum: dataJSONed.SolSev_E.replace(/,/g, '.'),
    Wind_Neshagi: dataJSONed.NeVind_E.replace(/,/g, '.'),
    Wind_Husahagi: dataJSONed.HhVind_E.replace(/,/g, '.'),
    Wind_Porkeri: dataJSONed.PoVind_E.replace(/,/g, '.'),
    Wind_Rokt: dataJSONed.RoVind_E.replace(/,/g, '.'),
    Sun_Sumba: dataJSONed.SuSol_E.replace(/,/g, '.')      
  }

  var params = {
    DeliveryStreamName: deliveryStreamName,
    Record: {
      Data: JSON.stringify(sevData), 
    }
  }

  return params
}
